package com.taskmanager.chat.service;

import com.taskmanager.chat.client.OpenAIClient;
import com.taskmanager.chat.dto.ChatRequest;
import com.taskmanager.chat.dto.ChatResponse;
import com.taskmanager.chat.entity.ChatMessage;
import com.taskmanager.chat.entity.ChatSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private OpenAIClient openAIClient;

    private static final String SESSION_KEY_PREFIX = "chat_session:";
    private static final String MESSAGE_KEY_PREFIX = "chat_message:";
    private static final String USER_SESSIONS_KEY_PREFIX = "user_sessions:";

    public ChatResponse sendMessage(ChatRequest request, Long userId) {
        String sessionId = request.getSessionId();

        // Create new session if not provided
        if (sessionId == null || sessionId.trim().isEmpty()) {
            sessionId = createNewSession(userId);
        }

        // Validate session ownership
        ChatSession session = getSession(sessionId);
        if (session == null || !session.getUserId().equals(userId)) {
            sessionId = createNewSession(userId);
            session = getSession(sessionId);
        }

        // Create user message
        ChatMessage userMessage = new ChatMessage(userId, sessionId, request.getMessage(), true);
        userMessage.setType(request.getType());
        userMessage.setId(UUID.randomUUID().toString());

        // Save user message
        saveMessage(userMessage);
        session.addMessageId(userMessage.getId());
        saveSession(session);

        try {
            // Get AI response
            String aiResponse = openAIClient.getChatCompletion(request.getMessage(), request.getContext()).block();

            // Create AI response message
            ChatMessage aiMessage = new ChatMessage(userId, sessionId, request.getMessage(), false);
            aiMessage.setResponse(aiResponse);
            aiMessage.setType(request.getType());
            aiMessage.setId(UUID.randomUUID().toString());

            // Save AI message
            saveMessage(aiMessage);
            session.addMessageId(aiMessage.getId());
            saveSession(session);

            // Update session title if it's the first message
            if (session.getMessageIds().size() <= 2) {
                updateSessionTitle(session, request.getMessage());
            }

            return new ChatResponse(aiMessage);

        } catch (Exception e) {
            System.err.println("Error getting AI response: " + e.getMessage());

            // Create fallback response
            ChatMessage fallbackMessage = new ChatMessage(userId, sessionId, request.getMessage(), false);
            fallbackMessage.setResponse("I apologize, but I'm currently unable to process your request. Please try again later.");
            fallbackMessage.setId(UUID.randomUUID().toString());

            saveMessage(fallbackMessage);
            session.addMessageId(fallbackMessage.getId());
            saveSession(session);

            return new ChatResponse(fallbackMessage);
        }
    }

    public String createNewSession(Long userId) {
        String sessionId = UUID.randomUUID().toString();
        ChatSession session = new ChatSession(sessionId, userId);

        saveSession(session);
        addSessionToUser(userId, sessionId);

        return sessionId;
    }

    public List<ChatSession> getUserSessions(Long userId) {
        List<String> sessionIds = getUserSessionIds(userId);

        return sessionIds.stream()
                .map(this::getSession)
                .filter(session -> session != null && session.isActive())
                .sorted((s1, s2) -> s2.getLastActivityAt().compareTo(s1.getLastActivityAt()))
                .collect(Collectors.toList());
    }

    public List<ChatResponse> getSessionMessages(String sessionId, Long userId) {
        ChatSession session = getSession(sessionId);

        if (session == null || !session.getUserId().equals(userId)) {
            throw new RuntimeException("Session not found or unauthorized access");
        }

        return session.getMessageIds().stream()
                .map(this::getMessage)
                .filter(message -> message != null)
                .map(ChatResponse::new)
                .sorted((m1, m2) -> m1.getTimestamp().compareTo(m2.getTimestamp()))
                .collect(Collectors.toList());
    }

    public void deleteSession(String sessionId, Long userId) {
        ChatSession session = getSession(sessionId);

        if (session == null || !session.getUserId().equals(userId)) {
            throw new RuntimeException("Session not found or unauthorized access");
        }

        // Delete all messages in the session
        if (session.getMessageIds() != null) {
            session.getMessageIds().forEach(this::deleteMessage);
        }

        // Mark session as inactive
        session.setActive(false);
        saveSession(session);

        // Remove from user's session list
        removeSessionFromUser(userId, sessionId);
    }

    public void clearUserSessions(Long userId) {
        List<String> sessionIds = getUserSessionIds(userId);

        sessionIds.forEach(sessionId -> {
            try {
                deleteSession(sessionId, userId);
            } catch (Exception e) {
                System.err.println("Error deleting session " + sessionId + ": " + e.getMessage());
            }
        });

        // Clear user sessions list
        redisTemplate.delete(USER_SESSIONS_KEY_PREFIX + userId);
    }

    private void saveSession(ChatSession session) {
        redisTemplate.opsForValue().set(SESSION_KEY_PREFIX + session.getSessionId(), session);
    }

    private ChatSession getSession(String sessionId) {
        return (ChatSession) redisTemplate.opsForValue().get(SESSION_KEY_PREFIX + sessionId);
    }

    private void saveMessage(ChatMessage message) {
        redisTemplate.opsForValue().set(MESSAGE_KEY_PREFIX + message.getId(), message);
    }

    private ChatMessage getMessage(String messageId) {
        return (ChatMessage) redisTemplate.opsForValue().get(MESSAGE_KEY_PREFIX + messageId);
    }

    private void deleteMessage(String messageId) {
        redisTemplate.delete(MESSAGE_KEY_PREFIX + messageId);
    }

    private void addSessionToUser(Long userId, String sessionId) {
        redisTemplate.opsForSet().add(USER_SESSIONS_KEY_PREFIX + userId, sessionId);
    }

    private void removeSessionFromUser(Long userId, String sessionId) {
        redisTemplate.opsForSet().remove(USER_SESSIONS_KEY_PREFIX + userId, sessionId);
    }

    @SuppressWarnings("unchecked")
    private List<String> getUserSessionIds(Long userId) {
        return redisTemplate.opsForSet().members(USER_SESSIONS_KEY_PREFIX + userId)
                .stream()
                .map(Object::toString)
                .collect(Collectors.toList());
    }

    private void updateSessionTitle(ChatSession session, String firstMessage) {
        String title = generateSessionTitle(firstMessage);
        session.setTitle(title);
        saveSession(session);
    }

    private String generateSessionTitle(String firstMessage) {
        String message = firstMessage.trim();

        if (message.length() > 50) {
            return message.substring(0, 47) + "...";
        }

        if (message.toLowerCase().startsWith("how")) {
            return "How to: " + message.substring(3).trim();
        } else if (message.toLowerCase().startsWith("what")) {
            return "About: " + message.substring(4).trim();
        } else if (message.toLowerCase().contains("task")) {
            return "Task Help: " + message;
        } else if (message.toLowerCase().contains("productivity")) {
            return "Productivity: " + message;
        } else {
            return message.length() > 0 ? Character.toUpperCase(message.charAt(0)) + message.substring(1) : "New Chat";
        }
    }
}