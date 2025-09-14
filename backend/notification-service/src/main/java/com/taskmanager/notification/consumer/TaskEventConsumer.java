package com.taskmanager.notification.consumer;

import com.taskmanager.notification.entity.Notification;
import com.taskmanager.notification.event.TaskEvent;
import com.taskmanager.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class TaskEventConsumer {

    @Autowired
    private NotificationService notificationService;

    @KafkaListener(topics = "task-events", groupId = "notification-service-group")
    public void handleTaskEvent(TaskEvent taskEvent) {
        try {
            processTaskEvent(taskEvent);
        } catch (Exception e) {
            System.err.println("Error processing task event: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void processTaskEvent(TaskEvent taskEvent) {
        Notification.NotificationType notificationType = mapEventTypeToNotificationType(taskEvent.getEventType());

        if (notificationType == null) {
            return; // Ignore unknown event types
        }

        String title = generateNotificationTitle(taskEvent);
        String message = generateNotificationMessage(taskEvent);

        // Create notification for task owner
        if (taskEvent.getUserId() != null) {
            notificationService.createNotification(
                taskEvent.getUserId(),
                title,
                message,
                notificationType,
                taskEvent.getTaskId()
            );
        }

        // Create notification for assignee if different from owner
        if (taskEvent.getAssigneeId() != null &&
            !taskEvent.getAssigneeId().equals(taskEvent.getUserId())) {

            String assigneeTitle = generateAssigneeNotificationTitle(taskEvent);
            String assigneeMessage = generateAssigneeNotificationMessage(taskEvent);

            notificationService.createNotification(
                taskEvent.getAssigneeId(),
                assigneeTitle,
                assigneeMessage,
                notificationType,
                taskEvent.getTaskId()
            );
        }
    }

    private Notification.NotificationType mapEventTypeToNotificationType(String eventType) {
        try {
            return Notification.NotificationType.valueOf(eventType);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private String generateNotificationTitle(TaskEvent taskEvent) {
        switch (taskEvent.getEventType()) {
            case "TASK_CREATED":
                return "Task Created";
            case "TASK_UPDATED":
                return "Task Updated";
            case "TASK_ASSIGNED":
                return "Task Assigned";
            case "TASK_COMPLETED":
                return "Task Completed";
            case "TASK_DELETED":
                return "Task Deleted";
            case "TASK_DUE_SOON":
                return "Task Due Soon";
            default:
                return "Task Notification";
        }
    }

    private String generateNotificationMessage(TaskEvent taskEvent) {
        String taskTitle = taskEvent.getTaskTitle() != null ? taskEvent.getTaskTitle() : "your task";

        switch (taskEvent.getEventType()) {
            case "TASK_CREATED":
                return "Your task '" + taskTitle + "' has been created successfully.";
            case "TASK_UPDATED":
                return "Your task '" + taskTitle + "' has been updated.";
            case "TASK_ASSIGNED":
                return "Your task '" + taskTitle + "' has been assigned to someone.";
            case "TASK_COMPLETED":
                return "Your task '" + taskTitle + "' has been marked as completed.";
            case "TASK_DELETED":
                return "Your task '" + taskTitle + "' has been deleted.";
            case "TASK_DUE_SOON":
                return "Your task '" + taskTitle + "' is due soon. Please complete it on time.";
            default:
                return "There's an update on your task '" + taskTitle + "'.";
        }
    }

    private String generateAssigneeNotificationTitle(TaskEvent taskEvent) {
        switch (taskEvent.getEventType()) {
            case "TASK_ASSIGNED":
                return "New Task Assigned";
            case "TASK_UPDATED":
                return "Assigned Task Updated";
            case "TASK_DUE_SOON":
                return "Assigned Task Due Soon";
            default:
                return "Task Assignment Notification";
        }
    }

    private String generateAssigneeNotificationMessage(TaskEvent taskEvent) {
        String taskTitle = taskEvent.getTaskTitle() != null ? taskEvent.getTaskTitle() : "a task";

        switch (taskEvent.getEventType()) {
            case "TASK_ASSIGNED":
                return "You have been assigned to task '" + taskTitle + "'. Please check the details and start working on it.";
            case "TASK_UPDATED":
                return "The task '" + taskTitle + "' assigned to you has been updated. Please review the changes.";
            case "TASK_DUE_SOON":
                return "The task '" + taskTitle + "' assigned to you is due soon. Please complete it on time.";
            default:
                return "There's an update on the task '" + taskTitle + "' assigned to you.";
        }
    }
}