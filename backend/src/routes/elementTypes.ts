import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/database.js';
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

// ============================================
// ELEMENT TYPES
// ============================================

// Get all element types (system + world-specific)
router.get('/element-types', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { world_id } = req.query;
    
    // Get system element types
    const { data: systemTypes, error: systemError } = await supabase
      .from('element_types')
      .select('*, fields:element_type_fields(*)')
      .or('is_system.eq.true,world_id.is.null')
      .order('sort_order');
    
    if (systemError) throw systemError;

    // If world_id provided, also get world-specific types
    let worldTypes: any[] = [];
    if (world_id) {
      const { data, error } = await supabase
        .from('element_types')
        .select('*, fields:element_type_fields(*)')
        .eq('world_id', world_id)
        .order('sort_order');
      
      if (error) throw error;
      worldTypes = data || [];
    }

    // Merge and sort
    const allTypes = [...(systemTypes || []), ...worldTypes].sort((a, b) => a.sort_order - b.sort_order);

    return res.json({ success: true, data: allTypes });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get single element type with fields
router.get('/element-types/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('element_types')
      .select('*, fields:element_type_fields(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: { message: 'Element type not found' } });

    // Sort fields by sort_order
    if (data.fields) {
      data.fields.sort((a: any, b: any) => a.sort_order - b.sort_order);
    }

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Create custom element type for a world
router.post('/worlds/:worldId/element-types', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
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

    const { name, description, icon, color, fields } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create element type
    const { data: elementType, error: typeError } = await supabase
      .from('element_types')
      .insert({
        world_id: worldId,
        name,
        slug,
        description,
        icon,
        color,
        is_system: false,
      })
      .select()
      .single();

    if (typeError) throw typeError;

    // Create fields if provided
    if (fields && Array.isArray(fields) && fields.length > 0) {
      const fieldInserts = fields.map((field: any, index: number) => ({
        element_type_id: elementType.id,
        name: field.name,
        slug: field.slug || field.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        field_type: field.field_type || 'text',
        description: field.description,
        placeholder: field.placeholder,
        is_required: field.is_required || false,
        is_featured: field.is_featured || false,
        show_in_list: field.show_in_list !== false,
        options: field.options,
        default_value: field.default_value,
        validation: field.validation,
        sort_order: index,
      }));

      const { error: fieldsError } = await supabase
        .from('element_type_fields')
        .insert(fieldInserts);

      if (fieldsError) throw fieldsError;
    }

    // Fetch complete type with fields
    const { data: completeType, error: fetchError } = await supabase
      .from('element_types')
      .select('*, fields:element_type_fields(*)')
      .eq('id', elementType.id)
      .single();

    if (fetchError) throw fetchError;

    return res.status(201).json({ success: true, data: completeType });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update element type
router.put('/element-types/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    // Check if it's a system type (cannot be edited)
    const { data: existingType } = await supabase
      .from('element_types')
      .select('world_id, is_system')
      .eq('id', id)
      .single();

    if (!existingType) return res.status(404).json({ success: false, error: { message: 'Element type not found' } });
    if (existingType.is_system) return res.status(403).json({ success: false, error: { message: 'Cannot edit system element types' } });

    const hasAccess = await checkWorldAccess(existingType.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { name, description, icon, color, sort_order } = req.body;

    const { data, error } = await supabase
      .from('element_types')
      .update({ name, description, icon, color, sort_order })
      .eq('id', id)
      .select('*, fields:element_type_fields(*)')
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Delete element type
router.delete('/element-types/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: existingType } = await supabase
      .from('element_types')
      .select('world_id, is_system')
      .eq('id', id)
      .single();

    if (!existingType) return res.status(404).json({ success: false, error: { message: 'Element type not found' } });
    if (existingType.is_system) return res.status(403).json({ success: false, error: { message: 'Cannot delete system element types' } });

    const hasAccess = await checkWorldAccess(existingType.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('element_types').delete().eq('id', id);
    if (error) throw error;
    
    return res.json({ success: true, message: 'Element type deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ============================================
// ELEMENT TYPE FIELDS
// ============================================

// Add field to element type
router.post('/element-types/:typeId/fields', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('field_type').isIn(['text', 'textarea', 'number', 'select', 'multiselect', 'boolean', 'date', 'image', 'video', 'link', 'element_ref']).withMessage('Invalid field type'),
], async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { typeId } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    // Check access
    const { data: elementType } = await supabase
      .from('element_types')
      .select('world_id, is_system')
      .eq('id', typeId)
      .single();

    if (!elementType) return res.status(404).json({ success: false, error: { message: 'Element type not found' } });
    if (elementType.is_system) return res.status(403).json({ success: false, error: { message: 'Cannot modify system element types' } });

    const hasAccess = await checkWorldAccess(elementType.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { name, field_type, description, placeholder, is_required, is_featured, show_in_list, options, default_value, validation } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    // Get max sort_order
    const { data: existingFields } = await supabase
      .from('element_type_fields')
      .select('sort_order')
      .eq('element_type_id', typeId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const nextOrder = (existingFields?.[0]?.sort_order || 0) + 1;

    const { data, error } = await supabase
      .from('element_type_fields')
      .insert({
        element_type_id: typeId,
        name,
        slug,
        field_type,
        description,
        placeholder,
        is_required: is_required || false,
        is_featured: is_featured || false,
        show_in_list: show_in_list !== false,
        options,
        default_value,
        validation,
        sort_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update field
router.put('/element-type-fields/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    // Get field and check access
    const { data: field } = await supabase
      .from('element_type_fields')
      .select('element_type_id')
      .eq('id', id)
      .single();

    if (!field) return res.status(404).json({ success: false, error: { message: 'Field not found' } });

    const { data: elementType } = await supabase
      .from('element_types')
      .select('world_id, is_system')
      .eq('id', field.element_type_id)
      .single();

    if (elementType?.is_system) return res.status(403).json({ success: false, error: { message: 'Cannot modify system element types' } });

    const hasAccess = await checkWorldAccess(elementType!.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { data, error } = await supabase
      .from('element_type_fields')
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

// Delete field
router.delete('/element-type-fields/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: field } = await supabase
      .from('element_type_fields')
      .select('element_type_id')
      .eq('id', id)
      .single();

    if (!field) return res.status(404).json({ success: false, error: { message: 'Field not found' } });

    const { data: elementType } = await supabase
      .from('element_types')
      .select('world_id, is_system')
      .eq('id', field.element_type_id)
      .single();

    if (elementType?.is_system) return res.status(403).json({ success: false, error: { message: 'Cannot modify system element types' } });

    const hasAccess = await checkWorldAccess(elementType!.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('element_type_fields').delete().eq('id', id);
    if (error) throw error;
    
    return res.json({ success: true, message: 'Field deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// ============================================
// WORLD ELEMENTS (Instances)
// ============================================

// Get all elements of a specific type for a world
router.get('/worlds/:worldId/elements', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { worldId } = req.params;
    const { type_id, type_slug } = req.query;

    let query = supabase
      .from('world_elements')
      .select('*, element_type:element_types(id, name, slug, icon, color)')
      .eq('world_id', worldId);

    if (type_id) {
      query = query.eq('element_type_id', type_id);
    } else if (type_slug) {
      // Find type by slug first
      const { data: types } = await supabase
        .from('element_types')
        .select('id')
        .or(`and(world_id.eq.${worldId},slug.eq.${type_slug}),and(is_system.eq.true,slug.eq.${type_slug})`);
      
      if (types && types.length > 0) {
        query = query.in('element_type_id', types.map(t => t.id));
      }
    }

    const { data, error } = await query.order('sort_order').order('name');
    
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Get single element
router.get('/elements/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('world_elements')
      .select('*, element_type:element_types(*, fields:element_type_fields(*))')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ success: false, error: { message: 'Element not found' } });

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Create element
router.post('/worlds/:worldId/elements', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 200 }).withMessage('Name is required'),
  body('element_type_id')
    .notEmpty().withMessage('Element type is required')
    .matches(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
    .withMessage('Element type must be a valid UUID'),
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

    const { name, element_type_id, description, properties, cover_image, gallery, tags, relationships, is_private } = req.body;

    const { data, error } = await supabase
      .from('world_elements')
      .insert({
        world_id: worldId,
        element_type_id,
        name,
        description,
        properties: properties || {},
        cover_image,
        gallery: gallery || [],
        tags: tags || [],
        relationships: relationships || [],
        is_private: is_private || false,
      })
      .select('*, element_type:element_types(id, name, slug, icon, color)')
      .single();

    if (error) throw error;
    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Update element
router.put('/elements/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: element } = await supabase
      .from('world_elements')
      .select('world_id')
      .eq('id', id)
      .single();

    if (!element) return res.status(404).json({ success: false, error: { message: 'Element not found' } });

    const hasAccess = await checkWorldAccess(element.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { data, error } = await supabase
      .from('world_elements')
      .update(req.body)
      .eq('id', id)
      .select('*, element_type:element_types(id, name, slug, icon, color)')
      .single();

    if (error) throw error;
    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

// Delete element
router.delete('/elements/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getDbUser(req);
    if (!user) return res.status(401).json({ success: false, error: { message: 'Not authenticated' } });

    const { data: element } = await supabase
      .from('world_elements')
      .select('world_id')
      .eq('id', id)
      .single();

    if (!element) return res.status(404).json({ success: false, error: { message: 'Element not found' } });

    const hasAccess = await checkWorldAccess(element.world_id, user.id);
    if (!hasAccess) return res.status(403).json({ success: false, error: { message: 'Access denied' } });

    const { error } = await supabase.from('world_elements').delete().eq('id', id);
    if (error) throw error;
    
    return res.json({ success: true, message: 'Element deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
