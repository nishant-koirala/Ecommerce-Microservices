package com.ecommerce.order_service.client;

import com.ecommerce.order_service.client.dto.CreatePaymentRequest;
import com.ecommerce.order_service.client.dto.PaymentDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", url = "http://localhost:8086")
public interface PaymentServiceClient {

    @PostMapping("/api/v1/payments")
    PaymentDto processPayment(@RequestBody CreatePaymentRequest request);

    @PostMapping("/api/v1/payments/{id}/refund")
    PaymentDto refundPayment(@PathVariable("id") Long id);
}
