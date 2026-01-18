import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { supabase } from '../config/database.js';
import { getOrCreateUser } from '../services/userService.js';

const router = Router();

/**
 * Helper to get the database user from the authenticated request
 */
async function getDbUser(req: AuthenticatedRequest) {
  if (!req.user) return null;
  
  return await getOrCreateUser({
    id: req.user.id,
    email: req.user.email,
    user_metadata: req.user.user_metadata,
  });
}

/**
 * GET /api/worlds
 * Get all worlds for the current user
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { data: worlds, error } = await supabase
      .from('worlds')
      .select('*')
      .eq('owner_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return res.json({
      success: true,
      data: worlds || [],
    });
  } catch (error) {
    console.error('Error fetching worlds:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch worlds' } });
  }
});

/**
 * GET /api/worlds/:id
 * Get a specific world
 */
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { data: world, error } = await supabase
      .from('worlds')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: { message: 'World not found' } });
      }
      throw error;
    }

    return res.json({ success: true, data: world });
  } catch (error) {
    console.error('Error fetching world:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch world' } });
  }
});

/**
 * POST /api/worlds
 * Create a new world
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { title, description, visibility = 'private', tags = [] } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Title is required' } });
    }

    if (title.length > 100) {
      return res.status(400).json({ success: false, error: { message: 'Title must be 100 characters or less' } });
    }

    const { data: world, error } = await supabase
      .from('worlds')
      .insert({
        owner_id: user.id,
        title: title.trim(),
        description: description || '',
        visibility,
        tags,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data: world });
  } catch (error) {
    console.error('Error creating world:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to create world' } });
  }
});

/**
 * PUT /api/worlds/:id
 * Update a world
 */
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { title, description, visibility, tags, cover_image } = req.body;

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (tags !== undefined) updateData.tags = tags;
    if (cover_image !== undefined) updateData.cover_image = cover_image;

    const { data: world, error } = await supabase
      .from('worlds')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: { message: 'World not found' } });
      }
      throw error;
    }

    return res.json({ success: true, data: world });
  } catch (error) {
    console.error('Error updating world:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update world' } });
  }
});

/**
 * DELETE /api/worlds/:id
 * Delete a world
 */
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { error } = await supabase
      .from('worlds')
      .delete()
      .eq('id', req.params.id)
      .eq('owner_id', user.id);

    if (error) throw error;

    return res.json({ success: true, message: 'World deleted' });
  } catch (error) {
    console.error('Error deleting world:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to delete world' } });
  }
});

export default router;
