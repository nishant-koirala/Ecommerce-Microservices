package com.ecommerce.order_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Shipping address captured at checkout. Previously UI-only (stored in
 * localStorage and passed through Angular router state); now persisted on
 * the Order so it survives refresh and is visible to admins.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddress {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Street address is required")
    private String address1;

    private String address2;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "ZIP code is required")
    private String zip;

    @NotBlank(message = "Country is required")
    private String country;
}
