import express from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// --- Mocks (must come before importing the router) ---

type SupabaseResponse<T> = { data: T | null; error: any };

const mockState = {
  listResponse: [] as any[],
  getResponse: null as any | null,
  insertResponse: null as any | null,
  updateResponse: null as any | null,
  deleteError: null as any | null,
  lastInsert: null as any | null,
  lastUpdate: null as any | null,
  lastSelect: null as any | null,
  lastFilters: [] as Array<{ key: string; value: any }>,
};

function createThenableResponse<T>(response: SupabaseResponse<T>) {
  return {
    then: (resolve: any) => resolve(response),
  };
}

class QueryBuilder {
  private mode: 'list' | 'get' | 'insert' | 'update' | 'delete' = 'list';

  select(sel: string) {
    mockState.lastSelect = sel;
    return this;
  }

  eq(key: string, value: any) {
    mockState.lastFilters.push({ key, value });
    return this;
  }

  order(_key: string, _opts: any) {
    this.mode = 'list';
    return createThenableResponse({ data: mockState.listResponse, error: null });
  }

  single() {
    if (this.mode === 'get') {
      return Promise.resolve({ data: mockState.getResponse, error: null });
    }
    if (this.mode === 'insert') {
      return Promise.resolve({ data: mockState.insertResponse, error: null });
    }
    if (this.mode === 'update') {
      return Promise.resolve({ data: mockState.updateResponse, error: null });
    }
    return Promise.resolve({ data: null, error: null });
  }

  insert(payload: any) {
    mockState.lastInsert = payload;
    this.mode = 'insert';
    return {
      select: () => ({
        single: () => this.single(),
      }),
    };
  }

  update(payload: any) {
    mockState.lastUpdate = payload;
    this.mode = 'update';
    return {
      eq: (_k: string, _v: any) => ({
        eq: (_k2: string, _v2: any) => ({
          select: () => ({
            single: () => this.single(),
          }),
        }),
      }),
    };
  }

  delete() {
    this.mode = 'delete';
    return {
      eq: (_k: string, _v: any) => ({
        eq: (_k2: string, _v2: any) => createThenableResponse({ data: null, error: mockState.deleteError }),
      }),
    };
  }
}

vi.mock('../middleware/authMiddleware.js', () => {
  return {
    authenticateToken: (req: any, _res: any, next: any) => {
      req.user = { id: 'supabase-user-1', email: 'test@example.com' };
      next();
    },
  };
});

vi.mock('../services/userService.js', () => {
  return {
    getOrCreateUser: async () => ({ id: 'db-user-1' }),
  };
});

vi.mock('../config/database.js', () => {
  return {
    supabase: {
      from: (_table: string) => {
        mockState.lastFilters = [];
        return new QueryBuilder();
      },
    },
  };
});

// Import after mocks
import documentsRouter from './documents.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/documents', documentsRouter);
  return app;
}

async function request(app: express.Express, method: string, path: string, body?: any) {
  const server = app.listen(0);
  const { port } = server.address() as any;
  try {
    const res = await fetch(`http://127.0.0.1:${port}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer fake' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, json };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

beforeEach(() => {
  mockState.listResponse = [];
  mockState.getResponse = null;
  mockState.insertResponse = null;
  mockState.updateResponse = null;
  mockState.deleteError = null;
  mockState.lastInsert = null;
  mockState.lastUpdate = null;
  mockState.lastSelect = null;
  mockState.lastFilters = [];
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('documents routes', () => {
  it('GET /documents returns list including hierarchy fields (parent_document_id, order)', async () => {
    mockState.listResponse = [
      {
        id: 'doc-1',
        title: 'Manuscript A',
        type: 'manuscript',
        status: 'draft',
        language: 'en',
        word_count: 0,
        world_id: 'world-1',
        parent_document_id: null,
        order: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const app = createApp();
    const res = await request(app, 'GET', '/documents?world_id=world-1');

    expect(res.status).toBe(200);
    expect(res.json?.success).toBe(true);
    expect(res.json?.data?.[0]?.parent_document_id).toBe(null);
    expect(res.json?.data?.[0]?.order).toBe(1);
    expect(String(mockState.lastSelect)).toContain('parent_document_id');
    expect(String(mockState.lastSelect)).toContain('"order"');
  });

  it('POST /documents persists hierarchy fields and computes counts from content', async () => {
    mockState.insertResponse = {
      id: 'doc-2',
      title: 'Chapter 1',
      type: 'chapter',
      status: 'draft',
      language: 'en',
      word_count: 2,
      character_count: 11,
      world_id: 'world-1',
      parent_document_id: 'doc-1',
      order: 3,
      content: 'Hello world',
      plain_text: 'Hello world',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const app = createApp();
    const res = await request(app, 'POST', '/documents', {
      title: 'Chapter 1',
      type: 'chapter',
      world_id: 'world-1',
      parent_document_id: 'doc-1',
      order: 3,
      content: 'Hello world',
    });

    expect(res.status).toBe(201);
    expect(res.json?.success).toBe(true);

    expect(mockState.lastInsert).toMatchObject({
      owner_id: 'db-user-1',
      title: 'Chapter 1',
      type: 'chapter',
      world_id: 'world-1',
      parent_document_id: 'doc-1',
      order: 3,
      content: 'Hello world',
      plain_text: 'Hello world',
      word_count: 2,
      character_count: 11,
    });
  });

  it('PUT /documents/:id updates parent_document_id and order', async () => {
    mockState.updateResponse = {
      id: 'doc-2',
      title: 'Chapter 1',
      type: 'chapter',
      status: 'draft',
      language: 'en',
      word_count: 0,
      character_count: 0,
      world_id: 'world-1',
      parent_document_id: 'doc-9',
      order: 10,
      content: '',
      plain_text: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const app = createApp();
    const res = await request(app, 'PUT', '/documents/doc-2', {
      parent_document_id: 'doc-9',
      order: 10,
    });

    expect(res.status).toBe(200);
    expect(res.json?.success).toBe(true);
    expect(mockState.lastUpdate).toMatchObject({
      parent_document_id: 'doc-9',
      order: 10,
    });
  });
});

