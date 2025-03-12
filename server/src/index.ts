import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { connectDB } from './config/database';
import { notFoundHandler, errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import journalRoutes from './routes/journalRoutes';

// Initialize Express app
const app: Application = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  
  // Close server & exit process
  server.close(() => process.exit(1));
});

export default app; 