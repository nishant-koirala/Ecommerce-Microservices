package com.ecommerce.cart_service.client.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Shipping address captured at checkout, forwarded from the cart endpoint to
 * order-service via the Feign client. Mirrors order-service's ShippingAddress.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddress {

    private String fullName;
    private String address1;
    private String address2;
    private String city;
    private String state;
    private String zip;
    private String country;
}
