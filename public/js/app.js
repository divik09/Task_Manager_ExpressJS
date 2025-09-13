/**
 * Task Manager Frontend Application
 * 
 * This JavaScript file implements a complete single-page application that demonstrates
 * modern frontend development practices including:
 * - Modular code organization with clear separation of concerns
 * - Comprehensive error handling and user feedback
 * - Responsive API communication with proper loading states
 * - Progressive enhancement for accessibility
 * - State management without external libraries
 * 
 * The application follows the Model-View-Controller pattern in the frontend,
 * where this file acts as both the View Controller and manages application state.
 */

// ============================
// Application State Management
// ============================

/**
 * Global application state object
 * This centralizes all dynamic data and provides a single source of truth
 * for the application's current state, similar to how Redux works in React applications
 */
const AppState = {
    tasks: [],
    filteredTasks: [],
    currentFilters: {
        search: '',
        status: '',
        priority: '',
        sortBy: 'created_at',
        sortOrder: 'desc'
    },
    statistics: {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0
    },
    isLoading: false,
    currentTask: null // For edit operations
};

// ============================
// API Communication Layer
// ============================

/**
 * APIClient class handles all communication with our backend
 * This abstraction layer makes it easy to modify API calls without
 * affecting the rest of our application code
 */
class APIClient {
    constructor(baseURL = '/api') {
        this.baseURL = baseURL;
    }

    /**
     * Generic request method that handles common HTTP operations
     * This centralizes error handling, loading states, and response processing
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        // Set default headers for JSON communication
        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        // Merge provided options with defaults
        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...(options.headers || {})
            }
        };

        try {
            const response = await fetch(url, config);
            
            // Parse response as JSON
            const data = await response.json();
            
            // Handle HTTP error status codes
            if (!response.ok) {
                throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            return data;
        } catch (error) {
            // Network errors or parsing errors
            if (error instanceof TypeError) {
                throw new Error('Network connection failed. Please check your internet connection.');
            }
            throw error;
        }
    }

    // Task-specific API methods that provide clean interfaces for common operations

    async getAllTasks(filters = {}) {
        const queryParams = new URLSearchParams();
        
        // Build query string from filter parameters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                queryParams.append(key, value);
            }
        });
        
        const endpoint = `/tasks${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return this.request(endpoint);
    }

    async getTaskById(id) {
        return this.request(`/tasks/${id}`);
    }

    async createTask(taskData) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData)
        });
    }

    async updateTask(id, taskData) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData)
        });
    }

    async deleteTask(id) {
        return this.request(`/tasks/${id}`, {
            method: 'DELETE'
        });
    }

    async toggleTaskCompletion(id) {
        return this.request(`/tasks/${id}/toggle`, {
            method: 'PATCH'
        });
    }

    async getStatistics() {
        return this.request('/tasks/statistics');
    }
}

// Create global API client instance
const api = new APIClient();

// ============================
// User Interface Management
// ============================

/**
 * UIManager handles all DOM manipulation and user interface updates
 * This separation keeps our UI logic organized and makes testing easier
 */
class UIManager {
    constructor() {
        this.elements = this.cacheElements();
        this.bindEvents();
    }

    /**
     * Cache frequently used DOM elements to improve performance
     * This prevents repeated DOM queries which can slow down the application
     */
    cacheElements() {
        return {
            // Main containers
            loading: document.getElementById('loading'),
            app: document.getElementById('app'),
            taskList: document.getElementById('taskList'),
            emptyState: document.getElementById('emptyState'),
            noResults: document.getElementById('noResults'),
            
            // Header elements
            totalTasks: document.getElementById('totalTasks'),
            completedTasks: document.getElementById('completedTasks'),
            pendingTasks: document.getElementById('pendingTasks'),
            
            // Controls
            addTaskBtn: document.getElementById('addTaskBtn'),
            searchInput: document.getElementById('searchInput'),
            clearSearch: document.getElementById('clearSearch'),
            statusFilter: document.getElementById('statusFilter'),
            priorityFilter: document.getElementById('priorityFilter'),
            sortBy: document.getElementById('sortBy'),
            sortOrder: document.getElementById('sortOrder'),
            resetFilters: document.getElementById('resetFilters'),
            clearFiltersBtn: document.getElementById('clearFiltersBtn'),
            
            // Modal elements
            taskModal: document.getElementById('taskModal'),
            modalTitle: document.getElementById('modalTitle'),
            taskForm: document.getElementById('taskForm'),
            taskTitle: document.getElementById('taskTitle'),
            taskDescription: document.getElementById('taskDescription'),
            taskPriority: document.getElementById('taskPriority'),
            taskDueDate: document.getElementById('taskDueDate'),
            taskCompleted: document.getElementById('taskCompleted'),
            completedGroup: document.getElementById('completedGroup'),
            submitBtn: document.getElementById('submitBtn'),
            descriptionCount: document.getElementById('descriptionCount'),
            
            // Confirmation modal
            confirmModal: document.getElementById('confirmModal'),
            confirmTitle: document.getElementById('confirmTitle'),
            confirmMessage: document.getElementById('confirmMessage'),
            confirmAction: document.getElementById('confirmAction'),
            
            // Toast container
            toastContainer: document.getElementById('toastContainer')
        };
    }

    /**
     * Bind event listeners to DOM elements
     * This centralizes all event handling and makes it easy to manage user interactions
     */
    bindEvents() {
        // Search and filter events
        this.elements.searchInput.addEventListener('input', this.handleSearchInput.bind(this));
        this.elements.clearSearch.addEventListener('click', this.clearSearch.bind(this));
        this.elements.statusFilter.addEventListener('change', this.handleFilterChange.bind(this));
        this.elements.priorityFilter.addEventListener('change', this.handleFilterChange.bind(this));
        this.elements.sortBy.addEventListener('change', this.handleFilterChange.bind(this));
        this.elements.sortOrder.addEventListener('change', this.handleFilterChange.bind(this));
        this.elements.resetFilters.addEventListener('click', this.resetFilters.bind(this));
        this.elements.clearFiltersBtn.addEventListener('click', this.resetFilters.bind(this));
        
        // Task management events
        this.elements.addTaskBtn.addEventListener('click', () => this.showTaskModal());
        this.elements.taskForm.addEventListener('submit', this.handleTaskSubmit.bind(this));
        
        // Character counter for description
        this.elements.taskDescription.addEventListener('input', this.updateCharacterCount.bind(this));
        
        // Modal close events (clicking outside modal)
        this.elements.taskModal.addEventListener('click', (e) => {
            if (e.target === this.elements.taskModal) {
                this.closeTaskModal();
            }
        });
        
        this.elements.confirmModal.addEventListener('click', (e) => {
            if (e.target === this.elements.confirmModal) {
                this.closeConfirmModal();
            }
        });
        
        // Keyboard shortcuts for accessibility
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    /**
     * Handle keyboard shortcuts for improved accessibility and power user experience
     * This demonstrates attention to user experience details
     */
    handleKeyboardShortcuts(e) {
        // Escape key closes modals
        if (e.key === 'Escape') {
            if (this.elements.taskModal.style.display !== 'none') {
                this.closeTaskModal();
            }
            if (this.elements.confirmModal.style.display !== 'none') {
                this.closeConfirmModal();
            }
        }
        
        // Ctrl/Cmd + N opens new task modal
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.showTaskModal();
        }
        
        // Ctrl/Cmd + K focuses search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.elements.searchInput.focus();
        }
    }

    /**
     * Show loading state while API requests are in progress
     * This provides immediate feedback to users that something is happening
     */
    showLoading() {
        AppState.isLoading = true;
        this.elements.loading.style.display = 'flex';
        this.elements.app.style.display = 'none';
    }

    /**
     * Hide loading state and show main application
     */
    hideLoading() {
        AppState.isLoading = false;
        this.elements.loading.style.display = 'none';
        this.elements.app.style.display = 'block';
    }

    /**
     * Update the statistics display in the header
     * This keeps the dashboard metrics current with the latest data
     */
    updateStatistics(stats) {
        AppState.statistics = { ...stats };
        this.elements.totalTasks.textContent = stats.total || 0;
        this.elements.completedTasks.textContent = stats.completed || 0;
        this.elements.pendingTasks.textContent = stats.pending || 0;
    }

    /**
     * Render the complete task list to the DOM
     * This function demonstrates efficient DOM manipulation techniques
     */
    renderTasks(tasks) {
        const container = this.elements.taskList;
        
        // Clear existing content
        container.innerHTML = '';
        
        // Show appropriate empty states
        if (tasks.length === 0) {
            if (this.hasActiveFilters()) {
                this.elements.noResults.style.display = 'block';
                this.elements.emptyState.style.display = 'none';
            } else {
                this.elements.emptyState.style.display = 'block';
                this.elements.noResults.style.display = 'none';
            }
            return;
        }
        
        // Hide empty states when we have tasks
        this.elements.emptyState.style.display = 'none';
        this.elements.noResults.style.display = 'none';
        
        // Create and append task elements
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    }

    /**
     * Create a DOM element for a single task
     * This demonstrates how to build complex DOM structures programmatically
     */
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskDiv.dataset.taskId = task.id;
        
        // Format due date if present
        const dueDateHTML = task.due_date ? this.formatDueDate(task.due_date) : '';
        
        // Build the task HTML structure
        taskDiv.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                 onclick="taskManager.toggleTask(${task.id})">
                <i class="fas fa-check"></i>
            </div>
            
            <div class="task-content">
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                
                <div class="task-meta">
                    <span class="priority-badge priority-${task.priority}">
                        <i class="fas fa-flag"></i>
                        ${task.priority}
                    </span>
                    ${dueDateHTML}
                </div>
            </div>
            
            <div class="task-actions">
                <button class="action-btn edit" onclick="taskManager.editTask(${task.id})" 
                        title="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="taskManager.deleteTask(${task.id})" 
                        title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return taskDiv;
    }

    /**
     * Format due date with appropriate styling for overdue tasks
     * This adds semantic meaning to the visual presentation
     */
    formatDueDate(dueDateString) {
        const dueDate = new Date(dueDateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isOverdue = dueDate < today;
        const dateText = dueDate.toLocaleDateString();
        
        return `
            <span class="due-date ${isOverdue ? 'overdue' : ''}">
                <i class="fas fa-calendar${isOverdue ? '-times' : '-alt'}"></i>
                ${dateText}
                ${isOverdue ? '(Overdue)' : ''}
            </span>
        `;
    }

    /**
     * Escape HTML to prevent XSS attacks
     * This is a critical security measure when displaying user-generated content
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Check if any filters are currently active
     * This helps determine which empty state to show
     */
    hasActiveFilters() {
        const filters = AppState.currentFilters;
        return filters.search || filters.status || filters.priority || 
               filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc';
    }

    /**
     * Handle search input with debouncing to prevent excessive API calls
     * Debouncing waits for the user to stop typing before triggering the search
     */
    handleSearchInput(e) {
        const value = e.target.value;
        
        // Show/hide clear button
        this.elements.clearSearch.style.display = value ? 'block' : 'none';
        
        // Clear existing timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        
        // Set new timeout for debounced search
        this.searchTimeout = setTimeout(() => {
            AppState.currentFilters.search = value;
            taskManager.loadTasks();
        }, 300); // 300ms delay
    }

    /**
     * Clear the search input and reset search filter
     */
    clearSearch() {
        this.elements.searchInput.value = '';
        this.elements.clearSearch.style.display = 'none';
        AppState.currentFilters.search = '';
        taskManager.loadTasks();
    }

    /**
     * Handle changes to filter dropdown menus
     */
    handleFilterChange(e) {
        const filterName = {
            'statusFilter': 'status',
            'priorityFilter': 'priority',
            'sortBy': 'sortBy',
            'sortOrder': 'sortOrder'
        }[e.target.id];
        
        if (filterName) {
            AppState.currentFilters[filterName] = e.target.value;
            taskManager.loadTasks();
        }
    }

    /**
     * Reset all filters to their default values
     */
    resetFilters() {
        // Reset filter state
        AppState.currentFilters = {
            search: '',
            status: '',
            priority: '',
            sortBy: 'created_at',
            sortOrder: 'desc'
        };
        
        // Reset UI elements
        this.elements.searchInput.value = '';
        this.elements.clearSearch.style.display = 'none';
        this.elements.statusFilter.value = '';
        this.elements.priorityFilter.value = '';
        this.elements.sortBy.value = 'created_at';
        this.elements.sortOrder.value = 'desc';
        
        // Reload tasks
        taskManager.loadTasks();
    }

    /**
     * Show the task creation/edit modal
     */
    showTaskModal(task = null) {
        AppState.currentTask = task;
        
        // Set modal title and button text based on operation
        if (task) {
            this.elements.modalTitle.textContent = 'Edit Task';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Task';
            this.elements.completedGroup.style.display = 'block';
            this.populateTaskForm(task);
        } else {
            this.elements.modalTitle.textContent = 'Add New Task';
            this.elements.submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Task';
            this.elements.completedGroup.style.display = 'none';
            this.clearTaskForm();
        }
        
        this.elements.taskModal.style.display = 'flex';
        
        // Focus the title input for better UX
        setTimeout(() => {
            this.elements.taskTitle.focus();
        }, 100);
    }

    /**
     * Close the task modal
     */
    closeTaskModal() {
        this.elements.taskModal.style.display = 'none';
        AppState.currentTask = null;
        this.clearTaskForm();
    }

    /**
     * Populate the form with task data for editing
     */
    populateTaskForm(task) {
        this.elements.taskTitle.value = task.title || '';
        this.elements.taskDescription.value = task.description || '';
        this.elements.taskPriority.value = task.priority || 'medium';
        this.elements.taskDueDate.value = task.due_date || '';
        this.elements.taskCompleted.checked = task.completed || false;
        this.updateCharacterCount();
    }

    /**
     * Clear all form inputs
     */
    clearTaskForm() {
        this.elements.taskForm.reset();
        this.elements.taskPriority.value = 'medium';
        this.updateCharacterCount();
    }

    /**
     * Update the character count for the description field
     */
    updateCharacterCount() {
        const current = this.elements.taskDescription.value.length;
        this.elements.descriptionCount.textContent = current;
        
        // Add visual feedback when approaching limit
        if (current > 900) {
            this.elements.descriptionCount.style.color = 'var(--color-danger)';
        } else if (current > 800) {
            this.elements.descriptionCount.style.color = 'var(--color-warning)';
        } else {
            this.elements.descriptionCount.style.color = 'var(--color-text-light)';
        }
    }

    /**
     * Handle task form submission
     */
    async handleTaskSubmit(e) {
        e.preventDefault();
        
        // Gather form data
        const formData = {
            title: this.elements.taskTitle.value.trim(),
            description: this.elements.taskDescription.value.trim(),
            priority: this.elements.taskPriority.value,
            due_date: this.elements.taskDueDate.value || null,
            completed: this.elements.taskCompleted.checked
        };
        
        // Basic client-side validation
        if (!formData.title) {
            this.showToast('Error', 'Please enter a task title', 'error');
            this.elements.taskTitle.focus();
            return;
        }
        
        try {
            // Disable submit button to prevent double submission
            this.elements.submitBtn.disabled = true;
            
            if (AppState.currentTask) {
                // Update existing task
                await taskManager.updateTask(AppState.currentTask.id, formData);
                this.showToast('Success', 'Task updated successfully', 'success');
            } else {
                // Create new task
                await taskManager.createTask(formData);
                this.showToast('Success', 'Task created successfully', 'success');
            }
            
            this.closeTaskModal();
            
        } catch (error) {
            this.showToast('Error', error.message, 'error');
        } finally {
            this.elements.submitBtn.disabled = false;
        }
    }

    /**
     * Show confirmation modal for destructive actions
     */
    showConfirmModal(title, message, onConfirm) {
        this.elements.confirmTitle.textContent = title;
        this.elements.confirmMessage.textContent = message;
        this.elements.confirmModal.style.display = 'flex';
        
        // Remove existing event listeners and add new one
        const newConfirmBtn = this.elements.confirmAction.cloneNode(true);
        this.elements.confirmAction.parentNode.replaceChild(newConfirmBtn, this.elements.confirmAction);
        this.elements.confirmAction = newConfirmBtn;
        
        this.elements.confirmAction.addEventListener('click', () => {
            onConfirm();
            this.closeConfirmModal();
        });
    }

    /**
     * Close confirmation modal
     */
    closeConfirmModal() {
        this.elements.confirmModal.style.display = 'none';
    }

    /**
     * Show toast notification
     * This provides non-intrusive feedback to users about their actions
     */
    showToast(title, message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add close functionality
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        // Add to container
        this.elements.toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            this.removeToast(toast);
        }, 5000);
    }

    /**
     * Remove a toast notification with animation
     */
    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }
}

// ============================
// Main Application Controller
// ============================

/**
 * TaskManager class coordinates all application operations
 * This serves as the main controller that orchestrates data flow
 * between the API, state management, and user interface
 */
class TaskManager {
    constructor() {
        this.ui = new UIManager();
        this.init();
    }

    /**
     * Initialize the application
     * This sets up the initial state and loads data
     */
    async init() {
        try {
            this.ui.showLoading();
            
            // Load initial data in parallel for better performance
            await Promise.all([
                this.loadTasks(),
                this.loadStatistics()
            ]);
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.ui.showToast('Error', 'Failed to load application data', 'error');
        } finally {
            this.ui.hideLoading();
        }
    }

    /**
     * Load tasks from the API with current filters applied
     */
    async loadTasks() {
        try {
            const response = await api.getAllTasks(AppState.currentFilters);
            AppState.tasks = response.data || [];
            AppState.filteredTasks = AppState.tasks;
            
            this.ui.renderTasks(AppState.filteredTasks);
            
            // Update statistics after loading tasks
            await this.loadStatistics();
            
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.ui.showToast('Error', 'Failed to load tasks', 'error');
        }
    }

    /**
     * Load statistics from the API
     */
    async loadStatistics() {
        try {
            const response = await api.getStatistics();
            this.ui.updateStatistics(response.data);
        } catch (error) {
            console.error('Failed to load statistics:', error);
            // Don't show error toast for statistics as it's not critical
        }
    }

    /**
     * Create a new task
     */
    async createTask(taskData) {
        const response = await api.createTask(taskData);
        await this.loadTasks(); // Refresh the list
        return response;
    }

    /**
     * Update an existing task
     */
    async updateTask(id, taskData) {
        const response = await api.updateTask(id, taskData);
        await this.loadTasks(); // Refresh the list
        return response;
    }

    /**
     * Toggle task completion status
     */
    async toggleTask(id) {
        try {
            await api.toggleTaskCompletion(id);
            await this.loadTasks(); // Refresh the list
            this.ui.showToast('Success', 'Task status updated', 'success');
        } catch (error) {
            console.error('Failed to toggle task:', error);
            this.ui.showToast('Error', 'Failed to update task status', 'error');
        }
    }

    /**
     * Edit a task (show edit modal)
     */
    async editTask(id) {
        try {
            const response = await api.getTaskById(id);
            this.ui.showTaskModal(response.data);
        } catch (error) {
            console.error('Failed to load task for editing:', error);
            this.ui.showToast('Error', 'Failed to load task details', 'error');
        }
    }

    /**
     * Delete a task with confirmation
     */
    deleteTask(id) {
        this.ui.showConfirmModal(
            'Delete Task',
            'Are you sure you want to delete this task? This action cannot be undone.',
            async () => {
                try {
                    await api.deleteTask(id);
                    await this.loadTasks(); // Refresh the list
                    this.ui.showToast('Success', 'Task deleted successfully', 'success');
                } catch (error) {
                    console.error('Failed to delete task:', error);
                    this.ui.showToast('Error', 'Failed to delete task', 'error');
                }
            }
        );
    }
}

// ============================
// Global Functions for HTML Event Handlers
// ============================

// These functions provide a bridge between HTML onclick attributes and our class methods
// In a production application, you might prefer to use addEventListener exclusively

function showTaskModal(task = null) {
    taskManager.ui.showTaskModal(task);
}

function closeTaskModal() {
    taskManager.ui.closeTaskModal();
}

function closeConfirmModal() {
    taskManager.ui.closeConfirmModal();
}

// ============================
// Application Initialization
// ============================

// Global task manager instance
let taskManager;

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    taskManager = new TaskManager();
});

// Handle page visibility changes to refresh data when user returns to tab
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && taskManager) {
        // Refresh data when user returns to the tab
        taskManager.loadTasks();
        taskManager.loadStatistics();
    }
});

// Handle online/offline events for better user experience
window.addEventListener('online', () => {
    if (taskManager) {
        taskManager.ui.showToast('Connection Restored', 'You are back online', 'success');
        taskManager.loadTasks();
    }
});

window.addEventListener('offline', () => {
    if (taskManager) {
        taskManager.ui.showToast('Connection Lost', 'You are now offline', 'warning');
    }
});