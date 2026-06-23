import { useState, useEffect } from 'react';
import ResearchTab from './ResearchTab';
import DocumentsTab from './DocumentsTab';
import TimelineTab from './TimelineTab';
import EntitiesTab from './EntitiesTab';
import ChatTab from './ChatTab';

interface WorkspaceDetail {
  id: number;
  title: string;
  description: string | null;
  search_intent: string | null;
  created_at: string;
  documents: Array<{
    id: number;
    title: string;
    source_url: string | null;
    source_type: string | null;
    source_confidence_score: number | null;
  }>;
  timeline: Array<{
    id: number;
    document_id: number | null;
    title: string;
    description: string | null;
    date_raw: string | null;
    date_iso: string | null;
  }>;
  entities: Array<{
    id: number;
    name: string;
    type: string;
    relevance_score: number | null;
  }>;
  research_trails: Array<{
    id: number;
    step_type: string;
    step_name: string;
    metadata: any;
    timestamp: string;
  }>;
}

interface WorkspaceDetailsProps {
  workspaceId: number;
  activeTab: 'research' | 'documents' | 'timeline' | 'entities' | 'chat';
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
  onBack: () => void;
}

export default function WorkspaceDetails({ workspaceId, activeTab, apiFetch, onBack }: WorkspaceDetailsProps) {
  const [workspace, setWorkspace] = useState<WorkspaceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkspaceDetails = async () => {
    try {
      const res = await apiFetch(`/workspaces/${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        setWorkspace(data);
      } else {
        setError('Failed to load workspace data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceDetails();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="text-center py-24 text-secondary">
        <span className="terminal-spinner w-8 h-8"></span>
        <p className="font-label-caps text-label-caps uppercase tracking-widest mt-4">Unlocking Vault Archives...</p>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-ivory border border-aged-paper relative rounded shadow-md">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error"></div>
        <h3 className="font-headline-sm text-error mb-2 text-xl">Error Loading Workspace</h3>
        <p className="font-body-md text-on-surface-variant mb-6 text-sm">{error || 'Workspace could not be found.'}</p>
        <button className="btn-primary px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest" onClick={onBack}>
          Return to Collections
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full px-margin-desktop py-8 max-w-5xl mx-auto flex flex-col gap-6">
      {/* Workspace Header Panel */}
      <div className="bg-ivory border border-aged-paper p-6 relative rounded flex justify-between items-center shadow-sm">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
        <div>
          <div className="flex items-center gap-4 mb-1">
            <h3 className="font-display-lg text-2xl text-primary font-semibold">{workspace.title}</h3>
            {workspace.search_intent && (
              <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container font-label-caps text-[9px] tracking-wider uppercase border border-secondary/30">
                {workspace.search_intent}
              </span>
            )}
          </div>
          <p className="font-body-md text-on-surface-variant text-sm">{workspace.description || 'No description provided.'}</p>
        </div>
        <div className="flex gap-3">
          <span className="font-label-caps text-[10px] text-secondary tracking-widest uppercase">
            EST. {new Date(workspace.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Tab Panels dispatcher */}
      <div className="flex-1 mt-4">
        {activeTab === 'research' && (
          <ResearchTab 
            workspaceId={workspace.id}
            researchTrails={workspace.research_trails}
            apiFetch={apiFetch}
            onRefreshWorkspace={fetchWorkspaceDetails}
          />
        )}
        
        {activeTab === 'documents' && (
          <DocumentsTab 
            workspaceId={workspace.id}
            documents={workspace.documents}
            apiFetch={apiFetch}
            onRefreshWorkspace={fetchWorkspaceDetails}
          />
        )}
        
        {activeTab === 'timeline' && (
          <TimelineTab timeline={workspace.timeline} />
        )}
        
        {activeTab === 'entities' && (
          <EntitiesTab entities={workspace.entities} />
        )}
        
        {activeTab === 'chat' && (
          <ChatTab 
            workspaceId={workspace.id}
            apiFetch={apiFetch}
          />
        )}
      </div>
    </div>
  );
}
