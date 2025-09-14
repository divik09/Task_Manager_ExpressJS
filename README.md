# Task Manager - Microservices Application

A comprehensive, enterprise-grade task management application built with modern microservices architecture, featuring Angular frontend, Spring Boot backend services, and advanced DevOps practices.

## 🏗️ Architecture Overview

This application demonstrates professional microservices architecture with the following stack:

### 🎯 Frontend
- **Angular 17** - Modern, standalone component architecture
- **Bootstrap 5** - Responsive UI framework
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming for API calls
- **JWT Authentication** - Secure user sessions

### ⚙️ Backend Microservices
- **Spring Boot 3.2** - Modern Java enterprise framework
- **Spring Cloud Gateway** - API Gateway with routing and load balancing
- **Netflix Eureka** - Service discovery and registration
- **Spring Security** - JWT-based authentication
- **Kafka** - Event-driven communication
- **Redis** - Caching and session storage

### 🗄️ Databases
- **MySQL** - User management and notifications
- **MongoDB** - Task data with flexible schema
- **Redis** - Caching, sessions, and rate limiting

### 🚀 DevOps & Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Maven** - Java dependency management
- **Nginx** - Reverse proxy for frontend

## 🌟 Key Features

### 📋 Task Management
- Complete CRUD operations for tasks
- Advanced filtering and search capabilities
- Task priority and status management
- Due date tracking with overdue indicators
- Tag-based organization
- Bulk operations support
- Kanban board and list views

### 👥 User Management
- User registration and authentication
- Role-based access control (USER/ADMIN)
- Profile management
- JWT token-based security
- Password encryption with BCrypt

### 🤖 AI-Powered Chat
- OpenAI integration for intelligent assistance
- Task-related queries and suggestions
- Chat history persistence
- Multiple conversation sessions

### 🔔 Real-time Notifications
- Kafka-based event processing
- Email notifications for task updates
- In-app notification system
- Notification preferences management

### 📊 Analytics & Reporting
- Task completion statistics
- Performance metrics dashboard
- User productivity insights
- Export capabilities

## 🛠️ Technology Stack

### Microservices Architecture

| Service | Port | Technology | Database | Purpose |
|---------|------|------------|----------|---------|
| **Discovery Service** | 8761 | Spring Boot + Eureka | - | Service registry |
| **API Gateway** | 8080 | Spring Cloud Gateway | Redis | Routing, auth, rate limiting |
| **User Service** | 8081 | Spring Boot + MySQL | MySQL | User management, auth |
| **Task Service** | 8082 | Spring Boot + MongoDB | MongoDB | Task operations |
| **Notification Service** | 8083 | Spring Boot + Kafka | MySQL | Event processing, emails |
| **Chat Service** | 8084 | Spring Boot + OpenAI | Redis | AI chat functionality |
| **Angular Frontend** | 4200 | Angular 17 + Nginx | - | User interface |

### Infrastructure Services

| Service | Port | Purpose |
|---------|------|---------|
| **Zookeeper** | 2181 | Kafka coordination |
| **Kafka** | 9092 | Event streaming |
| **Redis** | 6379 | Caching, sessions |
| **MongoDB** | 27017 | Document database |
| **MySQL** | 3306 | Relational database |

## 🚀 Quick Start

### Prerequisites
- **Docker & Docker Compose** (recommended)
- **Java 17** (for local development)
- **Node.js 18+** (for frontend development)
- **Maven 3.9+** (for Java builds)

### 🐳 Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Task_Manager_ExpressJS
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your OpenAI API key and other configurations
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:4200
   - API Gateway: http://localhost:8080
   - Eureka Dashboard: http://localhost:8761

### Default Credentials
- **Admin**: `admin@taskmanager.com` / `admin123`
- **User**: `user@taskmanager.com` / `user123`

## 📁 Project Structure

```
Task_Manager_ExpressJS/
├── frontend/
│   └── task-manager-angular/        # Angular 17 application
│       ├── src/
│       │   ├── app/
│       │   │   ├── components/      # UI components
│       │   │   ├── services/        # API services
│       │   │   ├── models/          # TypeScript interfaces
│       │   │   ├── guards/          # Route guards
│       │   │   └── interceptors/    # HTTP interceptors
│       │   └── assets/              # Static assets
│       ├── Dockerfile               # Frontend container
│       └── nginx.conf               # Nginx configuration
│
├── backend/                         # Spring Boot microservices
│   ├── discovery-service/           # Eureka server
│   ├── api-gateway/                 # Gateway service
│   ├── user-service/                # User management
│   ├── task-service/                # Task operations
│   ├── notification-service/        # Event processing
│   └── chat-service/                # AI chat
│
├── infrastructure/                  # Database initialization
│   ├── mysql/
│   │   └── init-mysql.sql          # MySQL schema & sample data
│   └── mongodb/
│       └── init-mongo.js           # MongoDB setup & sample data
│
├── docker-compose.yml              # Container orchestration
├── .env.example                    # Environment template
└── README.md                       # This file
```

## 🔧 Development Setup

### Backend Development

Each microservice can be run independently:

```bash
cd backend/discovery-service
mvn spring-boot:run

cd backend/api-gateway
mvn spring-boot:run -Dspring.profiles.active=local

cd backend/user-service
mvn spring-boot:run -Dspring.profiles.active=local
```

### Frontend Development

```bash
cd frontend/task-manager-angular
npm install
npm start
```

The Angular dev server will start at http://localhost:4200 with hot reload.

## 🌐 API Documentation

### Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### Authentication Endpoints
```
POST /api/users/register    # User registration
POST /api/users/login       # User login
POST /api/users/validate    # Token validation
GET  /api/users/profile     # User profile
```

#### Task Management
```
GET    /api/tasks           # List tasks (with filtering)
POST   /api/tasks           # Create task
GET    /api/tasks/{id}      # Get task details
PUT    /api/tasks/{id}      # Update task
DELETE /api/tasks/{id}      # Delete task
PATCH  /api/tasks/{id}/status # Update task status
```

#### Notifications
```
GET    /api/notifications         # Get user notifications
PATCH  /api/notifications/{id}    # Mark as read
DELETE /api/notifications/{id}    # Delete notification
```

#### AI Chat
```
POST /api/chat/message           # Send chat message
GET  /api/chat/history           # Get chat history
DELETE /api/chat/history         # Clear chat history
```

## 🔒 Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control (RBAC)
- Password encryption with BCrypt
- Token refresh mechanism

### API Security
- Rate limiting (100 requests/minute per user)
- CORS configuration
- Input validation and sanitization
- SQL injection prevention
- XSS protection

### Infrastructure Security
- Non-root Docker containers
- Network isolation
- Secure environment variable handling
- Health check endpoints

## 📊 Monitoring & Health Checks

### Health Endpoints
- Discovery Service: http://localhost:8761/actuator/health
- API Gateway: http://localhost:8080/actuator/health
- User Service: http://localhost:8081/actuator/health
- Task Service: http://localhost:8082/actuator/health
- Notification Service: http://localhost:8083/actuator/health
- Chat Service: http://localhost:8084/actuator/health

### Service Discovery
Visit http://localhost:8761 to view the Eureka dashboard with all registered services.

## 🧪 Testing

### Running Tests
```bash
# Backend unit tests
cd backend/user-service
mvn test

# Frontend unit tests
cd frontend/task-manager-angular
npm test

# Integration tests
docker-compose -f docker-compose.test.yml up
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Task CRUD operations
- [ ] Real-time notifications
- [ ] AI chat functionality
- [ ] Responsive UI across devices
- [ ] API rate limiting
- [ ] Error handling

## 🚀 Production Deployment

### Environment Configuration

1. **Update environment variables**
   ```bash
   # Set production values in .env
   NODE_ENV=production
   SPRING_PROFILES_ACTIVE=docker
   OPENAI_API_KEY=your-production-key
   ```

2. **Build production images**
   ```bash
   docker-compose build --no-cache
   ```

3. **Deploy with scaling**
   ```bash
   docker-compose up -d --scale task-service=3 --scale user-service=2
   ```

### Performance Optimization

- **Database Indexing**: Optimized indexes for common queries
- **Connection Pooling**: Configured for high concurrency
- **Caching Strategy**: Redis for session and application data
- **CDN Integration**: For static assets
- **Load Balancing**: Built-in with Spring Cloud Gateway

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for chat service | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `rootpassword` |
| `MONGO_INITDB_ROOT_PASSWORD` | MongoDB password | `password` |
| `SPRING_PROFILES_ACTIVE` | Spring profile | `docker` |

### Service Configuration

Each service has `application.yml` and `application-docker.yml` for different environments.

## 📈 Performance Metrics

- **Startup time**: ~60 seconds for all services
- **Memory usage**: ~2GB total for all containers
- **API response time**: <100ms for cached requests
- **Database queries**: Optimized with indexes
- **Concurrent users**: Supports 100+ concurrent sessions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📋 Roadmap

- [ ] WebSocket integration for real-time updates
- [ ] File attachment support for tasks
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Integration with third-party services (GitHub, Jira)
- [ ] Machine learning for task recommendation
- [ ] Multi-tenant architecture

## 🐛 Troubleshooting

### Common Issues

1. **Services not starting**
   ```bash
   docker-compose logs <service-name>
   ```

2. **Database connection issues**
   ```bash
   # Check if databases are ready
   docker-compose ps
   ```

3. **Frontend not loading**
   - Verify API Gateway is running on port 8080
   - Check browser console for errors

4. **Chat service not working**
   - Ensure OPENAI_API_KEY is set correctly
   - Check chat service logs

### Debug Commands
```bash
# View all service logs
docker-compose logs -f

# Restart specific service
docker-compose restart user-service

# Shell into container
docker-compose exec api-gateway bash
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Spring Boot team for excellent microservices framework
- Angular team for modern frontend development
- Netflix OSS for cloud-native patterns
- Docker for containerization technology
- Open-source community for inspiration and support

---

**Built with ❤️ for demonstrating modern microservices architecture and full-stack development best practices.**