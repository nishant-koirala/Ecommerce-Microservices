package com.ecommerce.cart_service.service;

import com.ecommerce.cart_service.client.OrderServiceClient;
import com.ecommerce.cart_service.client.UserServiceClient;
import com.ecommerce.cart_service.client.dto.CreateOrderItemRequest;
import com.ecommerce.cart_service.client.dto.CreateOrderRequest;
import com.ecommerce.cart_service.client.dto.OrderResponse;
import com.ecommerce.cart_service.client.dto.UserDto;
import com.ecommerce.cart_service.dto.AddToCartRequest;
import com.ecommerce.cart_service.dto.CartItemResponse;
import com.ecommerce.cart_service.dto.CheckoutResponse;
import com.ecommerce.cart_service.dto.UpdateQuantityRequest;
import com.ecommerce.cart_service.exception.CartEmptyException;
import com.ecommerce.cart_service.exception.ForbiddenException;
import com.ecommerce.cart_service.exception.ResourceNotFoundException;
import com.ecommerce.cart_service.model.CartItem;
import com.ecommerce.cart_service.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserServiceClient userServiceClient;
    private final OrderServiceClient orderServiceClient;
    private final TransactionTemplate transactionTemplate;

    @Autowired
    public CartService(CartItemRepository cartItemRepository,
                       UserServiceClient userServiceClient,
                       OrderServiceClient orderServiceClient,
                       PlatformTransactionManager transactionManager) {
        this.cartItemRepository = cartItemRepository;
        this.userServiceClient = userServiceClient;
        this.orderServiceClient = orderServiceClient;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
    }

    public List<CartItemResponse> getCartByUserId(Long userId) {
        return cartItemRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CartItemResponse addToCart(AddToCartRequest request) {
        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(
                request.getUserId(), request.getProductId());

        CartItem cartItem;
        if (existing.isPresent()) {
            cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + request.getQuantity());
        } else {
            cartItem = CartItem.builder()
                    .userId(request.getUserId())
                    .productId(request.getProductId())
                    .quantity(request.getQuantity())
                    .build();
        }

        CartItem saved = cartItemRepository.save(cartItem);
        return toResponse(saved);
    }

    public CartItemResponse updateQuantity(Long userId, Long productId, UpdateQuantityRequest request) {
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Cart item not found for user id: " + userId + " and product id: " + productId));

        cartItem.setQuantity(request.getQuantity());
        CartItem saved = cartItemRepository.save(cartItem);
        return toResponse(saved);
    }

    public void removeFromCart(Long userId, Long productId) {
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Cart item not found for user id: " + userId + " and product id: " + productId));
        cartItemRepository.delete(cartItem);
    }

    public CheckoutResponse checkout(Long userId, String userEmail, String idempotencyKey) {
        UserDto owner;
        try {
            owner = userServiceClient.getUserByEmail(userEmail);
        } catch (Exception e) {
            throw new ForbiddenException("Unable to verify cart owner");
        }
        if (owner == null || !owner.getId().equals(userId)) {
            throw new ForbiddenException("You are not allowed to checkout this cart");
        }

        List<CartItem> items = cartItemRepository.findByUserId(userId);
        boolean hasKey = idempotencyKey != null && !idempotencyKey.isBlank();
        if (items.isEmpty() && !hasKey) {
            throw new CartEmptyException("Cart is empty for user id: " + userId);
        }

        CreateOrderRequest request = CreateOrderRequest.builder()
                .userId(userId)
                .items(items.stream()
                        .map(item -> CreateOrderItemRequest.builder()
                                .productId(item.getProductId())
                                .quantity(item.getQuantity())
                                .build())
                        .collect(Collectors.toList()))
                .build();

        OrderResponse order = orderServiceClient.createOrder(request, hasKey ? idempotencyKey.trim() : null);
        // Clear the cart in its own short transaction; the external createOrder call above
        // stays outside any DB transaction (holding a connection across HTTP is an anti-pattern).
        // Skip clearing when items were already empty (replay with key).
        if (!items.isEmpty()) {
            transactionTemplate.executeWithoutResult(status -> cartItemRepository.deleteByUserId(userId));
        }

        return CheckoutResponse.builder()
                .orderId(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .build();
    }

    private CartItemResponse toResponse(CartItem cartItem) {
        return CartItemResponse.builder()
                .id(cartItem.getId())
                .userId(cartItem.getUserId())
                .productId(cartItem.getProductId())
                .quantity(cartItem.getQuantity())
                .build();
    }
}
