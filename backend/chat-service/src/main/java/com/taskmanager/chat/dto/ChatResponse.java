package com.taskmanager.chat.dto;

import com.taskmanager.chat.entity.ChatMessage;

import java.time.LocalDateTime;

public class ChatResponse {
    private String id;
    private String sessionId;
    private String message;
    private String response;
    private ChatMessage.MessageType type;
    private LocalDateTime timestamp;
    private boolean isFromUser;

    // Constructors
    public ChatResponse() {}

    public ChatResponse(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.sessionId = chatMessage.getSessionId();
        this.message = chatMessage.getMessage();
        this.response = chatMessage.getResponse();
        this.type = chatMessage.getType();
        this.timestamp = chatMessage.getTimestamp();
        this.isFromUser = chatMessage.isFromUser();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public ChatMessage.MessageType getType() {
        return type;
    }

    public void setType(ChatMessage.MessageType type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public boolean isFromUser() {
        return isFromUser;
    }

    public void setFromUser(boolean fromUser) {
        isFromUser = fromUser;
    }
}