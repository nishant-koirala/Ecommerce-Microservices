package com.ecommerce.notification_service.controller;

import com.ecommerce.notification_service.dto.NotificationResponse;
import com.ecommerce.notification_service.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getByUserId(@PathVariable Long userId,
                                                                  @RequestHeader("X-User-Email") String userEmail) {
        return ResponseEntity.ok(notificationService.getByUserId(userId, userEmail));
    }

    @PostMapping("/user/{userId}/read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId,
                                              @RequestHeader("X-User-Email") String userEmail) {
        notificationService.markAllAsRead(userId, userEmail);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId,
                                               @RequestHeader("X-User-Email") String userEmail) {
        return ResponseEntity.ok(notificationService.getUnreadCount(userId, userEmail));
    }
}
