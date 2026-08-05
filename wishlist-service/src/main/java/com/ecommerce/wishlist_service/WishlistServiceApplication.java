package com.ecommerce.wishlist_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

import java.util.TimeZone;

@EnableFeignClients
@SpringBootApplication
public class WishlistServiceApplication {

	public static void main(String[] args) {
		// pgjdbc sends the JVM default timezone in the connection startup packet, and this
		// machine's JVM resolves "Asia/Katmandu", which Postgres rejects. Pin UTC so the
		// driver never sends an invalid value.
		TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
		SpringApplication.run(WishlistServiceApplication.class, args);
	}

}
