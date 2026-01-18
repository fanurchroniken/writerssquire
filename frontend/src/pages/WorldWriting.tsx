import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DocumentListItem {
  id: string;
  title: string;
  type: string;
  status: string;
  language: string;
  word_count: number;
  world_id: string | null;
  parent_document_id: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

type DocNode = DocumentListItem & { children: DocNode[] };

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const num = typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(num) ? num : fallback;
}

function toString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function normalizeDocument(raw: Record<string, unknown>): DocumentListItem {
  return {
    id: toString(raw.id),
    title: toString(raw.title),
    type: toString(raw.type, 'manuscript'),
    status: toString(raw.status, 'draft'),
    language: toString(raw.language, 'en'),
    word_count: toNumber(raw.word_count, 0),
    world_id: (raw.world_id as string | null | undefined) ?? null,
    parent_document_id: (raw.parent_document_id as string | null | undefined) ?? null,
    order: toNumber(raw.order ?? raw['order'], 0),
    created_at: toString(raw.created_at),
    updated_at: toString(raw.updated_at),
  };
}

function buildTree(items: DocumentListItem[]): DocNode[] {
  const byId = new Map<string, DocNode>();
  for (const item of items) byId.set(item.id, { ...item, children: [] });

  const roots: DocNode[] = [];
  for (const node of byId.values()) {
    if (node.parent_document_id && byId.has(node.parent_document_id)) {
      byId.get(node.parent_document_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRec = (nodes: DocNode[]) => {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.updated_at.localeCompare(b.updated_at));
    for (const n of nodes) sortRec(n.children);
  };
  sortRec(roots);

  return roots;
}

export default function WorldWriting() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [docs, setDocs] = useState<DocumentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'manuscript' | 'chapter' | 'scene' | 'note'>('manuscript');
  const [newParentId, setNewParentId] = useState<string | null>(null);

  const headers = useMemo(() => {
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [session?.access_token]);

  const tree = useMemo(() => buildTree(docs), [docs]);

  useEffect(() => {
    if (!session?.access_token || !worldId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/api/documents?world_id=${encodeURIComponent(worldId)}`, { headers });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = json?.error?.message || `Failed to load documents (${res.status})`;
          throw new Error(msg);
        }
        if (cancelled) return;
        const raw = (json?.data as Record<string, unknown>[]) || [];
        setDocs(raw.map(normalizeDocument));
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load documents');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token, worldId, headers]);

  const createDocument = async () => {
    if (!session?.access_token || !worldId) return;
    if (!newTitle.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const order = docs
        .filter((d) => (d.parent_document_id || null) === (newParentId || null))
        .reduce((max, d) => Math.max(max, d.order ?? 0), 0) + 1;

      const res = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify({
          title: newTitle,
          type: newType,
          world_id: worldId,
          parent_document_id: newParentId,
          order,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.error?.message || `Failed to create document (${res.status})`;
        throw new Error(msg);
      }
      const created = normalizeDocument((json?.data || {}) as Record<string, unknown>);
      setDocs([created, ...docs]);
      setNewTitle('');
      setNewType('manuscript');
      setNewParentId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create document');
    } finally {
      setCreating(false);
    }
  };

  const updateOrder = async (docId: string, newOrder: number) => {
    if (!session?.access_token) return;
    const existing = docs.find((d) => d.id === docId);
    if (!existing) return;

    const res = await fetch(`${API_URL}/api/documents/${docId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({ order: newOrder }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.error?.message || `Failed to reorder (${res.status})`);
    }

    const updated = normalizeDocument((json?.data || {}) as Record<string, unknown>);
    setDocs(docs.map((d) => (d.id === docId ? { ...d, ...updated } : d)));
  };

  const moveUpDown = async (docId: string, direction: 'up' | 'down') => {
    const doc = docs.find((d) => d.id === docId);
    if (!doc) return;
    const siblings = docs
      .filter((d) => (d.parent_document_id || null) === (doc.parent_document_id || null))
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const idx = siblings.findIndex((s) => s.id === docId);
    const swapWith = direction === 'up' ? siblings[idx - 1] : siblings[idx + 1];
    if (!swapWith) return;

    const aOrder = doc.order ?? 0;
    const bOrder = swapWith.order ?? 0;

    try {
      // swap orders (2 calls, simple MVP)
      await updateOrder(doc.id, bOrder);
      await updateOrder(swapWith.id, aOrder);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reorder');
    }
  };

  const openDoc = (id: string) => navigate(`/documents/${id}`);

  const renderNode = (node: DocNode, depth = 0) => {
    return (
      <div key={node.id} className="space-y-2">
        <div
          className="flex items-center gap-3 p-3 rounded-lg border border-default bg-surface hover:bg-gray-50 cursor-pointer"
          style={{ marginLeft: depth * 16 }}
          onClick={() => openDoc(node.id)}
          role="button"
          tabIndex={0}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">
            {node.type === 'manuscript' ? '📖' : node.type === 'chapter' ? '📑' : node.type === 'scene' ? '🎬' : '📝'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-primary truncate">{node.title}</p>
              <span className="badge badge-gray capitalize">{node.type}</span>
              <span className="badge badge-gray capitalize">{node.status}</span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {node.word_count.toLocaleString()} words • order {node.order ?? 0}
            </p>
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button className="btn btn-secondary btn-sm" onClick={() => setNewParentId(node.id)} title="Create child under this">
              + Child
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => moveUpDown(node.id, 'up')} title="Move up">
              ↑
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => moveUpDown(node.id, 'down')} title="Move down">
              ↓
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => openDoc(node.id)}>
              Open
            </button>
          </div>
        </div>

        {node.children.length > 0 && (
          <div className="space-y-2">
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-surface border-b border-default px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Link to="/" className="btn btn-secondary btn-sm">
                Back
              </Link>
              <span className="text-xl font-semibold text-primary truncate">World Writing</span>
              {worldId && <span className="text-sm text-muted truncate">World: {worldId}</span>}
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold text-primary">Create document</h2>
                <p className="text-sm text-muted">Create manuscripts, chapters, scenes, and notes linked to this world.</p>
              </div>
              {newParentId && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted">Parent:</span>
                  <span className="badge badge-gray">{newParentId}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => setNewParentId(null)}>
                    Clear
                  </button>
                </div>
              )}
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                className="input"
                placeholder="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <select className="input" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                <option value="manuscript">📖 Manuscript</option>
                <option value="chapter">📑 Chapter</option>
                <option value="scene">🎬 Scene</option>
                <option value="note">📝 Note</option>
              </select>
              <button
                className="btn btn-primary"
                onClick={createDocument}
                disabled={creating || !newTitle.trim()}
                style={{ opacity: creating || !newTitle.trim() ? 0.6 : 1 }}
              >
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Documents</h2>
              <span className="text-sm text-muted">{docs.length} total</span>
            </div>

            {loading ? (
              <div className="py-8 text-muted text-sm">Loading…</div>
            ) : tree.length === 0 ? (
              <div className="py-10 text-center text-muted">
                <p>No documents in this world yet.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">{tree.map((n) => renderNode(n))}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

