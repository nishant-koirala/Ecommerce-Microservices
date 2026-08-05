package com.ecommerce.review_service.controller;

import com.ecommerce.review_service.dto.ReviewRequest;
import com.ecommerce.review_service.dto.ReviewResponse;
import com.ecommerce.review_service.dto.ReviewSummary;
import com.ecommerce.review_service.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    @Autowired
    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewResponse>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getByProduct(productId));
    }

    @GetMapping("/summary")
    public ResponseEntity<List<ReviewSummary>> getSummary(@RequestParam("productIds") List<Long> productIds) {
        return ResponseEntity.ok(reviewService.getSummary(productIds));
    }

    @PostMapping
    public ResponseEntity<ReviewResponse> upsert(@Valid @RequestBody ReviewRequest request,
                                                 @RequestHeader("X-User-Email") String userEmail) {
        return ResponseEntity.ok(reviewService.upsert(request, userEmail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestHeader("X-User-Email") String userEmail) {
        reviewService.delete(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}
