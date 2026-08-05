package com.ecommerce.wishlist_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddToWishlistRequest {

    @NotNull
    private Long userId;

    @NotNull
    private Long productId;
}
