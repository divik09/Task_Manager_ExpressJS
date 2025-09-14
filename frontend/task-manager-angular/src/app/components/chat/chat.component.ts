import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';
import { ChatMessage, ChatRequest } from '../../models/chat.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid mt-4">
      <div class="row justify-content-center">
        <div class="col-lg-10 col-xl-8">
          <div class="card shadow">
            <!-- Chat Header -->
            <div class="card-header bg-primary text-white">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h5 class="mb-0">
                    <i class="fas fa-robot me-2"></i>
                    AI Assistant Chat
                  </h5>
                  <small class="opacity-75">Get help with your tasks and productivity</small>
                </div>
                <div class="btn-group" role="group">
                  <button
                    class="btn btn-outline-light btn-sm"
                    (click)="exportChat()"
                    title="Export Chat"
                    [disabled]="chatHistory.length === 0"
                  >
                    <i class="fas fa-download"></i>
                  </button>
                  <button
                    class="btn btn-outline-light btn-sm"
                    (click)="clearChat()"
                    title="Clear Chat History"
                    [disabled]="chatHistory.length === 0"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Chat Messages Container -->
            <div class="card-body p-0">
              <div
                #chatContainer
                class="chat-container"
                [class.empty-chat]="chatHistory.length === 0"
              >
                <!-- Loading initial messages -->
                <div *ngIf="loadingHistory" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading chat history...</span>
                  </div>
                </div>

                <!-- Empty state -->
                <div *ngIf="!loadingHistory && chatHistory.length === 0" class="empty-chat-state text-center py-5">
                  <i class="fas fa-comments fa-4x text-muted mb-3"></i>
                  <h5 class="text-muted">Start a conversation</h5>
                  <p class="text-muted">
                    Ask me about task management, productivity tips, or anything else you need help with!
                  </p>
                  <div class="suggestions mt-4">
                    <h6 class="text-muted mb-3">Try asking:</h6>
                    <button
                      *ngFor="let suggestion of quickSuggestions"
                      class="btn btn-outline-primary btn-sm me-2 mb-2"
                      (click)="sendSuggestion(suggestion.message)"
                    >
                      {{ suggestion.text }}
                    </button>
                  </div>
                </div>

                <!-- Chat Messages -->
                <div *ngIf="!loadingHistory && chatHistory.length > 0" class="chat-messages p-3">
                  <div
                    *ngFor="let message of chatHistory; let i = index"
                    class="message-wrapper mb-3"
                    [class.user-message]="message.sender === 'user'"
                    [class.assistant-message]="message.sender === 'assistant'"
                  >
                    <div class="d-flex" [class.justify-content-end]="message.sender === 'user'">
                      <!-- User Avatar -->
                      <div *ngIf="message.sender === 'user'" class="avatar user-avatar me-2 order-2">
                        <div class="avatar-circle bg-primary">
                          {{ getUserInitials() }}
                        </div>
                      </div>

                      <!-- Assistant Avatar -->
                      <div *ngIf="message.sender === 'assistant'" class="avatar assistant-avatar me-2">
                        <div class="avatar-circle bg-success">
                          <i class="fas fa-robot"></i>
                        </div>
                      </div>

                      <!-- Message Content -->
                      <div class="message-content" [class.order-1]="message.sender === 'user'">
                        <div
                          class="message-bubble"
                          [class.user-bubble]="message.sender === 'user'"
                          [class.assistant-bubble]="message.sender === 'assistant'"
                        >
                          <div class="message-text" [innerHTML]="formatMessage(message.content)"></div>
                        </div>
                        <div class="message-time">
                          {{ message.timestamp | date:'short' }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Typing indicator -->
                  <div *ngIf="isTyping" class="message-wrapper mb-3 assistant-message">
                    <div class="d-flex">
                      <div class="avatar assistant-avatar me-2">
                        <div class="avatar-circle bg-success">
                          <i class="fas fa-robot"></i>
                        </div>
                      </div>
                      <div class="message-content">
                        <div class="message-bubble assistant-bubble">
                          <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Chat Input -->
            <div class="card-footer bg-light">
              <form [formGroup]="chatForm" (ngSubmit)="sendMessage()" class="d-flex">
                <div class="flex-grow-1 me-2">
                  <textarea
                    #messageInput
                    class="form-control"
                    formControlName="message"
                    placeholder="Type your message here... (Press Ctrl+Enter to send)"
                    rows="1"
                    (keydown)="handleKeyDown($event)"
                    [disabled]="sending"
                    style="resize: none; min-height: 38px;"
                  ></textarea>
                  <div *ngIf="error" class="text-danger small mt-1">
                    {{ error }}
                  </div>
                </div>
                <div>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    [disabled]="chatForm.invalid || sending"
                  >
                    <span *ngIf="sending" class="spinner-border spinner-border-sm me-2"></span>
                    <i *ngIf="!sending" class="fas fa-paper-plane"></i>
                    <span class="d-none d-sm-inline ms-1">
                      {{ sending ? 'Sending...' : 'Send' }}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Styles -->
    <style>
      .chat-container {
        height: 60vh;
        overflow-y: auto;
        background-color: #f8f9fa;
      }

      .empty-chat {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .chat-messages {
        min-height: 100%;
      }

      .avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      }

      .message-bubble {
        max-width: 70%;
        padding: 10px 15px;
        border-radius: 18px;
        word-wrap: break-word;
        line-height: 1.4;
      }

      .user-bubble {
        background-color: #007bff;
        color: white;
        border-bottom-right-radius: 4px;
      }

      .assistant-bubble {
        background-color: white;
        color: #333;
        border: 1px solid #e9ecef;
        border-bottom-left-radius: 4px;
      }

      .message-time {
        font-size: 0.75rem;
        color: #6c757d;
        margin-top: 4px;
        text-align: center;
      }

      .user-message .message-time {
        text-align: right;
      }

      .assistant-message .message-time {
        text-align: left;
      }

      .typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .typing-indicator span {
        height: 8px;
        width: 8px;
        border-radius: 50%;
        background-color: #6c757d;
        display: inline-block;
        animation: typing 1.4s infinite ease-in-out both;
      }

      .typing-indicator span:nth-child(1) {
        animation-delay: -0.32s;
      }

      .typing-indicator span:nth-child(2) {
        animation-delay: -0.16s;
      }

      @keyframes typing {
        0%, 80%, 100% {
          transform: scale(0);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }

      .message-text {
        white-space: pre-wrap;
      }

      .message-text p {
        margin-bottom: 8px;
      }

      .message-text p:last-child {
        margin-bottom: 0;
      }

      .message-text code {
        background-color: rgba(0, 0, 0, 0.1);
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }

      .user-bubble .message-text code {
        background-color: rgba(255, 255, 255, 0.2);
      }

      .suggestions button {
        white-space: nowrap;
      }

      @media (max-width: 768px) {
        .chat-container {
          height: 50vh;
        }

        .message-bubble {
          max-width: 85%;
        }
      }
    </style>
  `
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  chatForm: FormGroup;
  chatHistory: ChatMessage[] = [];
  currentUser: User | null = null;

  loadingHistory = false;
  sending = false;
  isTyping = false;
  error = '';

  shouldScrollToBottom = false;

  quickSuggestions = [
    { text: 'How can I be more productive?', message: 'How can I be more productive with my tasks?' },
    { text: 'Task prioritization tips', message: 'Can you give me tips on how to prioritize my tasks effectively?' },
    { text: 'Time management advice', message: 'What are some good time management techniques I can use?' },
    { text: 'Help with planning', message: 'How should I plan my daily tasks and schedule?' }
  ];

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadChatHistory();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  loadChatHistory(): void {
    this.loadingHistory = true;
    this.chatService.getChatHistory().subscribe({
      next: (messages) => {
        this.chatHistory = messages.sort((a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        this.loadingHistory = false;
        this.shouldScrollToBottom = true;
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.loadingHistory = false;
      }
    });
  }

  sendMessage(): void {
    if (this.chatForm.valid && !this.sending) {
      const messageText = this.chatForm.get('message')?.value.trim();
      if (!messageText) return;

      this.sending = true;
      this.error = '';

      // Add user message to chat immediately
      const userMessage: ChatMessage = {
        id: this.generateTempId(),
        content: messageText,
        sender: 'user',
        timestamp: new Date(),
        userId: this.currentUser?.id || ''
      };

      this.chatHistory.push(userMessage);
      this.chatForm.get('message')?.setValue('');
      this.shouldScrollToBottom = true;

      // Show typing indicator
      this.isTyping = true;

      const request: ChatRequest = { message: messageText };

      this.chatService.sendMessage(request).subscribe({
        next: (response) => {
          this.isTyping = false;
          this.sending = false;

          // Add assistant response
          const assistantMessage: ChatMessage = {
            id: this.generateTempId(),
            content: response.response,
            sender: 'assistant',
            timestamp: response.timestamp,
            userId: this.currentUser?.id || ''
          };

          this.chatHistory.push(assistantMessage);
          this.shouldScrollToBottom = true;

          // Focus back to input
          setTimeout(() => {
            this.messageInput.nativeElement.focus();
          }, 100);
        },
        error: (error) => {
          this.isTyping = false;
          this.sending = false;
          this.error = error.error?.message || 'Failed to send message. Please try again.';
          console.error('Error sending message:', error);

          // Remove the user message if the request failed
          this.chatHistory.pop();
        }
      });
    }
  }

  sendSuggestion(suggestion: string): void {
    this.chatForm.get('message')?.setValue(suggestion);
    this.sendMessage();
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear the chat history? This action cannot be undone.')) {
      this.chatService.clearChatHistory().subscribe({
        next: () => {
          this.chatHistory = [];
          this.error = '';
        },
        error: (error) => {
          this.error = 'Failed to clear chat history';
          console.error('Error clearing chat:', error);
        }
      });
    }
  }

  exportChat(): void {
    if (this.chatHistory.length === 0) return;

    const chatData = this.chatHistory.map(msg => ({
      sender: msg.sender,
      message: msg.content,
      timestamp: msg.timestamp
    }));

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `chat-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  }

  formatMessage(content: string): string {
    // Basic formatting for chat messages
    let formatted = content
      // Convert line breaks to <br>
      .replace(/\n/g, '<br>')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks (backticks)
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Simple bullet points
      .replace(/^- (.+)$/gm, '• $1');

    return formatted;
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    const firstName = this.currentUser.firstName || '';
    const lastName = this.currentUser.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
  }

  private scrollToBottom(): void {
    try {
      if (this.chatContainer) {
        const element = this.chatContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  private generateTempId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}