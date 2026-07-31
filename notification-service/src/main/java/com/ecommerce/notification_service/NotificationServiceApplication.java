package com.ecommerce.notification_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

import java.util.TimeZone;

@EnableKafka
@SpringBootApplication
public class NotificationServiceApplication {

	public static void main(String[] args) {
		// pgjdbc sends the JVM default timezone in the connection startup packet, and this
		// machine's JVM resolves "Asia/Katmandu", which Postgres rejects. Pin UTC so the
		// driver never sends an invalid value.
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		SpringApplication.run(NotificationServiceApplication.class, args);
	}

}
