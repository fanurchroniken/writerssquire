import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface World {
  id: string;
  title: string;
  description: string;
  visibility: string;
  created_at: string;
  updated_at: string;
}

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  language: string;
  word_count: number;
  created_at: string;
  updated_at: string;
}

// Icons
const WorldIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function Home() {
  const { user, session, signOut } = useAuth();
  const navigate = useNavigate();
  const [worlds, setWorlds] = useState<World[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'worlds' | 'manuscripts'>('dashboard');
  const [showCreateModal, setShowCreateModal] = useState<'world' | 'document' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDocType, setNewDocType] = useState('manuscript');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (session?.access_token) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [worldsRes, docsRes] = await Promise.all([
        fetch(`${API_URL}/api/worlds`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }),
        fetch(`${API_URL}/api/documents`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }),
      ]);

      if (worldsRes.ok) {
        const worldsData = await worldsRes.json();
        setWorlds(worldsData.data || []);
      }

      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const createWorld = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/worlds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setWorlds([data.data, ...worlds]);
        setNewTitle('');
        setNewDescription('');
        setShowCreateModal(null);
      } else {
        setError(data.error?.message || 'Failed to create world');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const createDocument = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ title: newTitle, type: newDocType }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setDocuments([data.data, ...documents]);
        setNewTitle('');
        setNewDocType('manuscript');
        setShowCreateModal(null);
      } else {
        setError(data.error?.message || 'Failed to create document');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const deleteWorld = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this world and all its contents?')) return;
    try {
      await fetch(`${API_URL}/api/worlds/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      setWorlds(worlds.filter((w) => w.id !== id));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const deleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try {
      await fetch(`${API_URL}/api/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const totalWords = documents.reduce((sum, doc) => sum + doc.word_count, 0);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-2xl">✦</span>
            WriterSquire
          </h1>
        </div>

        {/* Quick Create */}
        <div className="p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal('world')}
              className="flex-1 btn btn-primary btn-sm"
            >
              <PlusIcon /> World
            </button>
            <button
              onClick={() => setShowCreateModal('document')}
              className="flex-1 btn btn-accent btn-sm"
            >
              <PlusIcon /> Write
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`nav-item w-full ${activeSection === 'dashboard' ? 'active' : ''}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveSection('worlds')}
            className={`nav-item w-full ${activeSection === 'worlds' ? 'active' : ''}`}
          >
            <WorldIcon />
            My Worlds
            <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">{worlds.length}</span>
          </button>
          
          <button
            onClick={() => setActiveSection('manuscripts')}
            className={`nav-item w-full ${activeSection === 'manuscripts' ? 'active' : ''}`}
          >
            <BookIcon />
            Manuscripts
            <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">{documents.length}</span>
          </button>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email?.split('@')[0] || 'Writer'}
              </p>
              <p className="text-xs text-sidebar truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-sidebar hover:text-white transition-colors"
              title="Sign out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-surface border-b border-default px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary">
                {activeSection === 'dashboard' && 'Dashboard'}
                {activeSection === 'worlds' && 'My Worlds'}
                {activeSection === 'manuscripts' && 'Manuscripts'}
              </h2>
              <p className="text-sm text-muted mt-0.5">
                {activeSection === 'dashboard' && 'Welcome back to your writing workspace'}
                {activeSection === 'worlds' && `${worlds.length} world${worlds.length !== 1 ? 's' : ''} created`}
                {activeSection === 'manuscripts' && `${documents.length} document${documents.length !== 1 ? 's' : ''}, ${totalWords.toLocaleString()} total words`}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 w-64"
                  style={{ paddingLeft: '2.25rem' }}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
                  <SearchIcon />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-muted text-sm">Loading your workspace...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Dashboard View */}
              {activeSection === 'dashboard' && (
                <div className="animate-fadeIn">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                          <WorldIcon />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">{worlds.length}</p>
                          <p className="text-sm text-muted">Worlds Created</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                          <DocumentIcon />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">{documents.length}</p>
                          <p className="text-sm text-muted">Documents</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                          <BookIcon />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-primary">{totalWords.toLocaleString()}</p>
                          <p className="text-sm text-muted">Words Written</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div
                      onClick={() => setShowCreateModal('world')}
                      className="card card-hover p-6 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                          🌍
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary group-hover:text-indigo-600 transition-colors">
                            Create a New World
                          </h3>
                          <p className="text-sm text-muted mt-1">
                            Build rich fictional universes with characters, locations, timelines, and lore.
                          </p>
                        </div>
                        <ChevronIcon />
                      </div>
                    </div>

                    <div
                      onClick={() => setShowCreateModal('document')}
                      className="card card-hover p-6 cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl">
                          ✍️
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary group-hover:text-emerald-600 transition-colors">
                            Start Writing
                          </h3>
                          <p className="text-sm text-muted mt-1">
                            Create manuscripts, chapters, or notes with our distraction-free editor.
                          </p>
                        </div>
                        <ChevronIcon />
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Worlds */}
                    <div className="card">
                      <div className="p-4 border-b border-default flex items-center justify-between">
                        <h3 className="font-semibold text-primary">Recent Worlds</h3>
                        <button onClick={() => setActiveSection('worlds')} className="text-sm text-indigo-600 hover:underline">
                          View all
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {worlds.slice(0, 4).map((world) => (
                          <div
                            key={world.id}
                            onClick={() => navigate(`/worlds/${world.id}`)}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-lg">
                                🌍
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-primary truncate">{world.title}</p>
                                <p className="text-xs text-muted">{formatDate(world.updated_at)}</p>
                              </div>
                              <span className="badge badge-gray">{world.visibility}</span>
                            </div>
                          </div>
                        ))}
                        {worlds.length === 0 && (
                          <div className="p-8 text-center text-muted">
                            <p>No worlds yet. Create your first world!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Documents */}
                    <div className="card">
                      <div className="p-4 border-b border-default flex items-center justify-between">
                        <h3 className="font-semibold text-primary">Recent Documents</h3>
                        <button onClick={() => setActiveSection('manuscripts')} className="text-sm text-indigo-600 hover:underline">
                          View all
                        </button>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {documents.slice(0, 4).map((doc) => (
                          <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">
                                📄
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-primary truncate">{doc.title}</p>
                                <p className="text-xs text-muted">{doc.word_count} words • {formatDate(doc.updated_at)}</p>
                              </div>
                              <span className="badge badge-gray capitalize">{doc.type}</span>
                            </div>
                          </div>
                        ))}
                        {documents.length === 0 && (
                          <div className="p-8 text-center text-muted">
                            <p>No documents yet. Start writing!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Worlds View */}
              {activeSection === 'worlds' && (
                <div className="animate-fadeIn">
                  {worlds.length === 0 ? (
                    <div className="card p-12 text-center max-w-lg mx-auto">
                      <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-6 text-4xl">
                        🌍
                      </div>
                      <h3 className="text-xl font-semibold text-primary mb-2">Create Your First World</h3>
                      <p className="text-muted mb-6">
                        Build immersive fictional universes with detailed characters, locations, histories, and more.
                      </p>
                      <button onClick={() => setShowCreateModal('world')} className="btn btn-primary btn-lg">
                        <PlusIcon /> Create World
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {worlds.map((world) => (
                        <div
                          key={world.id}
                          onClick={() => navigate(`/worlds/${world.id}`)}
                          className="card card-hover overflow-hidden group cursor-pointer"
                        >
                          <div className="h-32 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 relative">
                            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
                              🌍
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-primary text-lg">{world.title}</h3>
                              <button
                                onClick={(e) => deleteWorld(world.id, e)}
                                className="p-1.5 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                            <p className="text-sm text-muted line-clamp-2 mb-4">
                              {world.description || 'No description yet...'}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="badge badge-primary">{world.visibility}</span>
                              <span className="text-muted">Updated {formatDate(world.updated_at)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add New World Card */}
                      <div
                        onClick={() => setShowCreateModal('world')}
                        className="card border-2 border-dashed border-gray-200 hover:border-indigo-300 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[280px]"
                      >
                        <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
                          <PlusIcon />
                        </div>
                        <p className="font-medium text-secondary group-hover:text-indigo-600 transition-colors">Create New World</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Manuscripts View */}
              {activeSection === 'manuscripts' && (
                <div className="animate-fadeIn">
                  {documents.length === 0 ? (
                    <div className="card p-12 text-center max-w-lg mx-auto">
                      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 text-4xl">
                        ✍️
                      </div>
                      <h3 className="text-xl font-semibold text-primary mb-2">Start Your Writing Journey</h3>
                      <p className="text-muted mb-6">
                        Create manuscripts, chapters, scenes, or notes. Your words, your way.
                      </p>
                      <button onClick={() => setShowCreateModal('document')} className="btn btn-accent btn-lg">
                        <PlusIcon /> Create Document
                      </button>
                    </div>
                  ) : (
                    <div className="card overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center text-xl">
                                {doc.type === 'manuscript' ? '📖' : doc.type === 'chapter' ? '📑' : doc.type === 'scene' ? '🎬' : '📝'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-primary">{doc.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted">
                                  <span className="capitalize">{doc.type}</span>
                                  <span>•</span>
                                  <span>{doc.word_count.toLocaleString()} words</span>
                                  <span>•</span>
                                  <span className="uppercase">{doc.language}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`badge ${doc.status === 'draft' ? 'badge-warning' : doc.status === 'completed' ? 'badge-success' : 'badge-gray'} capitalize`}>
                                  {doc.status}
                                </span>
                                <span className="text-sm text-muted">{formatDate(doc.updated_at)}</span>
                                <button
                                  onClick={(e) => deleteDocument(doc.id, e)}
                                  className="p-2 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {documents.length > 0 && (
                    <div className="mt-6 flex justify-center">
                      <button onClick={() => setShowCreateModal('document')} className="btn btn-secondary">
                        <PlusIcon /> New Document
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-surface rounded-xl shadow-2xl w-full max-w-md mx-4 animate-slideUp">
            <div className="p-6 border-b border-default">
              <h3 className="text-xl font-semibold text-primary">
                {showCreateModal === 'world' ? 'Create New World' : 'Create New Document'}
              </h3>
              <p className="text-sm text-muted mt-1">
                {showCreateModal === 'world'
                  ? 'Start building your fictional universe'
                  : 'Begin your writing journey'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-primary mb-1.5">
                  {showCreateModal === 'world' ? 'World Name' : 'Document Title'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input"
                  placeholder={showCreateModal === 'world' ? 'e.g., The Realm of Eldoria' : 'e.g., Chapter 1: The Beginning'}
                  autoFocus
                />
              </div>

              {showCreateModal === 'world' && (
                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">
                    Description <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="A brief description of your world..."
                  />
                </div>
              )}

              {showCreateModal === 'document' && (
                <div>
                  <label className="block text-sm font-medium text-primary mb-1.5">
                    Document Type
                  </label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="input"
                  >
                    <option value="manuscript">📖 Manuscript</option>
                    <option value="chapter">📑 Chapter</option>
                    <option value="scene">🎬 Scene</option>
                    <option value="note">📝 Note</option>
                  </select>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-default flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(null);
                  setNewTitle('');
                  setNewDescription('');
                  setError(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={showCreateModal === 'world' ? createWorld : createDocument}
                disabled={creating || !newTitle.trim()}
                className={`btn ${showCreateModal === 'world' ? 'btn-primary' : 'btn-accent'}`}
                style={{ opacity: creating || !newTitle.trim() ? 0.5 : 1 }}
              >
                {creating ? 'Creating...' : `Create ${showCreateModal === 'world' ? 'World' : 'Document'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
