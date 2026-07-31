package com.ecommerce.cart_service.client;

import com.ecommerce.cart_service.client.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "http://localhost:8081")
public interface UserServiceClient {

    @GetMapping("/api/v1/users/email/{email}")
    UserDto getUserByEmail(@PathVariable("email") String email);
}
