package com.ecommerce.order_service.client.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDto {

    private Long id;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private String status;
    private LocalDateTime createdAt;
}
