# Task Manager - Quick Start Guide

## Step 1: Install Dependencies and Initialize Database

Open your terminal and navigate to the project directory:

```bash
cd C:\Users\Dell\Downloads\express-task-manager
```

Install all required packages:
```bash
npm install
```

Initialize the database with sample data:
```bash
npm run init-db
```

You should see output like:
```
🚀 Starting database initialization...
📡 Connecting to database...
✅ Database connection established
📋 Creating database tables...
✅ Database tables created successfully
📊 Database indexes created successfully
🌱 Inserting sample data...
   ✓ Created task: "Complete project documentation"
   ✓ Created task: "Review code with team"
   ✓ Created task: "Update dependencies"
   ✓ Created task: "Deploy to production"
   ✓ Created task: "Set up monitoring"
✅ Sample data inserted successfully
📊 Database Statistics:
   Total tasks: 5
   Completed: 1
   Pending: 4
   Overdue: 0

🎉 Database initialization completed successfully!
💡 You can now start the application with: npm start
🔒 Database connection closed
```

## Step 2: Start the Application

For development with auto-restart:
```bash
npm run dev
```

Or for production mode:
```bash
npm start
```

You should see:
```
🚀 Task Manager Server is running on port 3000
📱 Frontend: http://localhost:3000
🔗 API Base URL: http://localhost:3000/api
🛡️  Security: Helmet enabled
⚡ Rate Limiting: Active
🔧 Development mode: Detailed error messages enabled
📗 Connected to SQLite database successfully
```

## Step 3: Test the Application

Open your browser and go to: http://localhost:3000

You should see a modern, professional task management interface with:
- Header showing task statistics
- Search and filter controls
- List of sample tasks
- "Add Task" button

## Step 4: Test Core Functionality

### Test 1: Create a New Task
1. Click "Add Task" button
2. Fill in the form:
   - Title: "Learn Full-Stack Development"
   - Description: "Complete this comprehensive tutorial"
   - Priority: "High"
   - Due Date: Select tomorrow's date
3. Click "Save Task"
4. Verify the task appears in the list
5. Check that statistics update in the header

### Test 2: Edit an Existing Task
1. Hover over any task to see action buttons
2. Click the edit icon (pencil)
3. Modify the title or description
4. Click "Update Task"
5. Verify changes are reflected in the list

### Test 3: Toggle Task Completion
1. Click the checkbox next to any task
2. Verify the task gets strikethrough styling
3. Check that statistics update to show completion
4. Click the checkbox again to mark as pending

### Test 4: Delete a Task
1. Hover over any task
2. Click the delete icon (trash)
3. Confirm the deletion in the popup
4. Verify the task is removed from the list

### Test 5: Search and Filter
1. Type "project" in the search box
2. Verify only matching tasks appear
3. Clear the search
4. Use the priority filter to show only "High" priority tasks
5. Try different sort options

## Step 5: Test API Directly

Open a new terminal and test the API endpoints:

### Get all tasks:
```bash
curl http://localhost:3000/api/tasks
```

### Create a new task:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Task",
    "description": "Testing the API directly",
    "priority": "medium",
    "due_date": "2024-12-31"
  }'
```

### Get task statistics:
```bash
curl http://localhost:3000/api/tasks/statistics
```

## Step 6: Test Error Handling

### Test validation errors:
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "", "priority": "invalid"}'
```

This should return validation errors showing our backend properly validates input.

### Test network error handling:
1. In the browser, open Developer Tools (F12)
2. Go to Network tab
3. Click "Offline" to simulate network failure
4. Try to create a task
5. Verify the application shows appropriate error messages
6. Go back online and verify the application recovers

## Step 7: Test Responsive Design

1. Open Developer Tools (F12)
2. Toggle device simulation (mobile icon)
3. Test different screen sizes:
   - Mobile: 375px width
   - Tablet: 768px width  
   - Desktop: 1200px width
4. Verify the interface adapts appropriately

## Step 8: Test Accessibility

1. Navigate the entire interface using only Tab and Enter keys
2. Verify all interactive elements are accessible
3. Check that focus indicators are visible
4. Test with screen reader if available

## Expected Results

After completing these tests, you should have verified:
- ✅ Backend API responds correctly to all operations
- ✅ Frontend interface updates in real-time
- ✅ Data persistence works across page refreshes  
- ✅ Error handling provides helpful feedback
- ✅ Responsive design works on all device sizes
- ✅ Security measures prevent invalid input
- ✅ Performance is smooth and responsive

## Troubleshooting

If you encounter issues:

1. **Port already in use**: Change PORT in .env file
2. **Database errors**: Delete database.db and run npm run init-db again
3. **Module errors**: Delete node_modules and run npm install
4. **CORS errors**: Check CORS_ORIGIN in .env matches your browser URL

## Next Steps

With a working application, you can:
1. Customize the styling in public/css/styles.css
2. Add new features to the backend API
3. Enhance the frontend with additional functionality
4. Deploy to a production server
5. Add authentication and user management
6. Implement real-time updates with WebSockets
7. Add data export/import capabilities
8. Create automated tests
9. Set up continuous integration/deployment
10. Add monitoring and analytics