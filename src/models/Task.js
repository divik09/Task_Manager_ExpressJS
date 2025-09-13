// Task model - provides an abstraction layer for task-related database operations
const database = require('./database');

/**
 * Task class that encapsulates all task-related database operations.
 * This follows the Active Record pattern, where each instance represents
 * a database record and includes methods for persistence operations.
 */
class Task {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.completed = Boolean(data.completed) || false;
        this.priority = data.priority || 'medium';
        this.due_date = data.due_date || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    /**
     * Validate task data before saving to database
     * This prevents invalid data from being persisted
     */
    validate() {
        const errors = [];

        // Title validation - must be present and not just whitespace
        if (!this.title || this.title.trim().length === 0) {
            errors.push('Title is required and cannot be empty');
        }

        if (this.title.length > 255) {
            errors.push('Title cannot exceed 255 characters');
        }

        // Priority validation - must be one of allowed values
        const validPriorities = ['low', 'medium', 'high'];
        if (!validPriorities.includes(this.priority)) {
            errors.push('Priority must be one of: low, medium, high');
        }

        // Due date validation - if provided, must be valid date
        if (this.due_date) {
            const date = new Date(this.due_date);
            if (isNaN(date.getTime())) {
                errors.push('Due date must be a valid date');
            }
        }

        // Description length validation
        if (this.description && this.description.length > 1000) {
            errors.push('Description cannot exceed 1000 characters');
        }

        return errors;
    }

    /**
     * Save the current task instance to the database
     * Handles both creation of new tasks and updates to existing ones
     */
    async save() {
        // Validate data before attempting to save
        const validationErrors = this.validate();
        if (validationErrors.length > 0) {
            throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }

        const now = new Date().toISOString();

        if (this.id) {
            // Update existing task
            const query = `
                UPDATE tasks 
                SET title = ?, 
                    description = ?, 
                    completed = ?, 
                    priority = ?, 
                    due_date = ?, 
                    updated_at = ?
                WHERE id = ?
            `;
            
            const params = [
                this.title.trim(),
                this.description.trim(),
                this.completed ? 1 : 0,
                this.priority,
                this.due_date,
                now,
                this.id
            ];

            const result = await database.run(query, params);
            
            if (result.changes === 0) {
                throw new Error('Task not found or no changes made');
            }

            this.updated_at = now;
            return this;
        } else {
            // Create new task
            const query = `
                INSERT INTO tasks (title, description, completed, priority, due_date, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                this.title.trim(),
                this.description.trim(),
                this.completed ? 1 : 0,
                this.priority,
                this.due_date,
                now,
                now
            ];

            const result = await database.run(query, params);
            
            this.id = result.id;
            this.created_at = now;
            this.updated_at = now;
            
            return this;
        }
    }

    /**
     * Find a single task by its ID
     * Returns a Task instance or null if not found
     */
    static async findById(id) {
        const query = 'SELECT * FROM tasks WHERE id = ?';
        const row = await database.get(query, [id]);
        
        return row ? new Task(row) : null;
    }

    /**
     * Find all tasks with optional filtering and sorting
     * This provides flexible querying capabilities for the frontend
     */
    static async findAll(options = {}) {
        let query = 'SELECT * FROM tasks WHERE 1=1';
        const params = [];

        // Filter by completion status if specified
        if (typeof options.completed === 'boolean') {
            query += ' AND completed = ?';
            params.push(options.completed ? 1 : 0);
        }

        // Filter by priority if specified
        if (options.priority) {
            query += ' AND priority = ?';
            params.push(options.priority);
        }

        // Filter by due date range if specified
        if (options.dueBefore) {
            query += ' AND due_date <= ?';
            params.push(options.dueBefore);
        }

        if (options.dueAfter) {
            query += ' AND due_date >= ?';
            params.push(options.dueAfter);
        }

        // Search in title and description if search term provided
        if (options.search) {
            query += ' AND (title LIKE ? OR description LIKE ?)';
            const searchTerm = `%${options.search}%`;
            params.push(searchTerm, searchTerm);
        }

        // Add sorting - default to created_at descending (newest first)
        const validSortFields = ['id', 'title', 'priority', 'due_date', 'created_at', 'updated_at'];
        const sortField = validSortFields.includes(options.sortBy) ? options.sortBy : 'created_at';
        const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC';
        
        query += ` ORDER BY ${sortField} ${sortOrder}`;

        // Add pagination if specified
        if (options.limit) {
            query += ' LIMIT ?';
            params.push(parseInt(options.limit));
            
            if (options.offset) {
                query += ' OFFSET ?';
                params.push(parseInt(options.offset));
            }
        }

        const rows = await database.all(query, params);
        return rows.map(row => new Task(row));
    }

    /**
     * Delete a task by ID
     * Returns true if successful, false if task not found
     */
    static async deleteById(id) {
        const query = 'DELETE FROM tasks WHERE id = ?';
        const result = await database.run(query, [id]);
        return result.changes > 0;
    }

    /**
     * Get task statistics for dashboard purposes
     * This provides useful metrics about the task collection
     */
    static async getStatistics() {
        const queries = {
            total: 'SELECT COUNT(*) as count FROM tasks',
            completed: 'SELECT COUNT(*) as count FROM tasks WHERE completed = 1',
            pending: 'SELECT COUNT(*) as count FROM tasks WHERE completed = 0',
            overdue: `
                SELECT COUNT(*) as count FROM tasks 
                WHERE completed = 0 AND due_date < date('now')
            `,
            byPriority: `
                SELECT priority, COUNT(*) as count 
                FROM tasks 
                WHERE completed = 0 
                GROUP BY priority
            `
        };

        const results = {};
        
        // Execute individual count queries
        for (const [key, query] of Object.entries(queries)) {
            if (key === 'byPriority') {
                results[key] = await database.all(query);
            } else {
                const result = await database.get(query);
                results[key] = result.count;
            }
        }

        return results;
    }

    /**
     * Toggle the completion status of a task
     * Convenience method for common operation
     */
    async toggleCompleted() {
        this.completed = !this.completed;
        return await this.save();
    }

    /**
     * Convert task instance to plain object for JSON serialization
     * This ensures consistent API responses
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            completed: this.completed,
            priority: this.priority,
            due_date: this.due_date,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Task;