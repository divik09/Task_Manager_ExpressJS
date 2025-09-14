package com.taskmanager.task.service;

import com.taskmanager.task.dto.TaskRequest;
import com.taskmanager.task.dto.TaskResponse;
import com.taskmanager.task.entity.Task;
import com.taskmanager.task.event.TaskEvent;
import com.taskmanager.task.exception.TaskNotFoundException;
import com.taskmanager.task.exception.UnauthorizedTaskAccessException;
import com.taskmanager.task.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private KafkaTemplate<String, TaskEvent> kafkaTemplate;

    private static final String TASK_EVENTS_TOPIC = "task-events";

    public TaskResponse createTask(TaskRequest request, Long userId) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setUserId(userId);
        task.setAssigneeId(request.getAssigneeId());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setCategory(request.getCategory());
        task.setTags(request.getTags());
        task.setDueDate(request.getDueDate());
        task.setAttachment(request.getAttachment());
        task.setProgress(request.getProgress());

        Task savedTask = taskRepository.save(task);

        // Publish task created event
        publishTaskEvent(TaskEvent.EventType.TASK_CREATED.toString(), savedTask);

        return new TaskResponse(savedTask);
    }

    public TaskResponse getTaskById(String taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + taskId));

        if (!hasTaskAccess(task, userId)) {
            throw new UnauthorizedTaskAccessException("You don't have access to this task");
        }

        return new TaskResponse(task);
    }

    public List<TaskResponse> getUserTasks(Long userId) {
        List<Task> tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getAssignedTasks(Long userId) {
        List<Task> tasks = taskRepository.findByAssigneeIdOrderByCreatedAtDesc(userId);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getAllUserTasks(Long userId) {
        List<Task> tasks = taskRepository.findTasksByUserIdOrAssigneeId(userId);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public Page<TaskResponse> getUserTasksPaginated(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Task> tasksPage = taskRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return tasksPage.map(TaskResponse::new);
    }

    public List<TaskResponse> getTasksByStatus(Long userId, Task.TaskStatus status) {
        List<Task> tasks = taskRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksByPriority(Long userId, Task.TaskPriority priority) {
        List<Task> tasks = taskRepository.findByUserIdAndPriorityOrderByCreatedAtDesc(userId, priority);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksByCategory(Long userId, String category) {
        List<Task> tasks = taskRepository.findByUserIdAndCategoryOrderByCreatedAtDesc(userId, category);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> getTasksByTags(Long userId, List<String> tags) {
        List<Task> tasks = taskRepository.findByUserIdAndTagsIn(userId, tags);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public List<TaskResponse> searchTasks(Long userId, String searchTerm) {
        List<Task> tasks = taskRepository.searchTasksByUserId(userId, searchTerm);
        return tasks.stream()
                .map(TaskResponse::new)
                .collect(Collectors.toList());
    }

    public TaskResponse updateTask(String taskId, TaskRequest request, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + taskId));

        if (!hasTaskAccess(task, userId)) {
            throw new UnauthorizedTaskAccessException("You don't have access to this task");
        }

        Task.TaskStatus oldStatus = task.getStatus();

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setAssigneeId(request.getAssigneeId());
        task.setStatus(request.getStatus());
        task.setPriority(request.getPriority());
        task.setCategory(request.getCategory());
        task.setTags(request.getTags());
        task.setDueDate(request.getDueDate());
        task.setAttachment(request.getAttachment());
        task.setProgress(request.getProgress());
        task.setUpdatedAt(LocalDateTime.now());

        Task updatedTask = taskRepository.save(task);

        // Publish appropriate events
        publishTaskEvent(TaskEvent.EventType.TASK_UPDATED.toString(), updatedTask);

        if (oldStatus != request.getStatus() && request.getStatus() == Task.TaskStatus.DONE) {
            publishTaskEvent(TaskEvent.EventType.TASK_COMPLETED.toString(), updatedTask);
        }

        if (request.getAssigneeId() != null && !request.getAssigneeId().equals(task.getAssigneeId())) {
            publishTaskEvent(TaskEvent.EventType.TASK_ASSIGNED.toString(), updatedTask);
        }

        return new TaskResponse(updatedTask);
    }

    public void deleteTask(String taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + taskId));

        if (!hasTaskAccess(task, userId)) {
            throw new UnauthorizedTaskAccessException("You don't have access to this task");
        }

        taskRepository.delete(task);

        // Publish task deleted event
        publishTaskEvent(TaskEvent.EventType.TASK_DELETED.toString(), task);
    }

    public void publishDueSoonReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);

        List<Task> dueSoonTasks = taskRepository.findByDueDateBetweenAndStatusNot(
                now, tomorrow, Task.TaskStatus.DONE);

        for (Task task : dueSoonTasks) {
            TaskEvent event = new TaskEvent(TaskEvent.EventType.TASK_DUE_SOON.toString(), task);
            event.setEventData("Task is due within 24 hours");
            publishTaskEvent(TaskEvent.EventType.TASK_DUE_SOON.toString(), task);
        }
    }

    public long getTaskCountByStatus(Long userId, Task.TaskStatus status) {
        return taskRepository.countByUserIdAndStatus(userId, status);
    }

    public long getTotalTaskCount(Long userId) {
        return taskRepository.countByUserId(userId);
    }

    private boolean hasTaskAccess(Task task, Long userId) {
        return task.getUserId().equals(userId) ||
               (task.getAssigneeId() != null && task.getAssigneeId().equals(userId));
    }

    private void publishTaskEvent(String eventType, Task task) {
        try {
            TaskEvent event = new TaskEvent(eventType, task);
            kafkaTemplate.send(TASK_EVENTS_TOPIC, event);
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Failed to publish task event: " + e.getMessage());
        }
    }
}