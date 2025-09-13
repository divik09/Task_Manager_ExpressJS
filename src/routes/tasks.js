// Task Routes - defines all HTTP endpoints for task operations
// This file maps URLs to controller methods and applies appropriate middleware
const express = require('express');
const router = express.Router();

// Import controller and validation middleware
const TaskController = require('../controllers/taskController');
const {
    createTaskValidation,
    updateTaskValidation,
    getTaskValidation,
    queryTaskValidation,
    deleteTaskValidation
} = require('../middleware/validation');

/**
 * Route: GET /api/tasks
 * Purpose: Retrieve all tasks with optional filtering, sorting, and pagination
 * Middleware: Query parameter validation
 * 
 * Query parameters supported:
 * - completed: boolean (true/false) - filter by completion status
 * - priority: string (low/medium/high) - filter by priority level
 * - search: string - search in title and description
 * - sortBy: string - field to sort by
 * - sortOrder: string (asc/desc) - sort direction
 * - limit: integer - maximum number of results
 * - offset: integer - number of results to skip for pagination
 * - dueBefore: date - filter tasks due before this date
 * - dueAfter: date - filter tasks due after this date
 */
router.get('/', queryTaskValidation, TaskController.getAllTasks);

/**
 * Route: GET /api/tasks/statistics
 * Purpose: Get aggregate statistics about tasks for dashboard display
 * 
 * This endpoint provides useful metrics like:
 * - Total number of tasks
 * - Number of completed vs pending tasks
 * - Number of overdue tasks
 * - Tasks grouped by priority level
 * 
 * Note: This route comes before the /:id route to prevent 'statistics' 
 * from being interpreted as a task ID
 */
router.get('/statistics', TaskController.getTaskStatistics);

/**
 * Route: GET /api/tasks/:id
 * Purpose: Retrieve a single task by its unique identifier
 * Middleware: ID parameter validation
 * 
 * The :id parameter must be a positive integer representing the task's database ID
 */
router.get('/:id', getTaskValidation, TaskController.getTaskById);

/**
 * Route: POST /api/tasks
 * Purpose: Create a new task
 * Middleware: Request body validation for task creation
 * 
 * Required fields:
 * - title: string (1-255 characters)
 * 
 * Optional fields:
 * - description: string (max 1000 characters)
 * - priority: string (low/medium/high, defaults to medium)
 * - due_date: ISO 8601 date string
 * - completed: boolean (defaults to false)
 */
router.post('/', createTaskValidation, TaskController.createTask);

/**
 * Route: PUT /api/tasks/:id
 * Purpose: Update an existing task (partial update supported)
 * Middleware: ID validation + request body validation for updates
 * 
 * All fields are optional for updates - only provided fields will be modified.
 * This allows for partial updates where users can change just the title,
 * just the completion status, or any combination of fields.
 */
router.put('/:id', updateTaskValidation, TaskController.updateTask);

/**
 * Route: PATCH /api/tasks/:id/toggle
 * Purpose: Toggle the completion status of a task
 * Middleware: ID parameter validation
 * 
 * This is a convenience endpoint that specifically handles the common operation
 * of marking a task as complete or incomplete. It's more semantic than a
 * general update and requires no request body.
 */
router.patch('/:id/toggle', getTaskValidation, TaskController.toggleTaskCompletion);

/**
 * Route: DELETE /api/tasks/:id
 * Purpose: Permanently delete a task
 * Middleware: ID parameter validation
 * 
 * This operation is irreversible - once a task is deleted, it cannot be recovered.
 * In a production application, you might consider implementing soft deletes
 * (marking records as deleted rather than removing them) for better data recovery options.
 */
router.delete('/:id', deleteTaskValidation, TaskController.deleteTask);

/**
 * Error handling middleware specific to task routes
 * This catches any errors that weren't handled by the controller methods
 */
router.use((error, req, res, next) => {
    console.error('Task route error:', error);
    
    // Handle specific types of errors that might occur in task operations
    if (error.code === 'SQLITE_CONSTRAINT') {
        return res.status(400).json({
            success: false,
            error: 'Database constraint violation',
            message: 'The provided data violates database constraints'
        });
    }
    
    if (error.code === 'ENOENT') {
        return res.status(500).json({
            success: false,
            error: 'Database file not found',
            message: 'Database connection could not be established'
        });
    }
    
    // Generic error response
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred while processing your request'
    });
});

module.exports = router;