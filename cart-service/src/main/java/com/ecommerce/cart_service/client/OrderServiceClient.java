package com.ecommerce.cart_service.client;

import com.ecommerce.cart_service.client.dto.CreateOrderRequest;
import com.ecommerce.cart_service.client.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "order-service", url = "http://localhost:8085")
public interface OrderServiceClient {

    @PostMapping("/api/v1/orders")
    OrderResponse createOrder(@RequestBody CreateOrderRequest request,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey);
}
