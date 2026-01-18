import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface DocumentDto {
  id: string;
  owner_id: string;
  world_id: string | null;
  title: string;
  content: string;
  plain_text: string;
  language: string;
  word_count: number;
  character_count: number;
  type: string;
  parent_document_id: string | null;
  order: number;
  status: string;
  created_at: string;
  updated_at: string;
}

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

function normalizeDocument(raw: Record<string, unknown>): DocumentDto {
  return {
    id: toString(raw.id),
    owner_id: toString(raw.owner_id),
    world_id: (raw.world_id as string | null | undefined) ?? null,
    title: toString(raw.title),
    content: toString(raw.content),
    plain_text: toString(raw.plain_text),
    language: toString(raw.language, 'en'),
    word_count: toNumber(raw.word_count, 0),
    character_count: toNumber(raw.character_count, 0),
    type: toString(raw.type, 'manuscript'),
    parent_document_id: (raw.parent_document_id as string | null | undefined) ?? null,
    order: toNumber(raw.order ?? raw['order'], 0),
    status: toString(raw.status, 'draft'),
    created_at: toString(raw.created_at),
    updated_at: toString(raw.updated_at),
  };
}

function formatUpdatedAt(iso: string | undefined) {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DocumentEditor() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [doc, setDoc] = useState<DocumentDto | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);

  const lastSavedAt = useMemo(() => formatUpdatedAt(doc?.updated_at), [doc?.updated_at]);
  const hasUnsavedChanges = doc ? title !== doc.title || content !== doc.content : false;

  const debounceTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  const authHeaders = useMemo(() => {
    const token = session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [session?.access_token]);

  useEffect(() => {
    if (!session?.access_token || !documentId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`${API_URL}/api/documents/${documentId}`, { headers: authHeaders });
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = json?.error?.message || `Failed to load document (${res.status})`;
          throw new Error(msg);
        }
        if (cancelled) return;
        const loaded = normalizeDocument((json?.data || {}) as Record<string, unknown>);
        setDoc(loaded);
        setTitle(loaded.title || '');
        setContent(loaded.content || '');
        setSaveStatus('idle');
        setSaveError(null);
      } catch (e: unknown) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : 'Failed to load document');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [session?.access_token, documentId, authHeaders]);

  const save = async (reason: 'manual' | 'autosave') => {
    if (!doc || !session?.access_token) return;
    if (!hasUnsavedChanges) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    setSaveStatus('saving');
    setSaveError(null);
    try {
      const res = await fetch(`${API_URL}/api/documents/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        body: JSON.stringify({
          title,
          content,
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.error?.message || `Failed to save (${res.status})`;
        throw new Error(msg);
      }
      const updated = normalizeDocument((json?.data || {}) as Record<string, unknown>);
      setDoc(updated);
      setSaveStatus('saved');
      setSaveError(null);
      if (reason === 'manual') {
        window.setTimeout(() => setSaveStatus('idle'), 1200);
      }
    } catch (e: unknown) {
      setSaveStatus('error');
      setSaveError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (!doc) return;
    if (!hasUnsavedChanges) return;

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      save('autosave');
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, doc?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="card p-6 max-w-4xl mx-auto">
          <p className="text-muted">Loading document…</p>
        </div>
      </div>
    );
  }

  if (loadError || !doc) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="card p-6 max-w-4xl mx-auto space-y-3">
          <p className="text-primary font-semibold">Could not open document</p>
          <p className="text-muted text-sm">{loadError || 'Document not found'}</p>
          <div className="flex gap-3">
            <button className="btn btn-secondary" onClick={() => navigate('/')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-surface border-b border-default px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Link to="/" className="btn btn-secondary btn-sm">
                Back
              </Link>
              {doc.world_id && (
                <Link to={`/worlds/${doc.world_id}/writing`} className="btn btn-secondary btn-sm">
                  World writing
                </Link>
              )}
              <span className="badge badge-gray capitalize">{doc.type}</span>
              <span className="text-sm text-muted truncate">{doc.status}</span>
            </div>
            <div className="mt-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-lg font-semibold"
                placeholder="Untitled"
              />
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => save('manual')}
                disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                style={{ opacity: !hasUnsavedChanges || saveStatus === 'saving' ? 0.6 : 1 }}
              >
                {saveStatus === 'saving' ? 'Saving…' : 'Save'}
              </button>
            </div>
            <div className="text-xs text-muted">
              {saveStatus === 'saving' && 'Saving…'}
              {saveStatus === 'saved' && 'Saved'}
              {saveStatus === 'error' && `Save failed: ${saveError || ''}`}
              {saveStatus === 'idle' && (lastSavedAt ? `Last saved: ${lastSavedAt}` : '')}
            </div>
            <div className="text-xs text-muted">
              {doc.word_count.toLocaleString()} words • {doc.character_count.toLocaleString()} characters
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-6xl mx-auto">
          <textarea
            className="input w-full min-h-[70vh] font-mono text-sm"
            placeholder="Start writing…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          {saveStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {saveError || 'Failed to save. Please try again.'}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

