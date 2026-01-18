import { Router } from 'express';
import authRoutes from './auth.js';
import worldsRoutes from './worlds.js';
import documentsRoutes from './documents.js';
import worldElementsRoutes from './worldElements.js';
import elementTypesRoutes from './elementTypes.js';
import mediaRoutes from './media.js';
import publicWorldsRoutes from './publicWorlds.js';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'WriterSquire API is running',
    timestamp: new Date().toISOString()
  });
});

// API info
router.get('/', (_req, res) => {
  res.json({ 
    message: 'WriterSquire API',
    version: '2.0.0',
    endpoints: {
      health: '/health',
      auth: '/auth',
      worlds: '/worlds',
      documents: '/documents',
      worldElements: '/worlds/:worldId/[countries|regions|characters|timelines|events|locations]',
      elementTypes: '/element-types, /worlds/:worldId/element-types',
      dynamicElements: '/worlds/:worldId/elements',
      media: '/worlds/:worldId/media',
      publicAtlas: '/public/worlds/:worldId'
    }
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Worlds routes
router.use('/worlds', worldsRoutes);

// Documents routes
router.use('/documents', documentsRoutes);

// World elements routes (countries, regions, characters, timelines, events, locations)
router.use('/', worldElementsRoutes);

// Dynamic element types and world elements
router.use('/', elementTypesRoutes);

// Media management
router.use('/', mediaRoutes);

// Public atlas routes
router.use('/', publicWorldsRoutes);

export default router;
