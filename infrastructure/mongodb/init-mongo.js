// MongoDB initialization script for Task Manager
print('Starting MongoDB initialization...');

// Switch to the taskdb database
db = db.getSiblingDB('taskdb');

// Create collections if they don't exist
db.createCollection('tasks');
db.createCollection('chat_sessions');
db.createCollection('chat_messages');

// Create indexes for better performance
// Tasks collection indexes
db.tasks.createIndex({ "createdBy": 1 });
db.tasks.createIndex({ "assignedTo": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "priority": 1 });
db.tasks.createIndex({ "dueDate": 1 });
db.tasks.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "tags": 1 });

// Chat sessions indexes
db.chat_sessions.createIndex({ "userId": 1 });
db.chat_sessions.createIndex({ "createdAt": -1 });

// Chat messages indexes
db.chat_messages.createIndex({ "sessionId": 1 });
db.chat_messages.createIndex({ "userId": 1 });
db.chat_messages.createIndex({ "createdAt": -1 });

// Insert sample tasks
db.tasks.insertMany([
    {
        _id: ObjectId(),
        title: "Set up project infrastructure",
        description: "Configure Docker, databases, and microservices architecture",
        status: "DONE",
        priority: "HIGH",
        assignedTo: "admin-user-id-123",
        createdBy: "admin-user-id-123",
        dueDate: new Date("2024-02-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["infrastructure", "setup", "docker"]
    },
    {
        _id: ObjectId(),
        title: "Implement user authentication",
        description: "Create JWT-based authentication system with role management",
        status: "DONE",
        priority: "HIGH",
        assignedTo: "admin-user-id-123",
        createdBy: "admin-user-id-123",
        dueDate: new Date("2024-02-20"),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["authentication", "security", "jwt"]
    },
    {
        _id: ObjectId(),
        title: "Build Angular frontend components",
        description: "Create responsive UI components for task management",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assignedTo: "user-user-id-456",
        createdBy: "admin-user-id-123",
        dueDate: new Date("2024-03-01"),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["frontend", "angular", "ui"]
    },
    {
        _id: ObjectId(),
        title: "Implement AI chat functionality",
        description: "Integrate OpenAI API for intelligent task assistance",
        status: "TODO",
        priority: "MEDIUM",
        assignedTo: "admin-user-id-123",
        createdBy: "admin-user-id-123",
        dueDate: new Date("2024-03-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["ai", "chat", "openai"]
    },
    {
        _id: ObjectId(),
        title: "Configure notification system",
        description: "Set up email and push notifications for task updates",
        status: "TODO",
        priority: "MEDIUM",
        assignedTo: "user-user-id-456",
        createdBy: "admin-user-id-123",
        dueDate: new Date("2024-03-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["notifications", "email", "kafka"]
    },
    {
        _id: ObjectId(),
        title: "Write comprehensive tests",
        description: "Create unit and integration tests for all services",
        status: "TODO",
        priority: "LOW",
        assignedTo: "user-user-id-456",
        createdBy: "admin-user-id-123",
        dueDate: new Date("2024-03-30"),
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ["testing", "quality", "coverage"]
    }
]);

// Create sample chat session
db.chat_sessions.insertOne({
    _id: ObjectId(),
    userId: "admin-user-id-123",
    title: "Getting Started with Task Manager",
    createdAt: new Date(),
    updatedAt: new Date()
});

print('MongoDB initialization completed successfully!');
print('- Created collections: tasks, chat_sessions, chat_messages');
print('- Created performance indexes');
print('- Inserted sample data: 6 tasks, 1 chat session');
print('Ready for Task Manager application!');