import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/database.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware.js';
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
  });
}

/**
 * Helper to check world ownership or edit access
 */
async function checkWorldAccess(worldId: string, userId: string): Promise<boolean> {
  const { data: world } = await supabase
    .from('worlds')
    .select('owner_id')
    .eq('id', worldId)
    .single();
  
  if (!world) return false;
  if (world.owner_id === userId) return true;
  
  // Check shared access
  const { data: share } = await supabase
    .from('world_shares')
    .select('permission')
    .eq('world_id', worldId)
    .eq('user_id', userId)
    .single();
  
  return share?.permission === 'edit';
}

// ============================================
// COUNTRIES
// ============================================

// Get all countries for a world
router.get('/worlds/:worldId/countries', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { worldId } = req.params;
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('world_id', worldId)
      .order('name');
    
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Create country
router.post('/worlds/:worldId/countries', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
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
      name, description, capital, population, government_type, culture, history, geography, 
      map_image, flag_image, custom_properties, gallery, metadata, is_public
    } = req.body;

    const { data, error } = await supabase
      .from('countries')
      .insert({
        world_id: worldId,
        name,
        description,
        capital,
        population,
        government_type,
        culture,
        history,
        geography,
        map_image,
        flag_image,
        custom_properties: custom_properties || {},
        gallery: gallery || [],
        is_public: is_public ?? true,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update country
router.put('/countries/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: country } = await supabase.from('countries').select('world_id').eq('id', id).single();
    if (!country) return res.status(404).json({ success: false, error: { message: 'Country not found' } });

    const hasAccess = await checkWorldAccess(country.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { data, error } = await supabase
      .from('countries')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Delete country
router.delete('/countries/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: country } = await supabase.from('countries').select('world_id').eq('id', id).single();
    if (!country) return res.status(404).json({ success: false, error: { message: 'Country not found' } });

    const hasAccess = await checkWorldAccess(country.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('countries').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Country deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ============================================
// REGIONS
// ============================================

router.get('/worlds/:worldId/regions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { worldId } = req.params;
    const { data, error } = await supabase
      .from('regions')
      .select('*, country:countries(id, name)')
      .eq('world_id', worldId)
      .order('name');
    
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/worlds/:worldId/regions', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
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

    const { name, description, country_id, type, geography, climate, population, map_image, is_public } = req.body;

    const { data, error } = await supabase
      .from('regions')
      .insert({ world_id: worldId, name, description, country_id, type, geography, climate, population, map_image, is_public: is_public ?? true })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/regions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: region } = await supabase.from('regions').select('world_id').eq('id', id).single();
    if (!region) return res.status(404).json({ success: false, error: { message: 'Region not found' } });

    const hasAccess = await checkWorldAccess(region.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { data, error } = await supabase.from('regions').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/regions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: region } = await supabase.from('regions').select('world_id').eq('id', id).single();
    if (!region) return res.status(404).json({ success: false, error: { message: 'Region not found' } });

    const hasAccess = await checkWorldAccess(region.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('regions').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Region deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ============================================
// CHARACTERS
// ============================================

router.get('/worlds/:worldId/characters', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { worldId } = req.params;
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('world_id', worldId)
      .order('name');
    
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/worlds/:worldId/characters', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
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
      name, full_name, aliases, description, appearance, personality, backstory, 
      motivations, role, status, birth_date, death_date, age, gender, species, 
      occupation, portrait_image, tags, is_public 
    } = req.body;

    const { data, error } = await supabase
      .from('characters')
      .insert({
        world_id: worldId,
        name, full_name, aliases: aliases || [], description, appearance, personality, 
        backstory, motivations, role, status: status || 'alive', birth_date, death_date, 
        age, gender, species: species || 'Human', occupation, portrait_image, tags: tags || [], is_public: is_public ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/characters/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: character } = await supabase.from('characters').select('world_id').eq('id', id).single();
    if (!character) return res.status(404).json({ success: false, error: { message: 'Character not found' } });

    const hasAccess = await checkWorldAccess(character.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { data, error } = await supabase.from('characters').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/characters/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: character } = await supabase.from('characters').select('world_id').eq('id', id).single();
    if (!character) return res.status(404).json({ success: false, error: { message: 'Character not found' } });

    const hasAccess = await checkWorldAccess(character.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Character deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ============================================
// TIMELINES
// ============================================

router.get('/worlds/:worldId/timelines', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { worldId } = req.params;
    const { data, error } = await supabase
      .from('timelines')
      .select('*')
      .eq('world_id', worldId)
      .order('sort_order');
    
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/worlds/:worldId/timelines', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
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

    const { title, description, start_date, end_date, era, sort_order, is_public } = req.body;

    const { data, error } = await supabase
      .from('timelines')
      .insert({ world_id: worldId, title, description, start_date, end_date, era, sort_order: sort_order || 0, is_public: is_public ?? true })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/timelines/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: timeline } = await supabase.from('timelines').select('world_id').eq('id', id).single();
    if (!timeline) return res.status(404).json({ success: false, error: { message: 'Timeline not found' } });

    const hasAccess = await checkWorldAccess(timeline.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { data, error } = await supabase.from('timelines').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/timelines/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: timeline } = await supabase.from('timelines').select('world_id').eq('id', id).single();
    if (!timeline) return res.status(404).json({ success: false, error: { message: 'Timeline not found' } });

    const hasAccess = await checkWorldAccess(timeline.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('timelines').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Timeline deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ============================================
// EVENTS
// ============================================

router.get('/worlds/:worldId/events', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { worldId } = req.params;
    const { timeline_id } = req.query;
    
    let query = supabase
      .from('events')
      .select('*, timeline:timelines(id, title)')
      .eq('world_id', worldId);
    
    if (timeline_id) {
      query = query.eq('timeline_id', timeline_id);
    }
    
    const { data, error } = await query.order('sort_order');
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/worlds/:worldId/events', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 characters'),
  body('date').trim().notEmpty().withMessage('Date is required'),
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

    const { title, description, date, end_date, timeline_id, location, significance, participants, tags, sort_order, is_public } = req.body;

    const { data, error } = await supabase
      .from('events')
      .insert({
        world_id: worldId,
        title, description, date, end_date, timeline_id, location, 
        significance: significance || 'moderate', 
        participants: participants || [], 
        tags: tags || [],
        sort_order: sort_order || 0,
        is_public: is_public ?? true
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/events/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: event } = await supabase.from('events').select('world_id').eq('id', id).single();
    if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });

    const hasAccess = await checkWorldAccess(event.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { data, error } = await supabase.from('events').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/events/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: event } = await supabase.from('events').select('world_id').eq('id', id).single();
    if (!event) return res.status(404).json({ success: false, error: { message: 'Event not found' } });

    const hasAccess = await checkWorldAccess(event.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ============================================
// LOCATIONS
// ============================================

router.get('/worlds/:worldId/locations', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { worldId } = req.params;
    const { data, error } = await supabase
      .from('locations')
      .select('*, country:countries(id, name), region:regions(id, name)')
      .eq('world_id', worldId)
      .order('name');
    
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.post('/worlds/:worldId/locations', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name must be 1-100 characters'),
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

    const { name, description, type, country_id, region_id, population, climate, notable_features, map_image, is_public } = req.body;

    const { data, error } = await supabase
      .from('locations')
      .insert({ world_id: worldId, name, description, type, country_id, region_id, population, climate, notable_features, map_image, is_public: is_public ?? true })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.put('/locations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: location } = await supabase.from('locations').select('world_id').eq('id', id).single();
    if (!location) return res.status(404).json({ success: false, error: { message: 'Location not found' } });

    const hasAccess = await checkWorldAccess(location.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { data, error } = await supabase.from('locations').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.delete('/locations/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: location } = await supabase.from('locations').select('world_id').eq('id', id).single();
    if (!location) return res.status(404).json({ success: false, error: { message: 'Location not found' } });

    const hasAccess = await checkWorldAccess(location.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true, message: 'Location deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
