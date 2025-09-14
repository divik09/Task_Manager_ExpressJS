package com.taskmanager.chat.controller;

import com.taskmanager.chat.dto.ChatRequest;
import com.taskmanager.chat.dto.ChatResponse;
import com.taskmanager.chat.entity.ChatSession;
import com.taskmanager.chat.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request,
                                                   @RequestHeader("X-User-Id") Long userId) {
        ChatResponse response = chatService.sendMessage(request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/session/new")
    public ResponseEntity<Map<String, String>> createNewSession(@RequestHeader("X-User-Id") Long userId) {
        String sessionId = chatService.createNewSession(userId);

        Map<String, String> response = new HashMap<>();
        response.put("sessionId", sessionId);
        response.put("message", "New chat session created");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ChatSession>> getUserSessions(@RequestHeader("X-User-Id") Long userId) {
        List<ChatSession> sessions = chatService.getUserSessions(userId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/session/{sessionId}/messages")
    public ResponseEntity<List<ChatResponse>> getSessionMessages(@PathVariable String sessionId,
                                                               @RequestHeader("X-User-Id") Long userId) {
        List<ChatResponse> messages = chatService.getSessionMessages(sessionId, userId);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable String sessionId,
                                                            @RequestHeader("X-User-Id") Long userId) {
        chatService.deleteSession(sessionId, userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Session deleted successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/sessions/clear")
    public ResponseEntity<Map<String, String>> clearUserSessions(@RequestHeader("X-User-Id") Long userId) {
        chatService.clearUserSessions(userId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "All chat sessions cleared successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/help")
    public ResponseEntity<Map<String, Object>> getChatHelp() {
        Map<String, Object> help = new HashMap<>();

        help.put("welcome", "Welcome to the Task Manager AI Assistant!");
        help.put("capabilities", List.of(
            "Task creation and management guidance",
            "Productivity tips and strategies",
            "Time management advice",
            "Task organization suggestions",
            "Priority setting help",
            "Deadline management tips"
        ));
        help.put("sampleQuestions", List.of(
            "How can I organize my tasks better?",
            "What are some productivity tips?",
            "How do I prioritize my tasks?",
            "Help me manage my deadlines",
            "How to create effective task lists?"
        ));

        return ResponseEntity.ok(help);
    }
}