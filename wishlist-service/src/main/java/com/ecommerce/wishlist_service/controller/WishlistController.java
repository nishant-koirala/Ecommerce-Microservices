package com.ecommerce.wishlist_service.controller;

import com.ecommerce.wishlist_service.dto.AddToWishlistRequest;
import com.ecommerce.wishlist_service.dto.WishlistItemResponse;
import com.ecommerce.wishlist_service.service.WishlistService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @Autowired
    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<WishlistItemResponse>> getByUser(@PathVariable Long userId,
                                                                @RequestHeader("X-User-Email") String userEmail) {
        return ResponseEntity.ok(wishlistService.getByUser(userId, userEmail));
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getCount(@PathVariable Long userId,
                                         @RequestHeader("X-User-Email") String userEmail) {
        return ResponseEntity.ok(wishlistService.getCount(userId, userEmail));
    }

    @PostMapping
    public ResponseEntity<WishlistItemResponse> add(@Valid @RequestBody AddToWishlistRequest request,
                                                    @RequestHeader("X-User-Email") String userEmail) {
        return ResponseEntity.ok(wishlistService.add(request, userEmail));
    }

    @DeleteMapping("/user/{userId}/product/{productId}")
    public ResponseEntity<Void> remove(@PathVariable Long userId,
                                       @PathVariable Long productId,
                                       @RequestHeader("X-User-Email") String userEmail) {
        wishlistService.remove(userId, productId, userEmail);
        return ResponseEntity.noContent().build();
    }
}
