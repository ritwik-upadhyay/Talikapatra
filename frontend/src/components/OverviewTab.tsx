

interface OverviewTabProps {
  stats: {
    documents: number;
    timeline: number;
    entities: number;
  };
  searchIntent: string | null;
  recentTrails: Array<{
    id: number;
    step_type: string;
    step_name: string;
    timestamp: string;
  }>;
}

export default function OverviewTab({ stats, searchIntent, recentTrails }: OverviewTabProps) {
  const getIntentDescription = (intent: string | null) => {
    switch (intent) {
      case 'Historical Debate':
        return 'The query involves competing historical interpretations. A comparative debate synthesis is active.';
      case 'Person Research':
        return 'Focused study of a specific historical figure, their life timeline, actions, and historical impacts.';
      case 'Event Research':
        return 'Focused investigation of a single historical event, mapping its immediate causes, progression, and aftermath.';
      case 'Long-Term Historical Process':
        return 'Analysis of macro-historical trends, transitions, dynastic changes, or institutional evolutions.';
      case 'Textual Research':
        return 'Study focused on specific manuscript sources, primary records, translations, or textual comparisons.';
      default:
        return 'No historical query run yet. Start an investigation in the Research tab.';
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '6px' }}>Workspace Overview</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Welcome to your research studio. Below is a summary of the facts, documents, and timelines collected in this study.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid">
        <div className="glass-card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-violet)' }}>{stats.documents}</div>
          <div className="stat-label">Sources</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{stats.timeline}</div>
          <div className="stat-label">Timeline Events</div>
        </div>
        <div className="glass-card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-gold)' }}>{stats.entities}</div>
          <div className="stat-label">Entities</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '30px' }}>
        {/* Classified Intent */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Research Objective</h4>
          <div style={{ marginBottom: '14px' }}>
            <span className={`badge ${searchIntent ? 'badge-cyan' : 'badge-violet'}`} style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
              {searchIntent || 'Undefined Intent'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            {getIntentDescription(searchIntent)}
          </p>
        </div>

        {/* Recent logs */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Recent Activity Logs</h4>
          {recentTrails.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No activity logged. Go to the Research tab to begin.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '180px', overflowY: 'auto' }}>
              {recentTrails.slice(-4).reverse().map((log) => (
                <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '6px' }}>
                  <span style={{ color: 'white', fontWeight: 500 }}>{log.step_name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
