package com.ecommerce.notification_service.service;

import com.ecommerce.notification_service.event.PaymentEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

@Service
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Autowired
    public NotificationConsumer(NotificationService notificationService, ObjectMapper objectMapper) {
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(topics = "payment.completed")
    public void consume(String payload) {
        try {
            PaymentEvent event = objectMapper.readValue(payload, PaymentEvent.class);
            log.info("Received payment.completed event: payment={} order={} user={} amount={}",
                    event.getPaymentId(), event.getOrderId(), event.getUserId(), event.getAmount());
            notificationService.create(event);
        } catch (Exception e) {
            // Log and skip; an unparseable message must not poison the consumer loop.
            log.error("Failed to process payment.completed message: {}", payload, e);
        }
    }
}
