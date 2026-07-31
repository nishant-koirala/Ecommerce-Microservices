package com.ecommerce.order_service.service;

import com.ecommerce.order_service.client.InventoryServiceClient;
import com.ecommerce.order_service.client.PaymentServiceClient;
import com.ecommerce.order_service.client.ProductServiceClient;
import com.ecommerce.order_service.client.UserServiceClient;
import com.ecommerce.order_service.client.dto.CreatePaymentRequest;
import com.ecommerce.order_service.client.dto.PaymentDto;
import com.ecommerce.order_service.client.dto.ProductDto;
import com.ecommerce.order_service.client.dto.ReserveRequest;
import com.ecommerce.order_service.client.dto.UserDto;
import com.ecommerce.order_service.dto.CreateOrderItemRequest;
import com.ecommerce.order_service.dto.CreateOrderRequest;
import com.ecommerce.order_service.dto.OrderItemResponse;
import com.ecommerce.order_service.dto.OrderResponse;
import com.ecommerce.order_service.exception.ForbiddenException;
import com.ecommerce.order_service.exception.OrderProcessingException;
import com.ecommerce.order_service.exception.ResourceNotFoundException;
import com.ecommerce.order_service.model.Order;
import com.ecommerce.order_service.model.OrderItem;
import com.ecommerce.order_service.model.OrderStatus;
import com.ecommerce.order_service.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;
    private final InventoryServiceClient inventoryServiceClient;
    private final UserServiceClient userServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final PlatformTransactionManager transactionManager;
    private final OrderEventPublisher orderEventPublisher;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        ProductServiceClient productServiceClient,
                        InventoryServiceClient inventoryServiceClient,
                        UserServiceClient userServiceClient,
                        PaymentServiceClient paymentServiceClient,
                        PlatformTransactionManager transactionManager,
                        OrderEventPublisher orderEventPublisher) {
        this.orderRepository = orderRepository;
        this.productServiceClient = productServiceClient;
        this.inventoryServiceClient = inventoryServiceClient;
        this.userServiceClient = userServiceClient;
        this.paymentServiceClient = paymentServiceClient;
        this.transactionManager = transactionManager;
        this.orderEventPublisher = orderEventPublisher;
    }

    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders(String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new ForbiddenException("ADMIN role required to list all orders");
        }
        return orderRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, String userEmail) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        UserDto owner = userServiceClient.getUserByEmail(userEmail);
        if (owner == null || !owner.getId().equals(order.getUserId())) {
            throw new ForbiddenException("You are not allowed to cancel this order");
        }
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new OrderProcessingException(
                    "Only CONFIRMED orders can be cancelled, order " + id + " is " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Publish only after commit so a rolled-back cancel never emits a phantom
        // order.cancelled event. Kafka send is fire-and-forget inside the callback.
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                orderEventPublisher.publishCancelled(order);
            }
        });

        // Best-effort external effects, failures swallowed — mirrors the Saga compensation.
        // Restock returns the confirmed units to the available pool (release is a no-op
        // post-confirm, since confirm already consumed both reserved and available).
        for (OrderItem item : order.getItems()) {
            try {
                inventoryServiceClient.restockStock(new ReserveRequest(item.getProductId(), item.getQuantity()));
            } catch (Exception e) {
                log.error("Failed to restock product {} for cancelled order {}", item.getProductId(), id, e);
            }
        }
        if (order.getPaymentId() != null) {
            try {
                paymentServiceClient.refundPayment(order.getPaymentId());
            } catch (Exception e) {
                log.error("Failed to refund payment {} for cancelled order {}", order.getPaymentId(), id, e);
            }
        }
        return toResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        try {
            userServiceClient.getUserById(request.getUserId());
        } catch (Exception e) {
            throw new OrderProcessingException("User not found or unavailable: " + request.getUserId());
        }

        List<OrderItem> reservedItems = new ArrayList<>();
        List<ReserveRequest> successfulReservations = new ArrayList<>();

        BigDecimal totalAmount;
        try {
            totalAmount = BigDecimal.ZERO;

            for (CreateOrderItemRequest itemRequest : request.getItems()) {
                ProductDto product;
                try {
                    product = productServiceClient.getProductById(itemRequest.getProductId());
                } catch (Exception e) {
                    throw new OrderProcessingException(
                        "Product not found or unavailable: " + itemRequest.getProductId());
                }

                ReserveRequest reserveRequest = new ReserveRequest(
                    itemRequest.getProductId(), itemRequest.getQuantity());

                try {
                    inventoryServiceClient.reserveStock(reserveRequest);
                    successfulReservations.add(reserveRequest);
                } catch (Exception e) {
                    throw new OrderProcessingException(
                        "Failed to reserve stock for product: " + itemRequest.getProductId() +
                        ". Reason: insufficient stock or service unavailable.");
                }

                OrderItem orderItem = OrderItem.builder()
                        .productId(product.getId())
                        .productName(product.getName())
                        .quantity(itemRequest.getQuantity())
                        .unitPrice(product.getPrice())
                        .build();

                reservedItems.add(orderItem);
                totalAmount = totalAmount.add(
                    product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));
            }
        } catch (OrderProcessingException e) {
            releaseAll(successfulReservations);
            throw e;
        }

        Order order = Order.builder()
                .userId(request.getUserId())
                .status(OrderStatus.PENDING)
                .totalAmount(totalAmount)
                .build();

        for (OrderItem item : reservedItems) {
            order.addItem(item);
        }

        Order savedOrder = orderRepository.save(order);

        PaymentDto payment = null;
        try {
            payment = paymentServiceClient.processPayment(new CreatePaymentRequest(
                    savedOrder.getId(), request.getUserId(), totalAmount));
            savedOrder.setPaymentId(payment.getId());
            for (ReserveRequest successfulReservation : successfulReservations) {
                inventoryServiceClient.confirmStock(successfulReservation);
            }
            savedOrder.setStatus(OrderStatus.CONFIRMED);
            OrderResponse response = toResponse(orderRepository.save(savedOrder));
            // Publish only after commit so a rolled-back order never emits a phantom
            // order.confirmed event. Kafka send is fire-and-forget inside the callback.
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    orderEventPublisher.publish(savedOrder);
                }
            });
            return response;
        } catch (Exception e) {
            if (payment != null) {
                try {
                    paymentServiceClient.refundPayment(payment.getId());
                } catch (Exception refundException) {
                    // Swallowed: a failed refund leaves the payment visible for manual review,
                    // mirroring the failed reservation-release fallback below.
                }
            }
            releaseAll(successfulReservations);
            persistFailedOrder(request.getUserId(), totalAmount,
                    payment != null ? payment.getId() : null, reservedItems);
            throw new OrderProcessingException("Payment processing failed: " + e.getMessage());
        }
    }

    private void persistFailedOrder(Long userId, BigDecimal totalAmount, Long paymentId,
                                    List<OrderItem> items) {
        // Runs in a separate transaction so the PAYMENT_FAILED record survives the
        // rollback triggered when createOrder rethrows the RuntimeException below.
        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        txTemplate.executeWithoutResult(status -> {
            Order failedOrder = Order.builder()
                    .userId(userId)
                    .status(OrderStatus.PAYMENT_FAILED)
                    .totalAmount(totalAmount)
                    .paymentId(paymentId)
                    .build();
            for (OrderItem item : items) {
                failedOrder.addItem(OrderItem.builder()
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .build());
            }
            orderRepository.save(failedOrder);
        });
    }

    private void releaseAll(List<ReserveRequest> successfulReservations) {
        for (ReserveRequest successfulReservation : successfulReservations) {
            try {
                inventoryServiceClient.releaseStock(successfulReservation);
            } catch (Exception rollbackException) {
                // In production, this would be logged to an error tracking system
                // and potentially queued for manual review, since a failed rollback
                // means stock is stuck as "reserved" incorrectly.
            }
        }
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUserId())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .paymentId(order.getPaymentId())
                .items(itemResponses)
                .build();
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .productId(item.getProductId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .build();
    }
}
