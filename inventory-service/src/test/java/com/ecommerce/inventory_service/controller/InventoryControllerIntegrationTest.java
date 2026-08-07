package com.ecommerce.inventory_service.controller;

import com.ecommerce.inventory_service.model.Inventory;
import com.ecommerce.inventory_service.repository.InventoryRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class InventoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private InventoryRepository inventoryRepository;

    private static final long[] TEST_PRODUCT_IDS = {
            1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009
    };

    @BeforeEach
    @AfterEach
    void cleanUp() {
        // Delete only the test's own rows so real dev data (products 1, 2, 777, 778) is untouched.
        for (long productId : TEST_PRODUCT_IDS) {
            inventoryRepository.findByProductId(productId).ifPresent(inventoryRepository::delete);
        }
    }

    private Inventory inventory(long productId, int available, int reserved) {
        return Inventory.builder()
                .productId(productId)
                .quantityAvailable(available)
                .quantityReserved(reserved)
                .build();
    }

    @Test
    void createInventory_returns201WithReservedZero() throws Exception {
        mockMvc.perform(post("/api/v1/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1001, \"quantityAvailable\": 50}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.productId").value(1001))
                .andExpect(jsonPath("$.quantityAvailable").value(50))
                .andExpect(jsonPath("$.quantityReserved").value(0));
    }

    @Test
    void createInventory_duplicateProduct_returns409() throws Exception {
        inventoryRepository.save(inventory(1002, 10, 0));

        mockMvc.perform(post("/api/v1/inventory")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1002, \"quantityAvailable\": 5}"))
                .andExpect(status().isConflict());
    }

    @Test
    void getInventoryByProductId_returns200() throws Exception {
        inventoryRepository.save(inventory(1003, 25, 5));

        mockMvc.perform(get("/api/v1/inventory/product/{productId}", 1003))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(1003))
                .andExpect(jsonPath("$.quantityAvailable").value(25))
                .andExpect(jsonPath("$.quantityReserved").value(5));
    }

    @Test
    void getInventoryByProductId_missing_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/inventory/product/{productId}", 999999))
                .andExpect(status().isNotFound());
    }

    @Test
    void reserveStock_movesUnitsToReserved() throws Exception {
        inventoryRepository.save(inventory(1004, 10, 0));

        mockMvc.perform(post("/api/v1/inventory/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1004, \"quantity\": 3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityAvailable").value(10))
                .andExpect(jsonPath("$.quantityReserved").value(3));

        Inventory persisted = inventoryRepository.findByProductId(1004L).orElseThrow();
        assertThat(persisted.getQuantityReserved()).isEqualTo(3);
    }

    @Test
    void reserveStock_insufficient_returns409() throws Exception {
        inventoryRepository.save(inventory(1005, 10, 0));

        mockMvc.perform(post("/api/v1/inventory/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1005, \"quantity\": 11}"))
                .andExpect(status().isConflict());
    }

    @Test
    void releaseStock_movesUnitsBack() throws Exception {
        inventoryRepository.save(inventory(1006, 10, 4));

        mockMvc.perform(post("/api/v1/inventory/release")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1006, \"quantity\": 4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityAvailable").value(10))
                .andExpect(jsonPath("$.quantityReserved").value(0));
    }

    @Test
    void restock_returnsToPool() throws Exception {
        inventoryRepository.save(inventory(1007, 10, 3));

        // Restock 5: 3 unlock from reserved, remaining 2 add to available.
        mockMvc.perform(post("/api/v1/inventory/restock")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1007, \"quantity\": 5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityAvailable").value(12))
                .andExpect(jsonPath("$.quantityReserved").value(0));
    }

    @Test
    void confirmDeduction_decrementsBoth() throws Exception {
        inventoryRepository.save(inventory(1008, 10, 3));

        mockMvc.perform(post("/api/v1/inventory/confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1008, \"quantity\": 3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantityAvailable").value(7))
                .andExpect(jsonPath("$.quantityReserved").value(0));
    }

    @Test
    void reserveStock_validationFails_returns400() throws Exception {
        inventoryRepository.save(inventory(1009, 10, 0));

        mockMvc.perform(post("/api/v1/inventory/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1009, \"quantity\": 0}"))
                .andExpect(status().isBadRequest());
    }
}
