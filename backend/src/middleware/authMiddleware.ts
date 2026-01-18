import { Request, Response, NextFunction } from 'express';
import { verifySupabaseToken } from '../config/supabase.js';

/**
 * Extended Express Request with user information
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    [key: string]: any;
  };
}

/**
 * Middleware to verify Supabase JWT token
 * Extracts token from Authorization header and verifies it
 * Adds user information to request object if valid
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required. Please provide a valid token.',
          code: 'MISSING_TOKEN',
        },
      });
      return;
    }

    // Verify token with Supabase
    const user = await verifySupabaseToken(token);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or expired token. Please sign in again.',
          code: 'INVALID_TOKEN',
        },
      });
      return;
    }

    // Add user information to request object
    req.user = {
      id: user.id,
      email: user.email,
      // Add any other user properties you need
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication error. Please try again.',
        code: 'AUTH_ERROR',
      },
    });
  }
}

/**
 * Optional middleware - checks if user is authenticated but doesn't fail if not
 * Useful for routes that work with or without authentication
 */
export async function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const user = await verifySupabaseToken(token);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if there's an error
    next();
  }
}
