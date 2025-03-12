import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Environment variables configuration
 */
export const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
  jwtExpiresIn: '7d', // Use a string value that jsonwebtoken can parse
  
  // MongoDB configuration
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-journal',
  
  // CORS configuration
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

export default config; 