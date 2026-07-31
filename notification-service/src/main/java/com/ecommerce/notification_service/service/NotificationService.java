package com.ecommerce.notification_service.service;

import com.ecommerce.notification_service.dto.NotificationResponse;
import com.ecommerce.notification_service.event.OrderEvent;
import com.ecommerce.notification_service.event.PaymentEvent;
import com.ecommerce.notification_service.exception.ResourceNotFoundException;
import com.ecommerce.notification_service.model.Notification;
import com.ecommerce.notification_service.model.NotificationType;
import com.ecommerce.notification_service.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public NotificationResponse create(PaymentEvent event) {
        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .orderId(event.getOrderId())
                .paymentId(event.getPaymentId())
                .message("Payment of " + event.getAmount() + " for order " + event.getOrderId() + " was successful.")
                .type(NotificationType.PAYMENT_SUCCESS)
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse createOrderConfirmed(OrderEvent event) {
        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .orderId(event.getOrderId())
                .paymentId(event.getPaymentId())
                .message("Your order " + event.getOrderId() + " has been confirmed.")
                .type(NotificationType.ORDER_CONFIRMED)
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse createRefunded(PaymentEvent event) {
        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .orderId(event.getOrderId())
                .paymentId(event.getPaymentId())
                .message("Payment of " + event.getAmount() + " for order " + event.getOrderId() + " was refunded.")
                .type(NotificationType.PAYMENT_REFUNDED)
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional(readOnly = true)
    public NotificationResponse getById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        return toResponse(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getByUserId(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getAll() {
        return notificationRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .orderId(notification.getOrderId())
                .paymentId(notification.getPaymentId())
                .message(notification.getMessage())
                .type(notification.getType().name())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
