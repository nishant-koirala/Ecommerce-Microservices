package com.ecommerce.order_service.client;

import com.ecommerce.order_service.client.dto.InventoryDto;
import com.ecommerce.order_service.client.dto.ReserveRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "inventory-service", url = "http://localhost:8083")
public interface InventoryServiceClient {

    @PostMapping("/api/v1/inventory/reserve")
    InventoryDto reserveStock(@RequestBody ReserveRequest request);

    @PostMapping("/api/v1/inventory/release")
    InventoryDto releaseStock(@RequestBody ReserveRequest request);
}
