// Task Controller - handles business logic for task-related HTTP requests
const Task = require('../models/Task');
const { validationResult, matchedData } = require('express-validator');

/**
 * TaskController class encapsulates all the business logic for handling task operations.
 * This separation of concerns keeps our route handlers clean and focused,
 * while centralizing the actual business logic in controller methods.
 */
class TaskController {
    /**
     * Get all tasks with optional filtering and sorting
     * This method handles the complexity of query parameter processing
     */
    static async getAllTasks(req, res) {
        try {
            // Extract and validate query parameters for filtering and sorting
            const options = {};
            
            // Handle completion status filter
            if (req.query.completed !== undefined) {
                options.completed = req.query.completed === 'true';
            }
            
            // Handle priority filter
            if (req.query.priority) {
                const validPriorities = ['low', 'medium', 'high'];
                if (validPriorities.includes(req.query.priority)) {
                    options.priority = req.query.priority;
                }
            }
            
            // Handle search functionality
            if (req.query.search && req.query.search.trim()) {
                options.search = req.query.search.trim();
            }
            
            // Handle date range filtering
            if (req.query.dueBefore) {
                options.dueBefore = req.query.dueBefore;
            }
            
            if (req.query.dueAfter) {
                options.dueAfter = req.query.dueAfter;
            }
            
            // Handle sorting options
            if (req.query.sortBy) {
                options.sortBy = req.query.sortBy;
            }
            
            if (req.query.sortOrder) {
                options.sortOrder = req.query.sortOrder;
            }
            
            // Handle pagination
            if (req.query.limit) {
                const limit = parseInt(req.query.limit);
                if (limit > 0 && limit <= 100) { // Cap at 100 to prevent abuse
                    options.limit = limit;
                }
            }
            
            if (req.query.offset) {
                const offset = parseInt(req.query.offset);
                if (offset >= 0) {
                    options.offset = offset;
                }
            }

            // Fetch tasks from database using the processed options
            const tasks = await Task.findAll(options);
            
            // Return successful response with task data
            res.json({
                success: true,
                data: tasks.map(task => task.toJSON()),
                count: tasks.length,
                filters: options
            });
            
        } catch (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch tasks',
                message: error.message
            });
        }
    }

    /**
     * Get a single task by its ID
     * Demonstrates proper error handling for resource not found scenarios
     */
    static async getTaskById(req, res) {
        try {
            const { id } = req.params;
            
            // Validate that ID is a positive integer
            const taskId = parseInt(id);
            if (isNaN(taskId) || taskId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task ID',
                    message: 'Task ID must be a positive integer'
                });
            }

            // Attempt to find the task in the database
            const task = await Task.findById(taskId);
            
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found',
                    message: `No task found with ID ${taskId}`
                });
            }

            // Return the found task
            res.json({
                success: true,
                data: task.toJSON()
            });
            
        } catch (error) {
            console.error('Error fetching task:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch task',
                message: error.message
            });
        }
    }

    /**
     * Create a new task
     * Demonstrates input validation and proper error handling for creation operations
     */
    static async createTask(req, res) {
        try {
            // Check for validation errors from middleware
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
            }

            // Extract validated data
            const taskData = matchedData(req);
            
            // Create new task instance
            const task = new Task(taskData);
            
            // Save the task to database
            await task.save();
            
            // Return successful creation response
            res.status(201).json({
                success: true,
                message: 'Task created successfully',
                data: task.toJSON()
            });
            
        } catch (error) {
            console.error('Error creating task:', error);
            
            // Handle validation errors from the model
            if (error.message.includes('Validation failed')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task data',
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Failed to create task',
                message: error.message
            });
        }
    }

    /**
     * Update an existing task
     * Handles partial updates while maintaining data integrity
     */
    static async updateTask(req, res) {
        try {
            // Validate input data
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.array()
                });
            }

            const { id } = req.params;
            const taskId = parseInt(id);
            
            if (isNaN(taskId) || taskId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task ID',
                    message: 'Task ID must be a positive integer'
                });
            }

            // Find the existing task
            const existingTask = await Task.findById(taskId);
            if (!existingTask) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found',
                    message: `No task found with ID ${taskId}`
                });
            }

            // Extract validated update data
            const updateData = matchedData(req);
            
            // Apply updates to the existing task
            Object.keys(updateData).forEach(key => {
                existingTask[key] = updateData[key];
            });

            // Save the updated task
            await existingTask.save();
            
            res.json({
                success: true,
                message: 'Task updated successfully',
                data: existingTask.toJSON()
            });
            
        } catch (error) {
            console.error('Error updating task:', error);
            
            if (error.message.includes('Validation failed')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task data',
                    message: error.message
                });
            }
            
            res.status(500).json({
                success: false,
                error: 'Failed to update task',
                message: error.message
            });
        }
    }

    /**
     * Delete a task by ID
     * Demonstrates proper handling of deletion operations
     */
    static async deleteTask(req, res) {
        try {
            const { id } = req.params;
            const taskId = parseInt(id);
            
            if (isNaN(taskId) || taskId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task ID',
                    message: 'Task ID must be a positive integer'
                });
            }

            // Attempt to delete the task
            const deleted = await Task.deleteById(taskId);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found',
                    message: `No task found with ID ${taskId}`
                });
            }

            res.json({
                success: true,
                message: 'Task deleted successfully'
            });
            
        } catch (error) {
            console.error('Error deleting task:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete task',
                message: error.message
            });
        }
    }

    /**
     * Toggle the completion status of a task
     * Convenience endpoint for common task operations
     */
    static async toggleTaskCompletion(req, res) {
        try {
            const { id } = req.params;
            const taskId = parseInt(id);
            
            if (isNaN(taskId) || taskId <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid task ID',
                    message: 'Task ID must be a positive integer'
                });
            }

            // Find the task
            const task = await Task.findById(taskId);
            if (!task) {
                return res.status(404).json({
                    success: false,
                    error: 'Task not found',
                    message: `No task found with ID ${taskId}`
                });
            }

            // Toggle completion status
            await task.toggleCompleted();
            
            res.json({
                success: true,
                message: `Task ${task.completed ? 'completed' : 'marked as pending'}`,
                data: task.toJSON()
            });
            
        } catch (error) {
            console.error('Error toggling task completion:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to toggle task completion',
                message: error.message
            });
        }
    }

    /**
     * Get task statistics for dashboard display
     * Provides useful metrics about the task collection
     */
    static async getTaskStatistics(req, res) {
        try {
            const statistics = await Task.getStatistics();
            
            res.json({
                success: true,
                data: statistics
            });
            
        } catch (error) {
            console.error('Error fetching task statistics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch task statistics',
                message: error.message
            });
        }
    }
}

module.exports = TaskController;