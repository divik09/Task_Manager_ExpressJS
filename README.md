# Express Task Manager - Full-Stack Web Application

A comprehensive task management application built with modern web technologies, demonstrating professional full-stack development practices. This project showcases clean architecture, security best practices, responsive design, and robust error handling.

## 🚀 Features

### Core Functionality
- **Complete CRUD Operations**: Create, read, update, and delete tasks
- **Advanced Filtering**: Search by text, filter by status/priority, sort by multiple criteria
- **Task Management**: Mark tasks complete/incomplete, set priorities and due dates
- **Real-time Statistics**: Live dashboard showing task metrics and progress
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices

### Technical Highlights
- **RESTful API**: Clean, well-documented API endpoints following REST principles
- **Data Validation**: Comprehensive input validation on both frontend and backend
- **Security Features**: SQL injection prevention, XSS protection, rate limiting, CORS
- **Professional UI**: Modern design with smooth animations and accessibility features
- **Error Handling**: Graceful error recovery with helpful user feedback
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 🛠 Technology Stack

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast, minimalist web framework
- **SQLite3** - Lightweight, serverless database
- **Express Validator** - Input validation and sanitization
- **Helmet** - Security headers and protection
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logging
- **Rate Limiting** - API abuse prevention

### Frontend
- **Vanilla JavaScript** - Modern ES6+ without framework dependencies
- **CSS3** - Advanced styling with custom properties and grid/flexbox
- **HTML5** - Semantic markup with accessibility features
- **Font Awesome** - Professional icon library
- **Google Fonts** - Typography enhancement

### Development Tools
- **Nodemon** - Automatic server restart during development
- **Git** - Version control
- **NPM** - Package management

## 📁 Project Structure

```
express-task-manager/
├── src/                          # Backend source code
│   ├── controllers/              # Business logic controllers
│   │   └── taskController.js     # Task-related operations
│   ├── middleware/               # Custom middleware
│   │   └── validation.js         # Input validation rules
│   ├── models/                   # Data models and database layer
│   │   ├── database.js           # Database connection and utilities
│   │   ├── Task.js               # Task model with business logic
│   │   └── init-db.js            # Database initialization script
│   ├── routes/                   # API route definitions
│   │   └── tasks.js              # Task-related routes
│   └── app.js                    # Main application entry point
├── public/                       # Frontend static files
│   ├── css/
│   │   └── styles.css            # Comprehensive styling system
│   ├── js/
│   │   └── app.js                # Frontend application logic
│   └── index.html                # Main HTML structure
├── package.json                  # Project dependencies and scripts
├── .env                          # Environment configuration
├── .gitignore                    # Git ignore rules
└── README.md                     # Project documentation
```

## 🚦 Getting Started

### Prerequisites
- **Node.js** (version 16.0.0 or higher)
- **NPM** (comes with Node.js)
- **Git** (for cloning and version control)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd express-task-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the database**
   ```bash
   npm run init-db
   ```
   
   This command will:
   - Create the SQLite database file
   - Set up the required tables with proper schema
   - Insert sample data for development
   - Display database statistics

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000` to access the application

## 🔧 Configuration

### Environment Variables

The application uses environment variables for configuration. The `.env` file contains:

```env
# Server Configuration
PORT=3000                          # Port number for the server
NODE_ENV=development               # Environment mode (development/production)

# Database Configuration
DATABASE_PATH=./database.db        # SQLite database file path

# Security Configuration
CORS_ORIGIN=http://localhost:3000  # Allowed CORS origins

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000       # Rate limit window (15 minutes)
RATE_LIMIT_MAX_REQUESTS=100       # Max requests per window
```

### Customization Options

- **Port Configuration**: Change `PORT` in `.env` to run on different port
- **Database Location**: Modify `DATABASE_PATH` to change database file location
- **Rate Limiting**: Adjust rate limiting settings for your use case
- **CORS Settings**: Configure allowed origins for cross-origin requests

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Tasks

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| GET | `/tasks` | Get all tasks | Query: completed, priority, search, sortBy, sortOrder, limit, offset |
| GET | `/tasks/:id` | Get task by ID | Path: id (integer) |
| POST | `/tasks` | Create new task | Body: title*, description, priority, due_date, completed |
| PUT | `/tasks/:id` | Update task | Path: id, Body: task fields |
| PATCH | `/tasks/:id/toggle` | Toggle completion | Path: id |
| DELETE | `/tasks/:id` | Delete task | Path: id |
| GET | `/tasks/statistics` | Get task statistics | None |

*Required fields marked with asterisk

#### Example Requests

**Create a new task:**
```javascript
POST /api/tasks
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "priority": "high",
  "due_date": "2024-12-31",
  "completed": false
}
```

**Filter and sort tasks:**
```javascript
GET /api/tasks?completed=false&priority=high&sortBy=due_date&sortOrder=asc
```

### Response Format

All API responses follow a consistent format:

```javascript
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

Error responses:
```javascript
{
  "success": false,
  "error": "Error category",
  "message": "Detailed error description",
  "details": { /* validation errors if applicable */ }
}
```

## 🎨 Frontend Architecture

### Component Organization

The frontend follows a modular architecture with clear separation of concerns:

- **APIClient**: Handles all backend communication
- **UIManager**: Manages DOM manipulation and user interactions  
- **TaskManager**: Coordinates application logic and state
- **AppState**: Centralized state management

### Key Features

**Real-time Search and Filtering**
- Debounced search input to prevent excessive API calls
- Multiple filter criteria with instant updates
- Persistent filter state during navigation

**Responsive Design**
- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly interface elements

**Accessibility Features**
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management

**User Experience Enhancements**
- Loading states and progress indicators
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Auto-save and error recovery

## 🔒 Security Features

### Backend Security
- **Input Validation**: Comprehensive validation using express-validator
- **SQL Injection Prevention**: Parameterized queries with prepared statements
- **XSS Protection**: HTML escaping and content security policy
- **Rate Limiting**: Protection against abuse and DDoS attacks
- **Security Headers**: Helmet.js for various security headers
- **CORS Configuration**: Controlled cross-origin access

### Frontend Security
- **Output Encoding**: HTML escaping for user-generated content
- **Client-side Validation**: Defense-in-depth validation strategy
- **Secure Communication**: HTTPS enforcement in production
- **Content Security Policy**: Restricted script and style sources

## 🧪 Testing the Application

### Manual Testing Checklist

**Basic Functionality:**
- [ ] Create a new task with title and description
- [ ] Edit an existing task's details
- [ ] Mark tasks as complete/incomplete
- [ ] Delete tasks with confirmation
- [ ] Search tasks by title/description
- [ ] Filter by priority and completion status
- [ ] Sort by different criteria

**Edge Cases:**
- [ ] Create task with maximum character limits
- [ ] Handle empty search results
- [ ] Test with no tasks (empty state)
- [ ] Verify due date validation
- [ ] Check error handling for network failures

**Responsive Design:**
- [ ] Test on mobile devices (320px+)
- [ ] Verify tablet layout (768px+)
- [ ] Check desktop experience (1024px+)
- [ ] Test landscape/portrait orientations

**Accessibility:**
- [ ] Navigate using only keyboard
- [ ] Test with screen reader
- [ ] Verify color contrast ratios
- [ ] Check focus indicators

### API Testing

Use tools like Postman, curl, or browser developer tools:

```bash
# Test task creation
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","priority":"medium"}'

# Test task retrieval
curl http://localhost:3000/api/tasks

# Test filtering
curl "http://localhost:3000/api/tasks?completed=false&priority=high"
```

## 🚀 Deployment

### Production Preparation

1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   PORT=80
   DATABASE_PATH=/var/lib/taskmanager/database.db
   ```

2. **Security Hardening**
   - Configure reverse proxy (Nginx/Apache)
   - Set up SSL/TLS certificates
   - Configure firewall rules
   - Set up monitoring and logging

3. **Process Management**
   ```bash
   # Using PM2 for process management
   npm install -g pm2
   pm2 start src/app.js --name "task-manager"
   pm2 startup
   pm2 save
   ```

### Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t task-manager .
docker run -p 3000:3000 -v $(pwd)/data:/app/data task-manager
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/new-feature`
3. **Make your changes with tests**
4. **Commit with descriptive messages**: `git commit -m "Add task priority filtering"`
5. **Push to your fork**: `git push origin feature/new-feature`
6. **Create a Pull Request**

### Code Style Guidelines

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing indentation and formatting
- Validate all user inputs
- Handle errors gracefully
- Write responsive CSS
- Test across different browsers

### Adding New Features

When extending the application:

1. **Backend Changes**: Add new routes, controllers, and validation
2. **Database Changes**: Update models and migration scripts  
3. **Frontend Changes**: Update UI components and API calls
4. **Documentation**: Update README and API documentation
5. **Testing**: Verify all functionality works as expected

## 📚 Learning Resources

This project demonstrates concepts from:

- **Full-Stack Development**: Connecting frontend and backend systems
- **RESTful API Design**: Creating clean, predictable interfaces
- **Database Design**: Modeling data relationships and constraints
- **Security Best Practices**: Protecting against common vulnerabilities
- **Modern JavaScript**: ES6+ features and modular programming
- **CSS Architecture**: Scalable styling systems and responsive design
- **User Experience Design**: Creating intuitive, accessible interfaces

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**Database Permission Errors**
```bash
# Ensure database directory is writable
chmod 755 .
chmod 644 database.db
```

**Module Not Found Errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**CORS Errors**
- Check CORS_ORIGIN setting in .env
- Verify frontend and backend URLs match
- Ensure cookies/credentials are handled properly

### Development Tips

- Use browser developer tools for debugging
- Check server logs for backend errors
- Validate API responses with network tab
- Test with different data sets
- Clear browser cache when testing changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- SQLite team for the robust embedded database
- Font Awesome for the comprehensive icon library
- The open-source community for inspiration and best practices

---

Built with ❤️ for learning and demonstration purposes. This project serves as a foundation for understanding modern full-stack web development principles and can be extended for real-world applications.