import { useState, useEffect, useRef } from 'react';

interface ResearchTrailStep {
  id: number;
  step_type: string;
  step_name: string;
  metadata: any;
  timestamp: string;
}

interface ResearchTabProps {
  workspaceId: number;
  researchTrails: ResearchTrailStep[];
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
  onRefreshWorkspace: () => Promise<void>;
}

export default function ResearchTab({ workspaceId, researchTrails, apiFetch, onRefreshWorkspace }: ResearchTabProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any | null>(null);
  const pollingRef = useRef<any>(null);

  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const handleResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    // Start polling workspace details to update trails dynamically in real time
    pollingRef.current = setInterval(() => {
      onRefreshWorkspace().catch((err) => console.error("Error refreshing workspace during research", err));
    }, 3000);

    try {
      const res = await apiFetch(`/workspaces/${workspaceId}/research`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (res.ok) {
        const result = await res.json();
        setSuccess(result);
        setQuery('');
      } else {
        const data = await res.json();
        setError(data.detail || 'Research pipeline failed.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while running research');
    } finally {
      setLoading(false);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      // Final reload to ensure everything is fetched
      await onRefreshWorkspace();
    }
  };

  // Helper to check trail status for stages
  const getStageStatus = (stageNum: number) => {
    const types = researchTrails.map(t => t.step_type);
    
    switch (stageNum) {
      case 1: // Query Classified
        if (types.includes('intent_ranking')) return 'completed';
        if (types.includes('start') || types.includes('broad_search') || loading) return 'active';
        return 'pending';
      case 2: // Sources Ranked & Downloaded
        if (types.includes('primary_retrieval')) return 'completed';
        if (types.includes('intent_ranking')) return 'active';
        return 'pending';
      case 3: // Historical Entities Harvested
        if (types.includes('harvesting')) return 'completed';
        if (types.includes('primary_retrieval')) return 'active';
        return 'pending';
      case 4: // Context Expanded
        if (types.includes('context_compilation')) return 'completed';
        if (types.includes('harvesting') || types.includes('expansion_selection') || types.includes('expansion_retrieval')) return 'active';
        return 'pending';
      case 5: // Debate Synthesised
        if (types.includes('synthesis')) return 'completed';
        if (types.includes('context_compilation')) return 'active';
        return 'pending';
      default:
        return 'pending';
    }
  };

  // Render a stage card based on status
  const renderStageCard = (stageNum: string, title: string, status: 'completed' | 'active' | 'pending', icon: string) => {
    if (status === 'completed') {
      return (
        <div className="p-6 bg-ivory border border-aged-paper archive-card-accent flex justify-between items-center group hover:bg-white transition-colors cursor-pointer rounded-sm">
          <div>
            <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">{stageNum}</p>
            <p className="font-headline-sm text-lg text-primary">{title}</p>
          </div>
          <div className="w-10 h-10 rounded-full border border-bronze flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined font-semibold" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
        </div>
      );
    }

    if (status === 'active') {
      return (
        <div className="p-6 bg-ivory border border-bronze archive-card-accent flex justify-between items-center relative overflow-hidden group shadow-sm rounded-sm">
          <div className="relative z-10">
            <p className="font-label-caps text-[10px] text-secondary uppercase mb-1">{stageNum}</p>
            <p className="font-headline-sm text-lg text-primary">{title}</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-bronze flex items-center justify-center animate-spin">
            <span className="material-symbols-outlined text-secondary text-lg">{icon}</span>
          </div>
          <div className="absolute inset-0 bg-secondary/5 animate-pulse"></div>
        </div>
      );
    }

    return (
      <div className="p-6 bg-transparent border border-aged-paper flex justify-between items-center opacity-40 grayscale rounded-sm">
        <div>
          <p className="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">{stageNum}</p>
          <p className="font-headline-sm text-lg text-surface-dim">{title}</p>
        </div>
        <div className="w-10 h-10 rounded-full border border-aged-paper flex items-center justify-center text-surface-dim">
          <span className="material-symbols-outlined">{icon === 'check_circle' ? 'hourglass_empty' : icon}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-8">
      {/* Search Input Section */}
      <section className="flex flex-col gap-6">
        <div className="space-y-1">
          <label className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block">Active Research Inquiry</label>
          <div className="relative group">
            <textarea 
              className="w-full bg-transparent border-0 border-b-2 border-aged-paper focus:border-bronze focus:ring-0 font-display-lg text-2xl md:text-3xl placeholder:text-surface-dim resize-none py-4 transition-colors" 
              placeholder="Enter your historical research inquiry..." 
              rows={2}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-bronze group-focus-within:w-full transition-all duration-500"></div>
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleResearch}
            className="px-8 py-3 btn-ink font-label-caps text-label-caps uppercase tracking-widest rounded-sm flex items-center gap-2"
            disabled={loading || !query.trim()}
          >
            <span className="material-symbols-outlined text-sm">auto_fix</span>
            {loading ? 'Investigating...' : 'Begin Investigation'}
          </button>
        </div>
      </section>

      <div className="double-rule"></div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-error rounded p-4 text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-success rounded p-4 text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <div>
            <p className="font-semibold">Investigation Completed Successfully!</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Extracted {success.events_extracted} timeline events and {success.entities_extracted} historical entities.
            </p>
          </div>
        </div>
      )}

      {/* Progress Stages Grid */}
      <section className="space-y-6">
        <h3 className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-widest text-xs">Investigation Stages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderStageCard("Stage I", "Query Classified", getStageStatus(1), "analytics")}
          {renderStageCard("Stage II", "Sources Retrieved", getStageStatus(2), "search")}
          {renderStageCard("Stage III", "Actors Identified", getStageStatus(3), "groups")}
          {renderStageCard("Stage IV", "Context Expanded", getStageStatus(4), "history")}
          {renderStageCard("Stage V", "Debate Synthesized", getStageStatus(5), "auto_stories")}
        </div>
      </section>

      {/* Recent Trail Console */}
      {researchTrails.length > 0 && (
        <section className="space-y-4 mt-4">
          <h3 className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-widest text-xs">Live Archival Log</h3>
          <div className="bg-surface-container border border-aged-paper rounded p-6 font-mono text-xs text-on-surface-variant space-y-2 max-h-48 overflow-y-auto shadow-inner">
            {researchTrails.map((step) => (
              <div key={step.id} className="flex gap-4">
                <span className="text-secondary font-semibold">[{new Date(step.timestamp).toLocaleTimeString()}]</span>
                <span className="text-primary font-semibold">&gt;&gt; {step.step_name}:</span>
                <span className="text-on-surface">
                  {step.metadata?.search_intent ? `Classified search intent: ${step.metadata.search_intent}` : 
                   step.metadata?.selected_sources ? `Selected primary sources: ${step.metadata.selected_sources.map((s: any) => s.title).join(', ')}` :
                   step.metadata?.retrieved_titles ? `Retrieved documents: ${step.metadata.retrieved_titles.join(', ')}` :
                   step.metadata?.events_created ? `Harvested ${step.metadata.events_created} timeline events and ${step.metadata.entities_created} entities` :
                   step.metadata?.entities ? `Expanding on: ${step.metadata.entities.join(', ')}` :
                   step.metadata?.total_sources ? `Compiling grounding corpus with ${step.metadata.total_sources} sources` :
                   step.metadata?.debate_detected !== undefined ? `Report generated. Debate detected: ${step.metadata.debate_detected ? 'YES' : 'NO'}` :
                   'Log registered.'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
