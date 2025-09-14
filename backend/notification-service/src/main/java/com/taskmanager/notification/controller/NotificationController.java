package com.taskmanager.notification.controller;

import com.taskmanager.notification.dto.NotificationResponse;
import com.taskmanager.notification.entity.Notification;
import com.taskmanager.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotifications(@RequestHeader("X-User-Id") Long userId) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<NotificationResponse>> getUserNotificationsPaginated(
            @RequestHeader("X-User-Id") Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<NotificationResponse> notifications = notificationService.getUserNotificationsPaginated(userId, page, size);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotifications(@RequestHeader("X-User-Id") Long userId) {
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/count/unread")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@RequestHeader("X-User-Id") Long userId) {
        long unreadCount = notificationService.getUnreadCount(userId);

        Map<String, Long> response = new HashMap<>();
        response.put("unreadCount", unreadCount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByType(
            @PathVariable Notification.NotificationType type,
            @RequestHeader("X-User-Id") Long userId) {
        List<NotificationResponse> notifications = notificationService.getNotificationsByType(userId, type);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable Long id,
                                                          @RequestHeader("X-User-Id") Long userId) {
        NotificationResponse notification = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, String>> markAllAsRead(@RequestHeader("X-User-Id") Long userId) {
        notificationService.markAllAsRead(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id,
                                                                 @RequestHeader("X-User-Id") Long userId) {
        notificationService.deleteNotification(id, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/read")
    public ResponseEntity<Map<String, String>> deleteReadNotifications(@RequestHeader("X-User-Id") Long userId) {
        notificationService.deleteReadNotifications(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Read notifications deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/process-unsent")
    public ResponseEntity<Map<String, String>> processUnsentNotifications() {
        notificationService.processUnsentNotifications();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Unsent notifications processed successfully");
        return ResponseEntity.ok(response);
    }
}