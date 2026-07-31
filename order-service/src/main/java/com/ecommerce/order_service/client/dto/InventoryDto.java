package com.ecommerce.order_service.client.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryDto {

    private Long id;
    private Long productId;
    private Integer quantityAvailable;
    private Integer quantityReserved;
}
