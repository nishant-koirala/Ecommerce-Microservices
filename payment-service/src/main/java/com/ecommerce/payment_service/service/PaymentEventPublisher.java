package com.ecommerce.payment_service.service;

import com.ecommerce.payment_service.dto.PaymentResponse;
import com.ecommerce.payment_service.event.PaymentEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

@Service
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);
    private static final String TOPIC = "payment.completed";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public PaymentEventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publish(PaymentResponse payment) {
        PaymentEvent event = PaymentEvent.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .userId(payment.getUserId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .timestamp(LocalDateTime.now())
                .build();
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, String.valueOf(event.getOrderId()), payload)
                    .exceptionally(ex -> {
                        log.error("Failed to publish payment event to Kafka for payment {}", event.getPaymentId(), ex);
                        return null;
                    });
        } catch (Exception e) {
            // A Kafka failure must never fail the payment flow.
            log.error("Failed to publish payment event to Kafka for payment {}", event.getPaymentId(), e);
        }
    }
}
