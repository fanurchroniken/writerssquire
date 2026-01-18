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
 * GET /api/documents
 * Get all documents for the current user
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { world_id, type, status, parent_document_id } = req.query;

    let query = supabase
      .from('documents')
      .select('id, title, type, status, language, word_count, world_id, parent_document_id, "order", created_at, updated_at')
      .eq('owner_id', user.id);

    if (world_id) query = query.eq('world_id', world_id);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (parent_document_id) query = query.eq('parent_document_id', parent_document_id);

    const { data: documents, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: documents || [] });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch documents' } });
  }
});

/**
 * GET /api/documents/:id
 * Get a specific document
 */
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .eq('owner_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: { message: 'Document not found' } });
      }
      throw error;
    }

    return res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch document' } });
  }
});

/**
 * POST /api/documents
 * Create a new document
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const {
      title,
      type = 'manuscript',
      language = 'en',
      world_id,
      parent_document_id,
      order,
      content = '',
    } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Title is required' } });
    }

    if (title.length > 200) {
      return res.status(400).json({ success: false, error: { message: 'Title must be 200 characters or less' } });
    }

    if (order !== undefined && (typeof order !== 'number' || !Number.isFinite(order) || Math.floor(order) !== order)) {
      return res.status(400).json({ success: false, error: { message: 'Order must be an integer' } });
    }

    // Calculate word count from content
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    const wordCount = plainText ? plainText.split(/\s+/).length : 0;

    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        owner_id: user.id,
        title: title.trim(),
        type,
        language,
        world_id: world_id || null,
        parent_document_id: parent_document_id || null,
        order: order ?? 0,
        content,
        plain_text: plainText,
        word_count: wordCount,
        character_count: plainText.length,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to create document' } });
  }
});

/**
 * PUT /api/documents/:id
 * Update a document
 */
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { title, content, type, language, status, world_id, parent_document_id, order } = req.body;

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (type !== undefined) updateData.type = type;
    if (language !== undefined) updateData.language = language;
    if (status !== undefined) updateData.status = status;
    if (world_id !== undefined) updateData.world_id = world_id;
    if (parent_document_id !== undefined) updateData.parent_document_id = parent_document_id;
    if (order !== undefined) updateData.order = order;
    
    if (content !== undefined) {
      updateData.content = content;
      const plainText = content.replace(/<[^>]*>/g, '').trim();
      updateData.plain_text = plainText;
      updateData.word_count = plainText ? plainText.split(/\s+/).length : 0;
      updateData.character_count = plainText.length;
    }

    const { data: document, error } = await supabase
      .from('documents')
      .update(updateData)
      .eq('id', req.params.id)
      .eq('owner_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: { message: 'Document not found' } });
      }
      throw error;
    }

    return res.json({ success: true, data: document });
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to update document' } });
  }
});

/**
 * DELETE /api/documents/:id
 * Delete a document
 */
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await getDbUser(req);
    if (!user) {
      return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', req.params.id)
      .eq('owner_id', user.id);

    if (error) throw error;

    return res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to delete document' } });
  }
});

export default router;
