package com.ecommerce.inventory_service.service;

import com.ecommerce.inventory_service.dto.CreateInventoryRequest;
import com.ecommerce.inventory_service.dto.InventoryResponse;
import com.ecommerce.inventory_service.dto.ReserveStockRequest;
import com.ecommerce.inventory_service.exception.InsufficientStockException;
import com.ecommerce.inventory_service.exception.ResourceNotFoundException;
import com.ecommerce.inventory_service.model.Inventory;
import com.ecommerce.inventory_service.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;

    @Autowired
    public InventoryService(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    public InventoryResponse createInventory(CreateInventoryRequest request) {
        if (inventoryRepository.findByProductId(request.getProductId()).isPresent()) {
            throw new IllegalArgumentException("Inventory already exists for product id: " + request.getProductId());
        }

        Inventory inventory = Inventory.builder()
                .productId(request.getProductId())
                .quantityAvailable(request.getQuantityAvailable())
                .quantityReserved(0)
                .build();

        Inventory saved = inventoryRepository.save(inventory);
        return toResponse(saved);
    }

    public InventoryResponse getInventoryByProductId(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("No inventory found for product id: " + productId));
        return toResponse(inventory);
    }

    @Retryable(
        retryFor = ObjectOptimisticLockingFailureException.class,
        maxAttempts = 5,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    @Transactional
    public InventoryResponse reserveStock(ReserveStockRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("No inventory found for product id: " + request.getProductId()));

        int available = inventory.getQuantityAvailable() - inventory.getQuantityReserved();

        if (available < request.getQuantity()) {
            throw new InsufficientStockException(
                "Insufficient stock for product id: " + request.getProductId() +
                ". Available: " + available + ", Requested: " + request.getQuantity()
            );
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() + request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);
        return toResponse(saved);
    }

    @Retryable(
        retryFor = ObjectOptimisticLockingFailureException.class,
        maxAttempts = 5,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    @Transactional
    public InventoryResponse releaseStock(ReserveStockRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("No inventory found for product id: " + request.getProductId()));

        int newReserved = Math.max(0, inventory.getQuantityReserved() - request.getQuantity());
        inventory.setQuantityReserved(newReserved);
        Inventory saved = inventoryRepository.save(inventory);
        return toResponse(saved);
    }

    @Retryable(
        retryFor = ObjectOptimisticLockingFailureException.class,
        maxAttempts = 5,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    @Transactional
    public InventoryResponse confirmDeduction(ReserveStockRequest request) {
        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("No inventory found for product id: " + request.getProductId()));

        if (inventory.getQuantityReserved() < request.getQuantity()) {
            throw new IllegalArgumentException(
                "Cannot confirm deduction: reserved quantity is less than requested amount for product id: " + request.getProductId()
            );
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() - request.getQuantity());
        inventory.setQuantityAvailable(inventory.getQuantityAvailable() - request.getQuantity());
        Inventory saved = inventoryRepository.save(inventory);
        return toResponse(saved);
    }

    private InventoryResponse toResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .quantityAvailable(inventory.getQuantityAvailable())
                .quantityReserved(inventory.getQuantityReserved())
                .build();
    }
}
