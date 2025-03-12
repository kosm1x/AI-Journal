import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { ApiError } from './errorHandler';

/**
 * Interface for JWT payload
 */
interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Extend Express Request interface to include user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and adds user to request object
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Please provide a valid token.');
    }
    
    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Authentication required. Please provide a valid token.');
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
      
      // Add user to request object
      req.user = {
        id: decoded.id,
      };
      
      next();
    } catch (error) {
      throw new ApiError(401, 'Invalid or expired token. Please login again.');
    }
  } catch (error) {
    next(error);
  }
};

export default authenticate; 