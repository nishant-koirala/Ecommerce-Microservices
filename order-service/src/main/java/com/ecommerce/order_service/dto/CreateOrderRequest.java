package com.ecommerce.order_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateOrderRequest {

    @NotNull
    private Long userId;

    @Valid
    private List<CreateOrderItemRequest> items;

    /** Optional — only validated when present (kept nullable for older callers). */
    @Valid
    private ShippingAddress shippingAddress;
}
