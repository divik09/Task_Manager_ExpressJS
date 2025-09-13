// Import required dependencies - each serves a specific purpose in our application architecture
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();


// Import our custom route handlers
const taskRoutes = require('./routes/tasks');

// Ensure database is connected and tables are created before starting the server
const database = require('./models/database');

(async () => {
    try {
        await database.connect();
        await database.createTables();
        console.log('✅ Database connected and tables ensured');
    } catch (err) {
        console.error('❌ Failed to connect to database:', err);
        process.exit(1);
    }
})();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// Security Configuration
// Helmet adds various HTTP headers to secure our application against common vulnerabilities
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// CORS Configuration
// This allows our frontend to communicate with our backend even if they're on different ports
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate Limiting
// This prevents abuse by limiting how many requests a client can make within a time window
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
});
app.use(limiter);

// Middleware Configuration
// These process every request before it reaches our route handlers
app.use(morgan('combined')); // Logs all HTTP requests for debugging and monitoring
app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded form data
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files

// API Routes
// All task-related API endpoints will be prefixed with /api/tasks
app.use('/api/tasks', taskRoutes);

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Application is healthy' });
});

// Serve the main HTML file for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Global Error Handling Middleware
// This catches any errors that occur during request processing
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.stack);
    
    // Don't expose internal error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(err.status || 500).json({
        error: isDevelopment ? err.message : 'Something went wrong!',
        ...(isDevelopment && { stack: err.stack }),
    });
});

// Handle 404 errors for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`,
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Task Manager Server is running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🛡️  Security: Helmet enabled`);
    console.log(`⚡ Rate Limiting: Active`);
    
    if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Detailed error messages enabled');
    }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;