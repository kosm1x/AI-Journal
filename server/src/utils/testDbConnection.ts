import { connectDB, disconnectDB } from '../config/database';
import mongoose from 'mongoose';

/**
 * Test MongoDB connection
 */
const testDbConnection = async (): Promise<void> => {
  try {
    console.log('Testing MongoDB connection...');
    
    // Connect to MongoDB
    await connectDB();
    
    // Get connection status
    const { host, port, name } = mongoose.connection;
    console.log(`MongoDB connected successfully to: ${host}:${port}/${name}`);
    
    // List all collections
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log('Available collections:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
    } else {
      console.log('No database connection available');
    }
    
    // Disconnect from MongoDB
    await disconnectDB();
    
    console.log('Database connection test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Database connection test failed:', error);
    process.exit(1);
  }
};

// Run the test
testDbConnection(); 