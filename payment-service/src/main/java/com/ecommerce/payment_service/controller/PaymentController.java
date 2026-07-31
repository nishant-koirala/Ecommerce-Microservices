package com.ecommerce.payment_service.controller;

import com.ecommerce.payment_service.dto.CreatePaymentRequest;
import com.ecommerce.payment_service.dto.PaymentResponse;
import com.ecommerce.payment_service.service.PaymentEventPublisher;
import com.ecommerce.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentEventPublisher paymentEventPublisher;

    @Autowired
    public PaymentController(PaymentService paymentService, PaymentEventPublisher paymentEventPublisher) {
        this.paymentService = paymentService;
        this.paymentEventPublisher = paymentEventPublisher;
    }

    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody CreatePaymentRequest request) {
        PaymentResponse payment = paymentService.processPayment(request);
        paymentEventPublisher.publish(payment);
        return ResponseEntity.status(HttpStatus.CREATED).body(payment);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<PaymentResponse> refundPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.refundPayment(id));
    }
}
