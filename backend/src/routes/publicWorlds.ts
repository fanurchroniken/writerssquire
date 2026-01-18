import { Router, Response } from 'express';
import { supabase } from '../config/database.js';

const router = Router();

async function getPublicWorld(worldId: string) {
  const { data, error } = await supabase
    .from('worlds')
    .select('*')
    .eq('id', worldId)
    .eq('visibility', 'public')
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

router.get('/public/worlds/:id', async (req, res: Response) => {
  try {
    const world = await getPublicWorld(req.params.id);
    if (!world) {
      return res.status(404).json({ success: false, error: { message: 'World not found' } });
    }

    return res.json({ success: true, data: world });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/public/worlds/:worldId/countries', async (req, res: Response) => {
  try {
    const { worldId } = req.params;
    const world = await getPublicWorld(worldId);
    if (!world) {
      return res.status(404).json({ success: false, error: { message: 'World not found' } });
    }

    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('world_id', worldId)
      .or('is_public.is.null,is_public.eq.true')
      .order('name');

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/public/worlds/:worldId/regions', async (req, res: Response) => {
  try {
    const { worldId } = req.params;
    const world = await getPublicWorld(worldId);
    if (!world) {
      return res.status(404).json({ success: false, error: { message: 'World not found' } });
    }

    const { data, error } = await supabase
      .from('regions')
      .select('*, country:countries(id, name)')
      .eq('world_id', worldId)
      .or('is_public.is.null,is_public.eq.true')
      .order('name');

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/public/worlds/:worldId/characters', async (req, res: Response) => {
  try {
    const { worldId } = req.params;
    const world = await getPublicWorld(worldId);
    if (!world) {
      return res.status(404).json({ success: false, error: { message: 'World not found' } });
    }

    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('world_id', worldId)
      .or('is_public.is.null,is_public.eq.true')
      .order('name');

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/public/worlds/:worldId/timelines', async (req, res: Response) => {
  try {
    const { worldId } = req.params;
    const world = await getPublicWorld(worldId);
    if (!world) {
      return res.status(404).json({ success: false, error: { message: 'World not found' } });
    }

    const { data, error } = await supabase
      .from('timelines')
      .select('*')
      .eq('world_id', worldId)
      .or('is_public.is.null,is_public.eq.true')
      .order('sort_order');

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/public/worlds/:worldId/events', async (req, res: Response) => {
  try {
    const { worldId } = req.params;
    const world = await getPublicWorld(worldId);
    if (!world) {
      return res.status(404).json({ success: false, error: { message: 'World not found' } });
    }

    const { timeline_id } = req.query;
    let query = supabase
      .from('events')
      .select('*, timeline:timelines(id, title)')
      .eq('world_id', worldId)
      .or('is_public.is.null,is_public.eq.true');

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

router.get('/public/worlds/:worldId/locations', async (req, res: Response) => {
  try {
    const { worldId } = req.params;
    const world = await getPublicWorld(worldId);
    if (!world) {
      return res.status(404).json({ success: false, error: { message: 'World not found' } });
    }

    const { data, error } = await supabase
      .from('locations')
      .select('*, country:countries(id, name), region:regions(id, name)')
      .eq('world_id', worldId)
      .or('is_public.is.null,is_public.eq.true')
      .order('name');

    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/public/element-types', async (req, res: Response) => {
  try {
    const { world_id } = req.query;

    if (world_id && typeof world_id === 'string') {
      const world = await getPublicWorld(world_id);
      if (!world) {
        return res.status(404).json({ success: false, error: { message: 'World not found' } });
      }
    }

    const { data: systemTypes, error: systemError } = await supabase
      .from('element_types')
      .select('*, fields:element_type_fields(*)')
      .or('is_system.eq.true,world_id.is.null')
      .order('sort_order');

    if (systemError) throw systemError;

    let worldTypes: any[] = [];
    if (world_id && typeof world_id === 'string') {
      const { data, error } = await supabase
        .from('element_types')
        .select('*, fields:element_type_fields(*)')
        .eq('world_id', world_id)
        .order('sort_order');

      if (error) throw error;
      worldTypes = data || [];
    }

    const allTypes = [...(systemTypes || []), ...worldTypes].sort((a, b) => a.sort_order - b.sort_order);
    allTypes.forEach((type: any) => {
      if (type.fields) {
        type.fields.sort((a: any, b: any) => a.sort_order - b.sort_order);
      }
    });

    return res.json({ success: true, data: allTypes });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

router.get('/public/worlds/:worldId/elements', async (req, res: Response) => {
  try {
    const { worldId } = req.params;
    const world = await getPublicWorld(worldId);
    if (!world) {
      return res.status(404).json({ success: false, error: { message: 'World not found' } });
    }

    const { type_id, type_slug } = req.query;
    let query = supabase
      .from('world_elements')
      .select('*, element_type:element_types(id, name, slug, icon, color)')
      .eq('world_id', worldId)
      .or('is_private.is.null,is_private.eq.false');

    if (type_id) {
      query = query.eq('element_type_id', type_id);
    } else if (type_slug) {
      const { data: types } = await supabase
        .from('element_types')
        .select('id')
        .or(`and(world_id.eq.${worldId},slug.eq.${type_slug}),and(is_system.eq.true,slug.eq.${type_slug})`);

      if (types && types.length > 0) {
        query = query.in('element_type_id', types.map((type) => type.id));
      }
    }

    const { data, error } = await query.order('sort_order').order('name');
    if (error) throw error;
    return res.json({ success: true, data: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { message: error.message } });
  }
});

export default router;
