package com.ecommerce.notification_service.service;

import com.ecommerce.notification_service.client.UserServiceClient;
import com.ecommerce.notification_service.client.dto.UserDto;
import com.ecommerce.notification_service.dto.NotificationResponse;
import com.ecommerce.notification_service.event.OrderEvent;
import com.ecommerce.notification_service.event.PaymentEvent;
import com.ecommerce.notification_service.exception.ForbiddenException;
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
    private final UserServiceClient userServiceClient;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository,
                               UserServiceClient userServiceClient) {
        this.notificationRepository = notificationRepository;
        this.userServiceClient = userServiceClient;
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

    @Transactional
    public NotificationResponse createOrderCancelled(OrderEvent event) {
        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .orderId(event.getOrderId())
                .paymentId(event.getPaymentId())
                .message("Your order " + event.getOrderId() + " has been cancelled.")
                .type(NotificationType.ORDER_CANCELLED)
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse createOrderShipped(OrderEvent event) {
        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .orderId(event.getOrderId())
                .paymentId(event.getPaymentId())
                .message("Your order " + event.getOrderId() + " has been shipped.")
                .type(NotificationType.ORDER_SHIPPED)
                .build();
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public NotificationResponse createOrderDelivered(OrderEvent event) {
        Notification notification = Notification.builder()
                .userId(event.getUserId())
                .orderId(event.getOrderId())
                .paymentId(event.getPaymentId())
                .message("Your order " + event.getOrderId() + " has been delivered.")
                .type(NotificationType.ORDER_DELIVERED)
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
    public List<NotificationResponse> getByUserId(Long userId, String userEmail) {
        UserDto caller = userServiceClient.getUserByEmail(userEmail);
        if (!caller.getId().equals(userId)) {
            throw new ForbiddenException("You can only view your own notifications");
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
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
