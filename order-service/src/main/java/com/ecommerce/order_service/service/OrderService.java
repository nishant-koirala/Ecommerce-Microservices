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
import com.ecommerce.order_service.model.OrderIdempotency;
import com.ecommerce.order_service.model.OrderItem;
import com.ecommerce.order_service.model.OrderStatus;
import com.ecommerce.order_service.repository.OrderIdempotencyRepository;
import com.ecommerce.order_service.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final OrderIdempotencyRepository idempotencyRepository;
    private final ProductServiceClient productServiceClient;
    private final InventoryServiceClient inventoryServiceClient;
    private final UserServiceClient userServiceClient;
    private final PaymentServiceClient paymentServiceClient;
    private final PlatformTransactionManager transactionManager;
    private final OrderEventPublisher orderEventPublisher;
    private final TransactionTemplate idempotencyTxTemplate;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        OrderIdempotencyRepository idempotencyRepository,
                        ProductServiceClient productServiceClient,
                        InventoryServiceClient inventoryServiceClient,
                        UserServiceClient userServiceClient,
                        PaymentServiceClient paymentServiceClient,
                        PlatformTransactionManager transactionManager,
                        OrderEventPublisher orderEventPublisher) {
        this.orderRepository = orderRepository;
        this.idempotencyRepository = idempotencyRepository;
        this.productServiceClient = productServiceClient;
        this.inventoryServiceClient = inventoryServiceClient;
        this.userServiceClient = userServiceClient;
        this.paymentServiceClient = paymentServiceClient;
        this.transactionManager = transactionManager;
        this.orderEventPublisher = orderEventPublisher;
        this.idempotencyTxTemplate = new TransactionTemplate(transactionManager);
        this.idempotencyTxTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
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
    public OrderResponse shipOrder(Long id, String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new ForbiddenException("ADMIN role required to ship orders");
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new OrderProcessingException(
                    "Only CONFIRMED orders can be shipped, order " + id + " is " + order.getStatus());
        }

        order.setStatus(OrderStatus.SHIPPED);
        orderRepository.save(order);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                orderEventPublisher.publishShipped(order);
            }
        });
        return toResponse(order);
    }

    @Transactional
    public OrderResponse deliverOrder(Long id, String userRole) {
        if (!"ADMIN".equals(userRole)) {
            throw new ForbiddenException("ADMIN role required to deliver orders");
        }
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new OrderProcessingException(
                    "Only SHIPPED orders can be delivered, order " + id + " is " + order.getStatus());
        }

        order.setStatus(OrderStatus.DELIVERED);
        orderRepository.save(order);

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                orderEventPublisher.publishDelivered(order);
            }
        });
        return toResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, String idempotencyKey) {
        try {
            userServiceClient.getUserById(request.getUserId());
        } catch (Exception e) {
            throw new OrderProcessingException("User not found or unavailable: " + request.getUserId());
        }

        Long userId = request.getUserId();
        String key = idempotencyKey == null ? null : idempotencyKey.trim();
        boolean hasKey = key != null && !key.isEmpty();

        // Replay: a key already mapped to a completed order returns the original order
        // instead of re-running the saga (no double reserve / double charge).
        if (hasKey) {
            OrderIdempotency existing = idempotencyRepository.findByUserIdAndIdempotencyKey(userId, key)
                    .orElse(null);
            if (existing != null) {
                if (existing.getOrderId() == null) {
                    throw new OrderProcessingException(
                            "Order creation with this key is still in progress, retry shortly");
                }
                return orderRepository.findById(existing.getOrderId())
                        .map(this::toResponse)
                        .orElseThrow(() -> new OrderProcessingException("Order for idempotency key not found"));
            }
        }

        // Enforced here (not via @NotEmpty) so a keyed replay whose cart was already
        // cleared can carry an empty items list into the replay lookup above.
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new OrderProcessingException("Order must contain at least one item");
        }

        // Claim the key in its own REQUIRES_NEW tx: a concurrent same-key insert either
        // fails fast on the unique index (the loser returns the winner's order, never
        // running the saga) or succeeds when the winner's tx rolled back. A violation
        // here must not poison the outer saga transaction.
        OrderIdempotency claim = null;
        if (hasKey) {
            try {
                claim = idempotencyTxTemplate.execute(status -> idempotencyRepository.saveAndFlush(
                        OrderIdempotency.builder().userId(userId).idempotencyKey(key).build()));
            } catch (DataIntegrityViolationException e) {
                OrderIdempotency winner = idempotencyRepository.findByUserIdAndIdempotencyKey(userId, key)
                        .orElseThrow(() -> new OrderProcessingException("Concurrent order creation, retry shortly"));
                if (winner.getOrderId() == null) {
                    throw new OrderProcessingException("Order creation still in progress, retry shortly");
                }
                return orderRepository.findById(winner.getOrderId())
                        .map(this::toResponse)
                        .orElseThrow(() -> new OrderProcessingException("Order for idempotency key not found"));
            }
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
            if (claim != null) {
                Long claimId = claim.getId();
                idempotencyTxTemplate.executeWithoutResult(
                        status -> idempotencyRepository.deleteById(claimId));
            }
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

            // Link the key to the order in the same transaction, so the mapping commits
            // atomically with the CONFIRMED order and a replay returns this order.
            if (claim != null) {
                Long claimId = claim.getId();
                idempotencyRepository.findById(claimId)
                        .ifPresent(c -> {
                            c.setOrderId(savedOrder.getId());
                            idempotencyRepository.save(c);
                        });
            }

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
            // Free the key so a retry can re-run the saga; the rollback of this method's
            // main transaction would otherwise leave the claim (orderId null) in place.
            if (claim != null) {
                Long claimId = claim.getId();
                idempotencyTxTemplate.executeWithoutResult(
                        status -> idempotencyRepository.deleteById(claimId));
            }
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
