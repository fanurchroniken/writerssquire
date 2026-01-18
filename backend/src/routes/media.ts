import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase, supabaseAdmin } from '../config/database.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getOrCreateUser } from '../services/userService.js';

const router = Router();

async function getDbUser(req: AuthenticatedRequest) {
  if (!req.user) return null;
  return await getOrCreateUser({
    id: req.user.id,
    email: req.user.email,
  });
}

async function checkWorldAccess(worldId: string, userId: string): Promise<boolean> {
  const { data: world } = await supabase
    .from('worlds')
    .select('owner_id')
    .eq('id', worldId)
    .single();
  
  if (!world) return false;
  if (world.owner_id === userId) return true;
  
  const { data: share } = await supabase
    .from('world_shares')
    .select('permission')
    .eq('world_id', worldId)
    .eq('user_id', userId)
    .single();
  
  return share?.permission === 'edit';
}

// Helper to extract video info from external URLs
function parseExternalVideoUrl(url: string): { provider: string; videoId: string; thumbnail: string } | null {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&?\s]+)/);
  if (youtubeMatch) {
    return {
      provider: 'youtube',
      videoId: youtubeMatch[1],
      thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      provider: 'vimeo',
      videoId: vimeoMatch[1],
      thumbnail: '', // Vimeo requires API call for thumbnail
    };
  }

  return null;
}

// ============================================
// MEDIA LIBRARY
// ============================================

// Get all media for a world
router.get('/worlds/:worldId/media', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { worldId } = req.params;
    const { file_type, search, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('media')
      .select('*')
      .eq('world_id', worldId)
      .order('created_at', { ascending: false });

    if (file_type) {
      query = query.eq('file_type', file_type);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,caption.ilike.%${search}%`);
    }

    query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

    const { data, error, count } = await query;
    
    if (error) throw error;
    return res.json({ success: true, data: data || [], total: count });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get single media item
router.get('/media/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: { message: 'Media not found' } });

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Create media record (for external URLs or after upload)
router.post('/worlds/:worldId/media', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('Name is required'),
  body('file_type').isIn(['image', 'video', 'audio', 'document']).withMessage('Invalid file type'),
  body('url').trim().isURL().withMessage('Valid URL is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { worldId } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const hasAccess = await checkWorldAccess(worldId, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { 
      name, file_type, mime_type, url, thumbnail_url, external_url,
      file_size, width, height, duration, alt_text, caption, tags, metadata 
    } = req.body;

    // If it's an external video URL, try to parse it
    let finalThumbnail = thumbnail_url;
    let finalExternalUrl = external_url;
    let finalMetadata = metadata || {};

    if (file_type === 'video' && url && !thumbnail_url) {
      const videoInfo = parseExternalVideoUrl(url);
      if (videoInfo) {
        finalThumbnail = videoInfo.thumbnail;
        finalExternalUrl = url;
        finalMetadata = { ...finalMetadata, provider: videoInfo.provider, videoId: videoInfo.videoId };
      }
    }

    const { data, error } = await supabase
      .from('media')
      .insert({
        world_id: worldId,
        owner_id: user.id,
        name,
        file_type,
        mime_type,
        url,
        thumbnail_url: finalThumbnail,
        external_url: finalExternalUrl,
        file_size,
        width,
        height,
        duration,
        alt_text,
        caption,
        tags: tags || [],
        metadata: finalMetadata,
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get signed upload URL for Supabase Storage
router.post('/worlds/:worldId/media/upload-url', authenticateToken, [
  body('filename').trim().isLength({ min: 1 }).withMessage('Filename is required'),
  body('content_type').trim().isLength({ min: 1 }).withMessage('Content type is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { worldId } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const hasAccess = await checkWorldAccess(worldId, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { filename } = req.body;
    
    // Generate unique filename
    const ext = filename.split('.').pop();
    const uniqueFilename = `${worldId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    // Create signed upload URL using admin client
    const { data, error } = await supabaseAdmin
      .storage
      .from('world-media')
      .createSignedUploadUrl(uniqueFilename);

    if (error) throw error;

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('world-media')
      .getPublicUrl(uniqueFilename);

    return res.json({ 
      success: true, 
      data: {
        signedUrl: data.signedUrl,
        path: uniqueFilename,
        publicUrl: publicUrlData.publicUrl,
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update media
router.put('/media/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: media } = await supabase
      .from('media')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!media) return res.status(404).json({ success: false, error: { message: 'Media not found' } });
    if (media.owner_id !== user.id) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { name, alt_text, caption, tags, metadata } = req.body;

    const { data, error } = await supabase
      .from('media')
      .update({ name, alt_text, caption, tags, metadata })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Delete media
router.delete('/media/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: media } = await supabase
      .from('media')
      .select('owner_id, url')
      .eq('id', id)
      .single();

    if (!media) return res.status(404).json({ success: false, error: { message: 'Media not found' } });
    if (media.owner_id !== user.id) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    // Try to delete from storage if it's a Supabase Storage URL
    if (media.url && media.url.includes('supabase')) {
      try {
        const path = media.url.split('/world-media/')[1];
        if (path) {
          await supabaseAdmin.storage.from('world-media').remove([path]);
        }
      } catch (storageError) {
        console.error('Failed to delete from storage:', storageError);
      }
    }

    // Delete element_media references
    await supabase.from('element_media').delete().eq('media_id', id);

    // Delete media record
    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) throw error;
    
    return res.json({ success: true, message: 'Media deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ============================================
// ELEMENT MEDIA (Attach media to elements)
// ============================================

// Get media for an element
router.get('/elements/:elementId/:elementTable/media', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { elementId, elementTable } = req.params;

    const { data, error } = await supabase
      .from('element_media')
      .select('*, media(*)')
      .eq('element_id', elementId)
      .eq('element_table', elementTable)
      .order('sort_order');
    
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Attach media to element
router.post('/elements/:elementId/:elementTable/media', authenticateToken, [
  body('media_id').isUUID().withMessage('Media ID is required'),
], async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { elementId, elementTable } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { media_id, is_cover, is_featured, caption } = req.body;

    // Get max sort_order
    const { data: existing } = await supabase
      .from('element_media')
      .select('sort_order')
      .eq('element_id', elementId)
      .eq('element_table', elementTable)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = (existing?.[0]?.sort_order || 0) + 1;

    // If setting as cover, unset other covers
    if (is_cover) {
      await supabase
        .from('element_media')
        .update({ is_cover: false })
        .eq('element_id', elementId)
        .eq('element_table', elementTable);
    }

    const { data, error } = await supabase
      .from('element_media')
      .insert({
        element_id: elementId,
        element_table: elementTable,
        media_id,
        is_cover: is_cover || false,
        is_featured: is_featured || false,
        caption,
        sort_order: nextOrder,
      })
      .select('*, media(*)')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update element media (reorder, set cover, etc.)
router.put('/element-media/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_cover, is_featured, caption, sort_order } = req.body;

    // If setting as cover, get element info first
    if (is_cover) {
      const { data: elementMedia } = await supabase
        .from('element_media')
        .select('element_id, element_table')
        .eq('id', id)
        .single();

      if (elementMedia) {
        await supabase
          .from('element_media')
          .update({ is_cover: false })
          .eq('element_id', elementMedia.element_id)
          .eq('element_table', elementMedia.element_table);
      }
    }

    const { data, error } = await supabase
      .from('element_media')
      .update({ is_cover, is_featured, caption, sort_order })
      .eq('id', id)
      .select('*, media(*)')
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Detach media from element
router.delete('/element-media/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from('element_media').delete().eq('id', id);
    if (error) throw error;
    
    return res.json({ success: true, message: 'Media detached' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
