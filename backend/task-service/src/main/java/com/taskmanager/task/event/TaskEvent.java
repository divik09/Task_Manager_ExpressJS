package com.taskmanager.task.event;

import com.taskmanager.task.entity.Task;

import java.time.LocalDateTime;

public class TaskEvent {
    private String eventId;
    private String eventType;
    private String taskId;
    private String taskTitle;
    private Long userId;
    private Long assigneeId;
    private Task.TaskStatus status;
    private Task.TaskPriority priority;
    private LocalDateTime eventTimestamp;
    private String eventData;

    public enum EventType {
        TASK_CREATED, TASK_UPDATED, TASK_DELETED, TASK_ASSIGNED, TASK_COMPLETED, TASK_DUE_SOON
    }

    // Constructors
    public TaskEvent() {
        this.eventTimestamp = LocalDateTime.now();
    }

    public TaskEvent(String eventType, Task task) {
        this();
        this.eventType = eventType;
        this.taskId = task.getId();
        this.taskTitle = task.getTitle();
        this.userId = task.getUserId();
        this.assigneeId = task.getAssigneeId();
        this.status = task.getStatus();
        this.priority = task.getPriority();
    }

    // Getters and Setters
    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getTaskTitle() {
        return taskTitle;
    }

    public void setTaskTitle(String taskTitle) {
        this.taskTitle = taskTitle;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public Task.TaskStatus getStatus() {
        return status;
    }

    public void setStatus(Task.TaskStatus status) {
        this.status = status;
    }

    public Task.TaskPriority getPriority() {
        return priority;
    }

    public void setPriority(Task.TaskPriority priority) {
        this.priority = priority;
    }

    public LocalDateTime getEventTimestamp() {
        return eventTimestamp;
    }

    public void setEventTimestamp(LocalDateTime eventTimestamp) {
        this.eventTimestamp = eventTimestamp;
    }

    public String getEventData() {
        return eventData;
    }

    public void setEventData(String eventData) {
        this.eventData = eventData;
    }
}