package com.ecommerce.payment_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic paymentCompletedTopic() {
        return new NewTopic("payment.completed", 1, (short) 1);
    }

    @Bean
    public NewTopic paymentRefundedTopic() {
        return new NewTopic("payment.refunded", 1, (short) 1);
    }
}
