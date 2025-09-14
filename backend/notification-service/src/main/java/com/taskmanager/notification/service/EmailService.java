package com.taskmanager.notification.service;

import com.taskmanager.notification.entity.Notification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${app.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${app.email.from:noreply@taskmanager.com}")
    private String fromEmail;

    public void sendNotificationEmail(Notification notification) {
        // Mock email service implementation
        // In a real application, you would integrate with email providers like:
        // - SendGrid
        // - AWS SES
        // - SMTP server
        // - etc.

        if (!emailEnabled) {
            System.out.println("Email service disabled. Simulating email send...");
            simulateEmailSend(notification);
            return;
        }

        try {
            // Mock email sending logic
            String recipient = getUserEmail(notification.getUserId());
            String subject = notification.getTitle();
            String body = buildEmailBody(notification);

            System.out.println("=== SENDING EMAIL ===");
            System.out.println("From: " + fromEmail);
            System.out.println("To: " + recipient);
            System.out.println("Subject: " + subject);
            System.out.println("Body: " + body);
            System.out.println("====================");

            // Simulate email sending delay
            Thread.sleep(100);

            notification.setEmailSent(true);
            System.out.println("Email sent successfully for notification ID: " + notification.getId());

        } catch (Exception e) {
            System.err.println("Failed to send email for notification ID " + notification.getId() + ": " + e.getMessage());
            throw new RuntimeException("Email sending failed", e);
        }
    }

    private void simulateEmailSend(Notification notification) {
        String recipient = getUserEmail(notification.getUserId());
        String subject = notification.getTitle();
        String body = buildEmailBody(notification);

        System.out.println("=== SIMULATED EMAIL ===");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + recipient);
        System.out.println("Subject: " + subject);
        System.out.println("Body: " + body);
        System.out.println("Status: SIMULATED (email disabled)");
        System.out.println("=======================");

        notification.setEmailSent(true);
    }

    private String getUserEmail(Long userId) {
        // Mock user email retrieval
        // In a real application, you would fetch user details from User Service
        // via REST client, Feign client, or database lookup
        return "user" + userId + "@taskmanager.com";
    }

    private String buildEmailBody(Notification notification) {
        StringBuilder body = new StringBuilder();

        body.append("Dear User,\n\n");
        body.append(notification.getMessage()).append("\n\n");

        if (notification.getTaskId() != null) {
            body.append("Task ID: ").append(notification.getTaskId()).append("\n");
        }

        body.append("Notification Type: ").append(notification.getType()).append("\n");
        body.append("Created At: ").append(notification.getCreatedAt()).append("\n\n");

        body.append("Please log in to your Task Manager account to view more details.\n\n");
        body.append("Best regards,\n");
        body.append("Task Manager Team");

        return body.toString();
    }

    public void sendWelcomeEmail(String userEmail, String username) {
        // Mock welcome email
        System.out.println("=== WELCOME EMAIL ===");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + userEmail);
        System.out.println("Subject: Welcome to Task Manager!");
        System.out.println("Body: Welcome " + username + "! Thank you for joining Task Manager.");
        System.out.println("===================");
    }

    public void sendPasswordResetEmail(String userEmail, String resetToken) {
        // Mock password reset email
        System.out.println("=== PASSWORD RESET EMAIL ===");
        System.out.println("From: " + fromEmail);
        System.out.println("To: " + userEmail);
        System.out.println("Subject: Password Reset Request");
        System.out.println("Body: Click the link to reset your password: /reset-password?token=" + resetToken);
        System.out.println("============================");
    }
}