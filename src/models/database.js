// Database connection and management module
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determine database path from environment or use default
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.db');

/**
 * Database class that provides a singleton pattern for database connections.
 * This ensures we only have one active database connection throughout our application,
 * which is more efficient and prevents connection conflicts.
 */
class Database {
    constructor() {
        this.db = null;
    }

    /**
     * Initialize database connection and create tables if they don't exist
     * This method handles the initial setup of our database schema
     */
    async connect() {
        return new Promise((resolve, reject) => {
            // Create database connection with better error handling
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('📗 Connected to SQLite database successfully');
                    
                    // Enable foreign key support for data integrity
                    this.db.run('PRAGMA foreign_keys = ON', (err) => {
                        if (err) {
                            console.error('Error enabling foreign keys:', err.message);
                            reject(err);
                        } else {
                            resolve();
                        }
                    });
                }
            });
        });
    }

    /**
     * Create the tasks table with proper schema design
     * This defines the structure of our task data storage
     */
    async createTables() {
        const createTasksTable = `
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL CHECK(length(title) > 0),
                description TEXT DEFAULT '',
                completed BOOLEAN NOT NULL DEFAULT 0,
                priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
                due_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Create an index on commonly queried fields for better performance
        const createIndexes = [
            'CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date)',
            'CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)'
        ];

        return new Promise((resolve, reject) => {
            // Execute table creation
            this.db.run(createTasksTable, (err) => {
                if (err) {
                    console.error('Error creating tasks table:', err.message);
                    reject(err);
                    return;
                }

                console.log('📋 Tasks table created successfully');

                // Create indexes to improve query performance
                let indexPromises = createIndexes.map(indexQuery => {
                    return new Promise((resolveIndex, rejectIndex) => {
                        this.db.run(indexQuery, (err) => {
                            if (err) {
                                console.error('Error creating index:', err.message);
                                rejectIndex(err);
                            } else {
                                resolveIndex();
                            }
                        });
                    });
                });

                Promise.all(indexPromises)
                    .then(() => {
                        console.log('📊 Database indexes created successfully');
                        resolve();
                    })
                    .catch(reject);
            });
        });
    }

    /**
     * Get the database connection instance
     * This provides controlled access to the database connection
     */
    getConnection() {
        if (!this.db) {
            throw new Error('Database not connected. Call connect() first.');
        }
        return this.db;
    }

    /**
     * Close the database connection gracefully
     * Important for cleanup when shutting down the application
     */
    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        console.error('Error closing database:', err.message);
                        reject(err);
                    } else {
                        console.log('🔒 Database connection closed successfully');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Execute a query with parameters safely using prepared statements
     * This prevents SQL injection attacks and handles parameterization
     */
    async run(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(query, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }

    /**
     * Execute a SELECT query and return the first matching row
     */
    async get(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(query, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Execute a SELECT query and return all matching rows
     */
    async all(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}

// Export a singleton instance to ensure single database connection
const database = new Database();

module.exports = database;