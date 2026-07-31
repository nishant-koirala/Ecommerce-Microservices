package com.ecommerce.order_service.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "order_idempotency",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_user_idempotency_key",
                columnNames = {"user_id", "idempotency_key"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderIdempotency {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "idempotency_key", nullable = false, length = 64)
    private String idempotencyKey;

    @Column(name = "order_id")
    private Long orderId;
}
