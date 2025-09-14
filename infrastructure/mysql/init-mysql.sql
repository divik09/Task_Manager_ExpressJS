-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS userdb;
USE userdb;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('TASK_CREATED', 'TASK_UPDATED', 'TASK_ASSIGNED', 'TASK_COMPLETED', 'TASK_DUE_SOON') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    task_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_read_status (read_status)
);

-- Insert default admin user (password: admin123 - hashed with BCrypt)
INSERT IGNORE INTO users (id, email, password, first_name, last_name, role)
VALUES (
    'admin-user-id-123',
    'admin@taskmanager.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMeX9gqUG1K7rklNYkNJHvEJhRyOKYPkXDG',
    'Admin',
    'User',
    'ADMIN'
);

-- Insert sample regular user (password: user123 - hashed with BCrypt)
INSERT IGNORE INTO users (id, email, password, first_name, last_name, role)
VALUES (
    'user-user-id-456',
    'user@taskmanager.com',
    '$2a$10$ZLhnHxdpHETcxmtEStgpI.7VU9bCB1nCNT8pBCgstpPd6WJjCb7.W',
    'Regular',
    'User',
    'USER'
);

-- Grant permissions
GRANT ALL PRIVILEGES ON userdb.* TO 'appuser'@'%';
FLUSH PRIVILEGES;