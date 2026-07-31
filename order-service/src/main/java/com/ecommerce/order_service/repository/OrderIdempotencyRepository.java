package com.ecommerce.order_service.repository;

import com.ecommerce.order_service.model.OrderIdempotency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderIdempotencyRepository extends JpaRepository<OrderIdempotency, Long> {

    Optional<OrderIdempotency> findByUserIdAndIdempotencyKey(Long userId, String idempotencyKey);
}
