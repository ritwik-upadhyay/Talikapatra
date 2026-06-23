import { useState, useEffect } from 'react';

interface WorkspaceBrief {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
}

interface DashboardProps {
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
  onOpenWorkspace: (id: number) => void;
}

export default function Dashboard({ apiFetch, onOpenWorkspace }: DashboardProps) {
  const [workspaces, setWorkspaces] = useState<WorkspaceBrief[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/workspaces');
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data);
      } else {
        setError('Failed to load archives');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCreateLoading(true);

    try {
      const res = await apiFetch('/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description }),
      });

      if (res.ok) {
        const newWs = await res.json();
        setTitle('');
        setDescription('');
        setWorkspaces((prev) => [newWs, ...prev]);
        setShowCreateModal(false);
      } else {
        const data = await res.json();
        setError(data.detail || 'Failed to create collection');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the collection');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to decommission this research collection? All timeline records, actors, and harvested texts will be lost.')) {
      return;
    }

    try {
      const res = await apiFetch(`/workspaces/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setWorkspaces((prev) => prev.filter((ws) => ws.id !== id));
      } else {
        setError('Failed to decommission collection');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while deleting the collection');
    }
  };

  // Helper to generate a mock reference code
  const getRefCode = (id: number) => {
    const padded = String(id).padStart(4, '0');
    if (id % 3 === 0) return `REF: MA-${padded}`;
    if (id % 2 === 0) return `REF: SR-${padded}`;
    return `REF: CL-${padded}`;
  };

  // Helper to pick a seals icon
  const getSealIcon = (id: number) => {
    if (id % 3 === 0) return 'verified';
    if (id % 2 === 0) return 'history';
    return 'library_books';
  };

  // Helper to generate mock tag chips
  const getTags = (title: string) => {
    const clean = title.toUpperCase().replace(/[^A-Z\s]/g, '');
    const words = clean.split(/\s+/).filter(w => w.length > 3);
    if (words.length === 0) return ['ARCHIVE', 'CHRONICLE'];
    return words.slice(0, 2);
  };

  return (
    <section className="max-w-container-max mx-auto w-full px-margin-mobile md:px-margin-desktop py-12 paper-texture min-h-[calc(100vh-80px)]">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <p className="font-label-caps text-label-caps text-secondary uppercase tracking-[0.2em] mb-2">Central Library</p>
        <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary">Research Collections</h2>
        <div className="w-24 h-[1px] bg-secondary mx-auto mt-6"></div>
        <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto mt-6 leading-relaxed">
          Access and manage curated historical investigations. Each entry represents a comprehensive archival dataset spanning centuries of documented human intent and structural evolution.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-error rounded p-4 mb-8 text-sm flex items-start gap-2 max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 text-secondary">
          <span className="terminal-spinner w-8 h-8"></span>
          <p className="font-label-caps text-label-caps uppercase tracking-widest mt-4">Consulting Library Catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Create Card Placeholder */}
          <div 
            onClick={() => setShowCreateModal(true)}
            className="bg-transparent border-2 border-dashed border-[#E8DFCC] flex flex-col items-center justify-center p-12 text-center group cursor-pointer hover:border-secondary transition-colors h-[320px]"
          >
            <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center mb-4 group-hover:bg-secondary-container transition-colors">
              <span className="material-symbols-outlined text-outline text-[32px] group-hover:text-secondary">add_notes</span>
            </div>
            <h3 className="font-headline-sm text-primary mb-1 text-xl">New Investigation</h3>
            <p className="font-body-md text-on-surface-variant text-sm">Initialize a new scholarly repository</p>
          </div>

          {/* Workspaces List */}
          {workspaces.map((ws) => (
            <article 
              key={ws.id}
              onClick={() => onOpenWorkspace(ws.id)}
              className="bg-ivory border border-[#E8DFCC] archive-card-hover relative flex flex-col group h-[320px] cursor-pointer"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <span className="font-label-caps text-label-caps text-secondary">{getRefCode(ws.id)}</span>
                  <div className="w-10 h-10 rounded-full border border-dashed border-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-[16px]">{getSealIcon(ws.id)}</span>
                  </div>
                </div>
                
                <h3 className="font-headline-sm text-primary mb-2 text-2xl truncate">{ws.title}</h3>
                <p className="font-caption text-on-surface-variant italic mb-4 line-clamp-2 text-sm flex-grow">
                  {ws.description || 'No description provided.'}
                </p>
                
                <div className="double-rule mb-4"></div>
                
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {getTags(ws.title).map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-surface-container-high text-on-surface-variant font-label-caps text-[9px] tracking-wider whitespace-nowrap">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={(e) => handleDelete(ws.id, e)}
                    className="text-error hover:text-red-700 p-1 flex items-center justify-center z-10"
                    title="Decommission Archive"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete_forever</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Creation Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="w-full max-w-lg bg-ivory border border-[#E8DFCC] p-10 rounded shadow-lg relative">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-secondary"></div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary text-2xl">Initialize Workspace</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-on-surface-variant hover:text-primary material-symbols-outlined"
              >
                close
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">Collection Title</label>
                <input
                  type="text"
                  className="w-full bg-transparent border-0 border-b border-aged-paper focus:border-bronze focus:ring-0 font-body-md text-on-surface py-2 transition-colors placeholder:text-surface-dim"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Srivijaya Empire Maritime Dominance"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">Archival Scope / Summary</label>
                <textarea
                  className="w-full bg-transparent border-0 border-b border-aged-paper focus:border-bronze focus:ring-0 font-body-md text-on-surface py-2 transition-colors placeholder:text-surface-dim resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Analyzing 8th-century naval influence, regional trade hegemony, and connections to the Pala dynasty."
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-primary text-primary font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 btn-ink font-label-caps text-label-caps uppercase tracking-widest rounded-sm shadow-sm"
                  disabled={createLoading}
                >
                  {createLoading ? 'Initializing...' : 'Initialize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
