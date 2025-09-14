package com.taskmanager.notification.service;

import com.taskmanager.notification.dto.NotificationResponse;
import com.taskmanager.notification.entity.Notification;
import com.taskmanager.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private EmailService emailService;

    public Notification createNotification(Long userId, String title, String message,
                                         Notification.NotificationType type, String taskId) {
        Notification notification = new Notification(userId, title, message, type);
        notification.setTaskId(taskId);

        Notification savedNotification = notificationRepository.save(notification);

        // Send email notification asynchronously (mock implementation)
        try {
            emailService.sendNotificationEmail(savedNotification);
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }

        return savedNotification;
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return notifications.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
    }

    public Page<NotificationResponse> getUserNotificationsPaginated(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> notificationsPage = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return notificationsPage.map(NotificationResponse::new);
    }

    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
        return notifications.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getNotificationsByType(Long userId, Notification.NotificationType type) {
        List<Notification> notifications = notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
        return notifications.stream()
                .map(NotificationResponse::new)
                .collect(Collectors.toList());
    }

    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return new NotificationResponse(updatedNotification);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);

        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }

        notificationRepository.saveAll(unreadNotifications);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public void deleteReadNotifications(Long userId) {
        notificationRepository.deleteByUserIdAndIsReadTrue(userId);
    }

    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notificationRepository.delete(notification);
    }

    public void processUnsentNotifications() {
        List<Notification> unsentNotifications = notificationRepository.findByIsSentFalseAndEmailSentFalse();

        for (Notification notification : unsentNotifications) {
            try {
                emailService.sendNotificationEmail(notification);
                notification.setSent(true);
                notificationRepository.save(notification);
            } catch (Exception e) {
                System.err.println("Failed to send notification email for ID " + notification.getId() + ": " + e.getMessage());
            }
        }
    }
}