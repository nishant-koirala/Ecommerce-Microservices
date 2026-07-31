package com.ecommerce.order_service.model;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PAYMENT_FAILED,
    CANCELLED,
    SHIPPED,
    DELIVERED
}
