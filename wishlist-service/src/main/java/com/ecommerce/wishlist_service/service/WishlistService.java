package com.ecommerce.wishlist_service.service;

import com.ecommerce.wishlist_service.client.UserServiceClient;
import com.ecommerce.wishlist_service.client.dto.UserDto;
import com.ecommerce.wishlist_service.dto.AddToWishlistRequest;
import com.ecommerce.wishlist_service.dto.WishlistItemResponse;
import com.ecommerce.wishlist_service.exception.ForbiddenException;
import com.ecommerce.wishlist_service.model.WishlistItem;
import com.ecommerce.wishlist_service.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final UserServiceClient userServiceClient;

    @Autowired
    public WishlistService(WishlistItemRepository wishlistItemRepository, UserServiceClient userServiceClient) {
        this.wishlistItemRepository = wishlistItemRepository;
        this.userServiceClient = userServiceClient;
    }

    @Transactional(readOnly = true)
    public List<WishlistItemResponse> getByUser(Long userId, String userEmail) {
        verifyOwner(userId, userEmail);
        return wishlistItemRepository.findByUserIdOrderByAddedAtDesc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getCount(Long userId, String userEmail) {
        verifyOwner(userId, userEmail);
        return wishlistItemRepository.countByUserId(userId);
    }

    @Transactional
    public WishlistItemResponse add(AddToWishlistRequest request, String userEmail) {
        verifyOwner(request.getUserId(), userEmail);
        WishlistItem item = wishlistItemRepository.findByUserIdAndProductId(request.getUserId(), request.getProductId())
                .orElseGet(() -> WishlistItem.builder()
                        .userId(request.getUserId())
                        .productId(request.getProductId())
                        .build());
        return toResponse(wishlistItemRepository.save(item));
    }

    @Transactional
    public void remove(Long userId, Long productId, String userEmail) {
        verifyOwner(userId, userEmail);
        wishlistItemRepository.deleteByUserIdAndProductId(userId, productId);
    }

    private void verifyOwner(Long userId, String userEmail) {
        UserDto caller = userServiceClient.getUserByEmail(userEmail);
        if (!caller.getId().equals(userId)) {
            throw new ForbiddenException("You can only manage your own wishlist");
        }
    }

    private WishlistItemResponse toResponse(WishlistItem item) {
        return WishlistItemResponse.builder()
                .id(item.getId())
                .userId(item.getUserId())
                .productId(item.getProductId())
                .addedAt(item.getAddedAt())
                .build();
    }
}
