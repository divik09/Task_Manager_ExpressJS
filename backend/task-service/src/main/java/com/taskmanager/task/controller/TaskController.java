package com.taskmanager.task.controller;

import com.taskmanager.task.dto.TaskRequest;
import com.taskmanager.task.dto.TaskResponse;
import com.taskmanager.task.entity.Task;
import com.taskmanager.task.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request,
                                                  @RequestHeader("X-User-Id") Long userId) {
        TaskResponse task = taskService.createTask(request, userId);
        return ResponseEntity.ok(task);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable String id,
                                                   @RequestHeader("X-User-Id") Long userId) {
        TaskResponse task = taskService.getTaskById(id, userId);
        return ResponseEntity.ok(task);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getUserTasks(@RequestHeader("X-User-Id") Long userId,
                                                          @RequestParam(defaultValue = "all") String type) {
        List<TaskResponse> tasks;

        switch (type.toLowerCase()) {
            case "created":
                tasks = taskService.getUserTasks(userId);
                break;
            case "assigned":
                tasks = taskService.getAssignedTasks(userId);
                break;
            default:
                tasks = taskService.getAllUserTasks(userId);
                break;
        }

        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<TaskResponse>> getUserTasksPaginated(@RequestHeader("X-User-Id") Long userId,
                                                                   @RequestParam(defaultValue = "0") int page,
                                                                   @RequestParam(defaultValue = "10") int size) {
        Page<TaskResponse> tasks = taskService.getUserTasksPaginated(userId, page, size);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/filter/status/{status}")
    public ResponseEntity<List<TaskResponse>> getTasksByStatus(@PathVariable Task.TaskStatus status,
                                                              @RequestHeader("X-User-Id") Long userId) {
        List<TaskResponse> tasks = taskService.getTasksByStatus(userId, status);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/filter/priority/{priority}")
    public ResponseEntity<List<TaskResponse>> getTasksByPriority(@PathVariable Task.TaskPriority priority,
                                                               @RequestHeader("X-User-Id") Long userId) {
        List<TaskResponse> tasks = taskService.getTasksByPriority(userId, priority);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/filter/category/{category}")
    public ResponseEntity<List<TaskResponse>> getTasksByCategory(@PathVariable String category,
                                                               @RequestHeader("X-User-Id") Long userId) {
        List<TaskResponse> tasks = taskService.getTasksByCategory(userId, category);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/filter/tags")
    public ResponseEntity<List<TaskResponse>> getTasksByTags(@RequestParam List<String> tags,
                                                           @RequestHeader("X-User-Id") Long userId) {
        List<TaskResponse> tasks = taskService.getTasksByTags(userId, tags);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/search")
    public ResponseEntity<List<TaskResponse>> searchTasks(@RequestParam String q,
                                                        @RequestHeader("X-User-Id") Long userId) {
        List<TaskResponse> tasks = taskService.searchTasks(userId, q);
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(@PathVariable String id,
                                                  @Valid @RequestBody TaskRequest request,
                                                  @RequestHeader("X-User-Id") Long userId) {
        TaskResponse task = taskService.updateTask(id, request, userId);
        return ResponseEntity.ok(task);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable String id,
                                                         @RequestHeader("X-User-Id") Long userId) {
        taskService.deleteTask(id, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Task deleted successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTaskStats(@RequestHeader("X-User-Id") Long userId) {
        Map<String, Object> stats = new HashMap<>();

        stats.put("total", taskService.getTotalTaskCount(userId));
        stats.put("todo", taskService.getTaskCountByStatus(userId, Task.TaskStatus.TODO));
        stats.put("inProgress", taskService.getTaskCountByStatus(userId, Task.TaskStatus.IN_PROGRESS));
        stats.put("done", taskService.getTaskCountByStatus(userId, Task.TaskStatus.DONE));
        stats.put("cancelled", taskService.getTaskCountByStatus(userId, Task.TaskStatus.CANCELLED));

        return ResponseEntity.ok(stats);
    }

    @PostMapping("/reminders/due-soon")
    public ResponseEntity<Map<String, String>> publishDueSoonReminders() {
        taskService.publishDueSoonReminders();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Due soon reminders published successfully");
        return ResponseEntity.ok(response);
    }
}