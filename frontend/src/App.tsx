import { useState, useEffect } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import WorkspaceDetails from './components/WorkspaceDetails';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface UserSession {
  token: string;
  email: string;
}

export default function App() {
  const [screen, setScreen] = useState<'auth' | 'dashboard' | 'workspace'>('dashboard');
  const [session, setSession] = useState<UserSession | null>({
    token: 'mock_token',
    email: 'archivist@talikapatra.org'
  });
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'research' | 'documents' | 'timeline' | 'entities' | 'chat'>('research');
  const [workspaceTitle, setWorkspaceTitle] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('email');
    if (savedToken && savedEmail) {
      setSession({ token: savedToken, email: savedEmail });
      setScreen('dashboard');
    }
  }, []);

  const handleLogin = (token: string, email: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setSession({ token, email });
    setScreen('dashboard');
  };

  const handleLogout = () => {
    setSelectedWorkspaceId(null);
    setWorkspaceTitle(null);
    setScreen('dashboard');
  };

  const handleOpenWorkspace = (workspaceId: number) => {
    setSelectedWorkspaceId(workspaceId);
    setScreen('workspace');
    setActiveTab('research');
    
    // Fetch title to show in sidebar/header
    apiFetch(`/workspaces/${workspaceId}`).then(res => {
      if (res.ok) {
        res.json().then(data => {
          setWorkspaceTitle(data.title);
        });
      }
    });
  };

  const handleBackToDashboard = () => {
    setSelectedWorkspaceId(null);
    setWorkspaceTitle(null);
    setScreen('dashboard');
  };

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (session?.token) {
      headers.set('Authorization', `Bearer ${session.token}`);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      handleLogout();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  };

  const getHeaderDetails = () => {
    if (screen === 'dashboard') {
      return {
        title: 'Research Collections',
        icon: 'library_books',
      };
    }
    
    switch (activeTab) {
      case 'research':
        return { title: 'Investigation Workspace', icon: 'architecture' };
      case 'documents':
        return { title: 'Sources Explorer', icon: 'history_edu' };
      case 'timeline':
        return { title: 'Chronological Narrative', icon: 'timeline' };
      case 'entities':
        return { title: 'Actors Index', icon: 'groups' };
      case 'chat':
        return { title: 'Research Assistant', icon: 'auto_stories' };
      default:
        return { title: 'Investigation Workspace', icon: 'architecture' };
    }
  };

  if (!session) {
    return <Auth onLogin={handleLogin} apiBaseUrl={API_BASE_URL} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden text-on-background paper-texture">
      {/* SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex flex-col h-full py-8 px-4 gap-4 bg-surface-container-low border-r border-surface-variant w-72 shrink-0 z-50">
        <div className="mb-8 px-4" onClick={handleBackToDashboard} style={{ cursor: 'pointer' }}>
          <h1 className="font-display-lg text-3xl text-primary tracking-tight">Talikapatra</h1>
          <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">Archives of Antiquity</p>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1.5">
          {/* Collections Link */}
          <button 
            onClick={handleBackToDashboard}
            className={`flex items-center gap-3 px-4 py-3 rounded text-left transition-all ${
              screen === 'dashboard' 
                ? 'bg-secondary-container text-on-secondary-container border-l-4 border-secondary font-semibold' 
                : 'text-on-surface-variant hover:bg-surface-container-highest'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: screen === 'dashboard' ? "'FILL' 1" : undefined }}>library_books</span>
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-xs">Collections</span>
          </button>

          {/* SCRIPT WORKSPACE NAV SECTION */}
          {selectedWorkspaceId && (
            <div className="mt-4 pt-4 border-t border-[#E8DFCC] space-y-1">
              <p className="font-label-caps text-[10px] uppercase text-secondary tracking-widest px-4 mb-2 truncate">
                {workspaceTitle || 'Active Study'}
              </p>
              
              <button 
                onClick={() => setActiveTab('research')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-left transition-all ${
                  screen === 'workspace' && activeTab === 'research'
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-secondary font-semibold' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined">architecture</span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-xs">Workspace</span>
              </button>

              <button 
                onClick={() => setActiveTab('documents')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-left transition-all ${
                  screen === 'workspace' && activeTab === 'documents'
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-secondary font-semibold' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined">history_edu</span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-xs">Sources</span>
              </button>

              <button 
                onClick={() => setActiveTab('timeline')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-left transition-all ${
                  screen === 'workspace' && activeTab === 'timeline'
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-secondary font-semibold' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined">timeline</span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-xs">Chronology</span>
              </button>

              <button 
                onClick={() => setActiveTab('entities')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-left transition-all ${
                  screen === 'workspace' && activeTab === 'entities'
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-secondary font-semibold' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined">groups</span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-xs">Actors</span>
              </button>

              <button 
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded text-left transition-all ${
                  screen === 'workspace' && activeTab === 'chat'
                    ? 'bg-secondary-container text-on-secondary-container border-l-4 border-secondary font-semibold' 
                    : 'text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                <span className="material-symbols-outlined">auto_stories</span>
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-xs">Assistant</span>
              </button>
            </div>
          )}
        </nav>

        {/* PROFILE CARD */}
        <div className="mt-auto pt-6 border-t border-surface-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-aged-paper border border-bronze flex items-center justify-center text-secondary font-semibold text-lg uppercase shadow-inner">
              {session?.email.substring(0, 2) || 'AR'}
            </div>
            <div className="min-w-0">
              <p className="font-label-caps text-[10px] uppercase text-secondary">Researcher Mode</p>
              <p className="text-sm font-semibold truncate text-primary">{session?.email || 'archivist@talikapatra.org'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CANVAS */}
      <main className="flex-1 flex flex-col h-full bg-background relative overflow-y-auto">
        {/* HEADER BAR */}
        <header className="flex justify-between items-center w-full px-margin-desktop py-4 h-20 border-b border-surface-variant shrink-0 z-10 bg-background">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-secondary">
              {getHeaderDetails().icon}
            </span>
            <h2 className="font-display-lg text-2xl md:text-3xl text-primary tracking-tight">
              {getHeaderDetails().title}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors">notifications</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-colors">settings</button>
            
            <div className="flex items-center gap-3 pl-4 border-l border-surface-variant">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-secondary flex items-center justify-center bg-secondary-container text-on-secondary-container text-[10px] font-semibold uppercase">
                {session?.email.substring(0, 2) || 'AR'}
              </div>
              <span className="font-label-caps text-[10px] uppercase tracking-widest hidden lg:block text-on-surface-variant">Curator Profile</span>
            </div>
          </div>
        </header>

        {/* ACTIVE COMPONENT VIEW */}
        <div className="flex-1 overflow-y-auto">
          {screen === 'dashboard' && (
            <Dashboard 
              apiFetch={apiFetch} 
              onOpenWorkspace={handleOpenWorkspace} 
            />
          )}
          {screen === 'workspace' && selectedWorkspaceId !== null && (
            <WorkspaceDetails 
              workspaceId={selectedWorkspaceId} 
              activeTab={activeTab}
              apiFetch={apiFetch} 
              onBack={handleBackToDashboard}
            />
          )}
        </div>
      </main>
    </div>
  );
}
