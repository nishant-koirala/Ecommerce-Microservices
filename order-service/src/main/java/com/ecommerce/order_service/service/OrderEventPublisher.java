package com.ecommerce.order_service.service;

import com.ecommerce.order_service.event.OrderEvent;
import com.ecommerce.order_service.model.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;

@Service
public class OrderEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OrderEventPublisher.class);
    private static final String TOPIC = "order.confirmed";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Autowired
    public OrderEventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publish(Order order) {
        OrderEvent event = OrderEvent.builder()
                .orderId(order.getId())
                .userId(order.getUserId())
                .amount(order.getTotalAmount())
                .status(order.getStatus().name())
                .paymentId(order.getPaymentId())
                .timestamp(LocalDateTime.now())
                .build();
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(TOPIC, String.valueOf(event.getOrderId()), payload)
                    .exceptionally(ex -> {
                        log.error("Failed to publish order event to Kafka for order {}", event.getOrderId(), ex);
                        return null;
                    });
        } catch (Exception e) {
            // A Kafka failure must never fail the order flow.
            log.error("Failed to publish order event to Kafka for order {}", event.getOrderId(), e);
        }
    }
}
