package com.ecommerce.review_service.service;

import com.ecommerce.review_service.client.UserServiceClient;
import com.ecommerce.review_service.client.dto.UserDto;
import com.ecommerce.review_service.dto.ReviewRequest;
import com.ecommerce.review_service.dto.ReviewResponse;
import com.ecommerce.review_service.dto.ReviewSummary;
import com.ecommerce.review_service.exception.ForbiddenException;
import com.ecommerce.review_service.exception.ResourceNotFoundException;
import com.ecommerce.review_service.model.Review;
import com.ecommerce.review_service.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserServiceClient userServiceClient;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, UserServiceClient userServiceClient) {
        this.reviewRepository = reviewRepository;
        this.userServiceClient = userServiceClient;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewSummary> getSummary(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return List.of();
        }
        Map<Long, List<Review>> byProduct = reviewRepository.findByProductIdIn(productIds).stream()
                .collect(Collectors.groupingBy(Review::getProductId));
        return byProduct.entrySet().stream()
                .map(entry -> {
                    List<Review> reviews = entry.getValue();
                    double avg = Math.round(reviews.stream().mapToInt(Review::getRating).average().orElse(0.0) * 10.0) / 10.0;
                    return ReviewSummary.builder()
                            .productId(entry.getKey())
                            .avgRating(avg)
                            .reviewCount(reviews.size())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewResponse upsert(ReviewRequest request, String userEmail) {
        UserDto caller = verifyOwner(request.getUserId(), userEmail);
        Review review = reviewRepository.findByUserIdAndProductId(request.getUserId(), request.getProductId())
                .orElseGet(() -> Review.builder()
                        .userId(request.getUserId())
                        .productId(request.getProductId())
                        .build());
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setComment(request.getComment());
        review.setReviewerName((caller.getFirstName() + " " + caller.getLastName()).trim());
        return toResponse(reviewRepository.save(review));
    }

    @Transactional
    public void delete(Long id, String userEmail) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        UserDto caller = userServiceClient.getUserByEmail(userEmail);
        if (!caller.getId().equals(review.getUserId())) {
            throw new ForbiddenException("You can only delete your own reviews");
        }
        reviewRepository.delete(review);
    }

    private UserDto verifyOwner(Long userId, String userEmail) {
        UserDto caller = userServiceClient.getUserByEmail(userEmail);
        if (!caller.getId().equals(userId)) {
            throw new ForbiddenException("You can only manage your own reviews");
        }
        return caller;
    }

    private ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .rating(review.getRating())
                .title(review.getTitle())
                .comment(review.getComment())
                .reviewerName(review.getReviewerName())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
