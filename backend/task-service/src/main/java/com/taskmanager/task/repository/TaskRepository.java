package com.taskmanager.task.repository;

import com.taskmanager.task.entity.Task;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {

    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Task> findByAssigneeIdOrderByCreatedAtDesc(Long assigneeId);

    List<Task> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Task.TaskStatus status);

    List<Task> findByUserIdAndPriorityOrderByCreatedAtDesc(Long userId, Task.TaskPriority priority);

    List<Task> findByUserIdAndCategoryOrderByCreatedAtDesc(Long userId, String category);

    @Query("{'userId': ?0, 'tags': {$in: ?1}}")
    List<Task> findByUserIdAndTagsIn(Long userId, List<String> tags);

    @Query("{'userId': ?0, 'dueDate': {$gte: ?1, $lte: ?2}}")
    List<Task> findByUserIdAndDueDateBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("{'userId': ?0, '$or': [" +
           "{'title': {$regex: ?1, $options: 'i'}}, " +
           "{'description': {$regex: ?1, $options: 'i'}}, " +
           "{'category': {$regex: ?1, $options: 'i'}}" +
           "]}")
    List<Task> searchTasksByUserId(Long userId, String searchTerm);

    Page<Task> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Task> findByDueDateBetweenAndStatusNot(LocalDateTime startDate, LocalDateTime endDate, Task.TaskStatus status);

    @Query("{'$or': [{'userId': ?0}, {'assigneeId': ?0}]}")
    List<Task> findTasksByUserIdOrAssigneeId(Long userId);

    long countByUserIdAndStatus(Long userId, Task.TaskStatus status);

    long countByUserId(Long userId);
}