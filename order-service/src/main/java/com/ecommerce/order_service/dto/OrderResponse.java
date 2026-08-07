package com.ecommerce.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {

    private Long id;
    private Long userId;
    private String customerName;
    private String status;
    private BigDecimal totalAmount;
    private Long paymentId;
    private ShippingAddress shippingAddress;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
