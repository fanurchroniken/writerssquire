import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { syncUserFromSupabase, getUserBySupabaseId } from '../services/userService.js';
import { verifySupabaseToken } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/auth/me
 * Get current authenticated user's profile
 * Requires authentication
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not authenticated' },
      });
    }

    // Get user from Supabase database
    let user = await getUserBySupabaseId(req.user.id);

    if (!user) {
      // User doesn't exist in Supabase database yet - sync from Supabase Auth
      const token = req.headers.authorization?.split(' ')[1] || '';
      const supabaseUser = await verifySupabaseToken(token);
      if (supabaseUser) {
        user = await syncUserFromSupabase(supabaseUser);
      } else {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid token' },
        });
      }
    }

    // Return user from Supabase database (map snake_case to camelCase for API)
    return res.json({
      success: true,
      data: {
        id: user.id,
        supabaseId: user.supabase_id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar,
        subscriptionTier: user.subscription_tier,
        preferences: user.preferences,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user profile' },
    });
  }
});

/**
 * POST /api/auth/sync
 * Sync user data from Supabase Auth to Supabase database
 * This endpoint is called after user signs up/logs in to ensure user exists in database
 * Requires authentication
 */
router.post('/sync', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not authenticated' },
      });
    }

    // Get full user data from Supabase
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { message: 'Token required' },
      });
    }

    const supabaseUser = await verifySupabaseToken(token);
    if (!supabaseUser) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid token' },
      });
    }

    // Sync user to Supabase database
    const user = await syncUserFromSupabase(supabaseUser);

    return res.json({
      success: true,
      data: {
        id: user.id,
        supabaseId: user.supabase_id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatar: user.avatar,
        subscriptionTier: user.subscription_tier,
        preferences: user.preferences,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to sync user data' },
    });
  }
});

export default router;
