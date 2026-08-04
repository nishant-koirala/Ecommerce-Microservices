package com.ecommerce.order_service.client;

import com.ecommerce.order_service.client.dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "user-service", url = "http://localhost:8091")
public interface UserServiceClient {

    @GetMapping("/api/v1/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);

    @GetMapping("/api/v1/users/email/{email}")
    UserDto getUserByEmail(@PathVariable("email") String email);

    @GetMapping("/api/v1/users")
    List<UserDto> getUsersByIds(@RequestParam("ids") List<Long> ids);
}
