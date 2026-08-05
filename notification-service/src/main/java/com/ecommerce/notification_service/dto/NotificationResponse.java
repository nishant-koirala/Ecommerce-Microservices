package com.ecommerce.notification_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {

    private Long id;
    private Long userId;
    private Long orderId;
    private Long paymentId;
    private String message;
    private String type;
    private LocalDateTime createdAt;
    private boolean read;
}
