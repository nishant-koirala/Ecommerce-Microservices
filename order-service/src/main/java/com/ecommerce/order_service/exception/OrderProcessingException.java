package com.ecommerce.order_service.exception;

public class OrderProcessingException extends RuntimeException {

    public OrderProcessingException(String message) {
        super(message);
    }
}
