package com.taskmanager.chat.client;

import com.taskmanager.chat.dto.OpenAIRequest;
import com.taskmanager.chat.dto.OpenAIResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;

@Service
public class OpenAIClient {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.api.enabled:false}")
    private boolean apiEnabled;

    private final WebClient webClient;

    public OpenAIClient() {
        this.webClient = WebClient.builder()
                .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(1024 * 1024))
                .build();
    }

    public Mono<String> getChatCompletion(String userMessage, String context) {
        if (!apiEnabled) {
            return Mono.just(getMockResponse(userMessage));
        }

        List<OpenAIRequest.Message> messages = buildMessages(userMessage, context);

        OpenAIRequest request = new OpenAIRequest(
                "gpt-3.5-turbo",
                messages,
                0.7,
                500
        );

        return webClient.post()
                .uri(apiUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(OpenAIResponse.class)
                .map(this::extractResponse)
                .onErrorResume(error -> {
                    System.err.println("OpenAI API Error: " + error.getMessage());
                    return Mono.just("I apologize, but I'm currently unable to process your request. Please try again later or contact support.");
                });
    }

    private List<OpenAIRequest.Message> buildMessages(String userMessage, String context) {
        List<OpenAIRequest.Message> messages = new ArrayList<>();

        // System message to define the AI assistant's role
        String systemMessage = buildSystemMessage(context);
        messages.add(new OpenAIRequest.Message("system", systemMessage));

        // User message
        messages.add(new OpenAIRequest.Message("user", userMessage));

        return messages;
    }

    private String buildSystemMessage(String context) {
        StringBuilder systemMessage = new StringBuilder();
        systemMessage.append("You are a helpful AI assistant for a task management application. ");
        systemMessage.append("You help users with task organization, productivity tips, time management, and general task-related questions. ");
        systemMessage.append("Keep your responses concise, helpful, and relevant to task management and productivity. ");

        if (context != null && !context.trim().isEmpty()) {
            systemMessage.append("Context: ").append(context).append(" ");
        }

        systemMessage.append("If asked about features outside of task management, politely redirect the conversation back to productivity and task management topics.");

        return systemMessage.toString();
    }

    private String extractResponse(OpenAIResponse response) {
        if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
            OpenAIResponse.Choice firstChoice = response.getChoices().get(0);
            if (firstChoice.getMessage() != null && firstChoice.getMessage().getContent() != null) {
                return firstChoice.getMessage().getContent().trim();
            }
        }
        return "I'm sorry, I couldn't generate a proper response. Please try rephrasing your question.";
    }

    private String getMockResponse(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.contains("task") && lowerMessage.contains("create")) {
            return "To create a task, you can use the task creation feature in the main dashboard. Make sure to include a clear title, description, priority level, and due date for better organization.";
        } else if (lowerMessage.contains("priority") || lowerMessage.contains("urgent")) {
            return "For task prioritization, I recommend using the Eisenhower Matrix: Important & Urgent (do first), Important & Not Urgent (schedule), Not Important & Urgent (delegate), Not Important & Not Urgent (eliminate).";
        } else if (lowerMessage.contains("productivity") || lowerMessage.contains("efficient")) {
            return "Here are some productivity tips: 1) Use time-blocking to schedule tasks, 2) Apply the Pomodoro Technique (25min work + 5min break), 3) Batch similar tasks together, 4) Eliminate distractions during focused work time.";
        } else if (lowerMessage.contains("deadline") || lowerMessage.contains("due date")) {
            return "Managing deadlines effectively: 1) Break large tasks into smaller milestones, 2) Set internal deadlines before actual due dates, 3) Use calendar reminders and notifications, 4) Review and adjust priorities regularly.";
        } else if (lowerMessage.contains("organize") || lowerMessage.contains("organize")) {
            return "Task organization strategies: 1) Use categories and tags to group related tasks, 2) Maintain separate lists for different projects, 3) Review and clean up completed tasks regularly, 4) Use filters to focus on specific task types.";
        } else if (lowerMessage.contains("hello") || lowerMessage.contains("hi")) {
            return "Hello! I'm your AI task management assistant. I can help you with task organization, productivity tips, time management strategies, and answering questions about using this task manager effectively. How can I assist you today?";
        } else {
            return "I'm here to help you with task management and productivity! You can ask me about creating tasks, setting priorities, managing deadlines, organizing your workflow, or general productivity tips. What would you like to know?";
        }
    }
}