import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not found error handler middleware
 * This middleware is called when no routes match the requested URL
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new ApiError(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Global error handler middleware
 * This middleware handles all errors thrown in the application
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Set default status code and message
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Something went wrong';
  
  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message,
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    },
  };
  
  // Log error in development mode
  if (config.nodeEnv === 'development') {
    console.error(`[ERROR] ${statusCode} - ${message}`);
    console.error(err.stack);
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
}; 