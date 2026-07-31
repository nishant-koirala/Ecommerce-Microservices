package com.ecommerce.order_service.service;

import com.ecommerce.order_service.client.InventoryServiceClient;
import com.ecommerce.order_service.client.ProductServiceClient;
import com.ecommerce.order_service.client.dto.ProductDto;
import com.ecommerce.order_service.client.dto.ReserveRequest;
import com.ecommerce.order_service.dto.CreateOrderItemRequest;
import com.ecommerce.order_service.dto.CreateOrderRequest;
import com.ecommerce.order_service.dto.OrderItemResponse;
import com.ecommerce.order_service.dto.OrderResponse;
import com.ecommerce.order_service.exception.OrderProcessingException;
import com.ecommerce.order_service.exception.ResourceNotFoundException;
import com.ecommerce.order_service.model.Order;
import com.ecommerce.order_service.model.OrderItem;
import com.ecommerce.order_service.model.OrderStatus;
import com.ecommerce.order_service.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductServiceClient productServiceClient;
    private final InventoryServiceClient inventoryServiceClient;

    @Autowired
    public OrderService(OrderRepository orderRepository,
                        ProductServiceClient productServiceClient,
                        InventoryServiceClient inventoryServiceClient) {
        this.orderRepository = orderRepository;
        this.productServiceClient = productServiceClient;
        this.inventoryServiceClient = inventoryServiceClient;
    }

    public List<OrderResponse> getOrdersByUserId(Long userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return toResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        List<OrderItem> reservedItems = new ArrayList<>();
        List<ReserveRequest> successfulReservations = new ArrayList<>();

        try {
            BigDecimal totalAmount = BigDecimal.ZERO;

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

            Order order = Order.builder()
                    .userId(request.getUserId())
                    .status(OrderStatus.CONFIRMED)
                    .totalAmount(totalAmount)
                    .build();

            for (OrderItem item : reservedItems) {
                order.addItem(item);
            }

            Order savedOrder = orderRepository.save(order);
            return toResponse(savedOrder);

        } catch (OrderProcessingException e) {
            for (ReserveRequest successfulReservation : successfulReservations) {
                try {
                    inventoryServiceClient.releaseStock(successfulReservation);
                } catch (Exception rollbackException) {
                    // In production, this would be logged to an error tracking system
                    // and potentially queued for manual review, since a failed rollback
                    // means stock is stuck as "reserved" incorrectly.
                }
            }
            throw e;
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
