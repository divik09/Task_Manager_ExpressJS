#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script handles the initial setup of our SQLite database, including:
 * - Creating the database file if it doesn't exist
 * - Setting up the required tables with proper schema
 * - Creating indexes for optimal query performance
 * - Optionally seeding the database with sample data for development
 * 
 * Run this script with: npm run init-db
 */

const database = require('./database');
const Task = require('./Task');

/**
 * Sample task data for development and testing
 * This provides realistic examples that help with frontend development
 */
const sampleTasks = [
    {
        title: 'Complete project documentation',
        description: 'Write comprehensive documentation for the task management system including API documentation and user guide.',
        priority: 'high',
        due_date: '2024-12-31',
        completed: false
    },
    {
        title: 'Review code with team',
        description: 'Schedule and conduct code review session with the development team to ensure code quality standards.',
        priority: 'medium',
        due_date: '2024-12-15',
        completed: false
    },
    {
        title: 'Update dependencies',
        description: 'Check for outdated npm packages and update to latest stable versions while testing for compatibility.',
        priority: 'low',
        due_date: null,
        completed: true
    },
    {
        title: 'Deploy to production',
        description: 'Deploy the application to production server after final testing and approval.',
        priority: 'high',
        due_date: '2024-12-20',
        completed: false
    },
    {
        title: 'Set up monitoring',
        description: 'Configure application monitoring and alerting to track performance and identify issues early.',
        priority: 'medium',
        due_date: '2024-12-25',
        completed: false
    }
];

/**
 * Initialize the database with tables and sample data
 */
async function initializeDatabase() {
    try {
        console.log('🚀 Starting database initialization...');
        
        // Step 1: Establish database connection
        console.log('📡 Connecting to database...');
        await database.connect();
        console.log('✅ Database connection established');

        // Step 2: Create database tables
        console.log('📋 Creating database tables...');
        await database.createTables();
        console.log('✅ Database tables created successfully');

        // Step 3: Check if database already has data
        console.log('🔍 Checking for existing data...');
        const existingTasks = await Task.findAll({ limit: 1 });
        
        if (existingTasks.length > 0) {
            console.log('📊 Database already contains data. Skipping sample data insertion.');
            console.log(`   Current task count: ${(await Task.getStatistics()).total}`);
        } else {
            // Step 4: Insert sample data for development
            console.log('🌱 Inserting sample data...');
            
            for (const taskData of sampleTasks) {
                const task = new Task(taskData);
                await task.save();
                console.log(`   ✓ Created task: "${task.title}"`);
            }
            
            console.log('✅ Sample data inserted successfully');
        }

        // Step 5: Display database statistics
        console.log('📊 Database Statistics:');
        const stats = await Task.getStatistics();
        console.log(`   Total tasks: ${stats.total}`);
        console.log(`   Completed: ${stats.completed}`);
        console.log(`   Pending: ${stats.pending}`);
        console.log(`   Overdue: ${stats.overdue}`);
        
        console.log('\n🎉 Database initialization completed successfully!');
        console.log('💡 You can now start the application with: npm start');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        console.error('\n🔧 Troubleshooting tips:');
        console.error('   • Ensure the directory is writable');
        console.error('   • Check that SQLite3 is properly installed');
        console.error('   • Verify no other process is using the database file');
        
        process.exit(1);
    } finally {
        // Always close the database connection
        try {
            await database.close();
            console.log('🔒 Database connection closed');
        } catch (closeError) {
            console.error('Warning: Error closing database connection:', closeError.message);
        }
    }
}

/**
 * Handle script termination gracefully
 */
process.on('SIGINT', async () => {
    console.log('\n⚠️  Received interrupt signal. Cleaning up...');
    try {
        await database.close();
    } catch (error) {
        console.error('Error during cleanup:', error.message);
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⚠️  Received termination signal. Cleaning up...');
    try {
        await database.close();
    } catch (error) {
        console.error('Error during cleanup:', error.message);
    }
    process.exit(0);
});

// Run the initialization if this script is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;