// Validation middleware using express-validator
// This provides input sanitization and validation before data reaches our controllers
const { body, param, query } = require('express-validator');

/**
 * Validation rules for creating new tasks
 * These rules run before the controller method and catch invalid input early
 */
const validateTaskCreation = [
    // Title validation - the most critical field for a task
    body('title')
        .trim() // Remove whitespace from beginning and end
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters')
        .escape(), // Prevent XSS attacks by escaping HTML characters

    // Description validation - optional but with length limits
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .escape(),

    // Priority validation - must be one of predefined values
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be one of: low, medium, high'),

    // Due date validation - must be valid date if provided
    body('due_date')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid ISO 8601 date (YYYY-MM-DD)')
        .custom((value) => {
            // Ensure due date is not in the past (optional business rule)
            const dueDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison
            
            if (dueDate < today) {
                // This is commented out because users might want to add overdue tasks
                // throw new Error('Due date cannot be in the past');
            }
            return true;
        }),

    // Completed status validation
    body('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed status must be a boolean value')
        .toBoolean() // Convert string 'true'/'false' to actual boolean
];

/**
 * Validation rules for updating existing tasks
 * Similar to creation but all fields are optional since it's a partial update
 */
const validateTaskUpdate = [
    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Title cannot be empty if provided')
        .isLength({ min: 1, max: 255 })
        .withMessage('Title must be between 1 and 255 characters')
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters')
        .escape(),

    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority must be one of: low, medium, high'),

    body('due_date')
        .optional()
        .custom((value) => {
            // Handle null/empty values for due date removal
            if (value === null || value === '') {
                return true;
            }
            
            // Validate as ISO date if a value is provided
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                throw new Error('Due date must be a valid ISO 8601 date (YYYY-MM-DD) or null');
            }
            
            return true;
        }),

    body('completed')
        .optional()
        .isBoolean()
        .withMessage('Completed status must be a boolean value')
        .toBoolean()
];

/**
 * Validation for task ID parameters in URLs
 * Ensures we're working with valid numeric IDs
 */
const validateTaskId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Task ID must be a positive integer')
        .toInt() // Convert string to integer
];

/**
 * Validation for query parameters used in filtering and sorting
 * This ensures API consumers use valid query parameters
 */
const validateTaskQuery = [
    query('completed')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('Completed filter must be true or false')
        .toBoolean(),

    query('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Priority filter must be one of: low, medium, high'),

    query('search')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Search term cannot exceed 100 characters')
        .escape(),

    query('sortBy')
        .optional()
        .isIn(['id', 'title', 'priority', 'due_date', 'created_at', 'updated_at'])
        .withMessage('Invalid sort field'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be asc or desc'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
        .toInt(),

    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer')
        .toInt(),

    query('dueBefore')
        .optional()
        .isISO8601()
        .withMessage('dueBefore must be a valid ISO 8601 date'),

    query('dueAfter')
        .optional()
        .isISO8601()
        .withMessage('dueAfter must be a valid ISO 8601 date')
];

/**
 * Custom validation middleware that provides detailed error responses
 * This runs after the validation rules and formats errors consistently
 */
const handleValidationErrors = (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        // Group errors by field for better user experience
        const errorsByField = {};
        errors.array().forEach(error => {
            if (!errorsByField[error.path]) {
                errorsByField[error.path] = [];
            }
            errorsByField[error.path].push(error.msg);
        });

        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            message: 'Please check the provided data and try again',
            details: errorsByField,
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

// Export validation rule sets for use in routes
module.exports = {
    validateTaskCreation,
    validateTaskUpdate,
    validateTaskId,
    validateTaskQuery,
    handleValidationErrors,
    
    // Combined validation middlewares for common use cases
    createTaskValidation: [
        ...validateTaskCreation,
        handleValidationErrors
    ],
    
    updateTaskValidation: [
        ...validateTaskId,
        ...validateTaskUpdate,
        handleValidationErrors
    ],
    
    getTaskValidation: [
        ...validateTaskId,
        handleValidationErrors
    ],
    
    queryTaskValidation: [
        ...validateTaskQuery,
        handleValidationErrors
    ],
    
    deleteTaskValidation: [
        ...validateTaskId,
        handleValidationErrors
    ]
};