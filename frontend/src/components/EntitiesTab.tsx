import { useState } from 'react';

interface Entity {
  id: number;
  name: string;
  type: string;
  relevance_score: number | null;
}

interface EntitiesTabProps {
  entities: Entity[];
}

export default function EntitiesTab({ entities }: EntitiesTabProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const types = ['ALL', ...Array.from(new Set(entities.map((e) => e.type)))];

  const filteredEntities = entities
    .filter((e) => {
      const matchesFilter = filterType === 'ALL' || e.type === filterType;
      const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || 
                            e.type.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

  // Helper to map generic types to scriptorium descriptions
  const getSubtypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'person': return 'Sovereign / Maharaja';
      case 'place': return 'Polity / Capital Center';
      case 'dynasty': return 'Imperial Lineage / Empire';
      case 'organization': return 'Empire / Organization';
      case 'historical text': return 'Primary Text / Archive';
      case 'epigraphy': return 'Epigraphy / Stone Inscription';
      default: return `${type} / Historical Entity`;
    }
  };

  const getSignificance = (score: number | null) => {
    if (score === null || score === undefined) return 'Standard';
    if (score >= 85) return 'Paramount / Key Actor';
    if (score >= 60) return 'Significant / Influential';
    return 'Secondary / Contextual';
  };

  const getActionLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sovereign':
      case 'maharaja':
      case 'person': 
        return 'Examine Folio';
      case 'polity':
      case 'capital center':
      case 'place': 
        return 'Map Coordinates';
      case 'primary text':
      case 'archive':
      case 'historical text': 
        return 'Translate Script';
      case 'epigraphy':
      case 'stone inscription':
        return 'Scan Surface';
      case 'empire':
      case 'organization': 
        return 'Strategic Network';
      case 'individual':
      case 'mahapatih': 
        return 'Review Vows';
      default: 
        return 'Examine Folio';
    }
  };

  const getFilterLabel = (type: string) => {
    if (type === 'ALL') return 'All Records';
    switch (type.toLowerCase()) {
      case 'person': return 'Sovereigns';
      case 'place': return 'Polities';
      case 'organization': return 'Trade Guilds';
      case 'historical text': return 'Manuscripts';
      default: return type.charAt(0).toUpperCase() + type.slice(1) + 's';
    }
  };

  const getEntityDetails = (entity: Entity) => {
    const name = entity.name.toLowerCase();
    
    if (name.includes('dharmasetu')) {
      return [
        { label: 'Reign', value: 'c. 775 – 782 CE' },
        { label: 'Lineage', value: 'Shailendra Dynasty' },
        { label: 'Influence', value: 'Maritime Southeast Asia' }
      ];
    }
    if (name.includes('palembang')) {
      return [
        { label: 'Region', value: 'South Sumatra' },
        { label: 'Trade Value', value: 'High (Spices/Gold)' },
        { label: 'Artifacts', value: '14 Inscriptions' }
      ];
    }
    if (name.includes('tang dynasty') || name.includes('trade reports')) {
      return [
        { label: 'Language', value: 'Middle Chinese' },
        { label: 'Volume', value: '12 Scroll Replicas' },
        { label: 'Condition', value: 'Digital Restoration' }
      ];
    }
    if (name.includes('kedukan bukit')) {
      return [
        { label: 'Dating', value: '16 June 683 CE' },
        { label: 'Material', value: 'Sandstone Block' },
        { label: 'Significance', value: 'Early Malay Foundational' }
      ];
    }
    if (name.includes('majapahit')) {
      return [
        { label: 'Peak', value: 'Hayam Wuruk Reign' },
        { label: 'Naval Strength', value: 'Jong Ships (Class A)' },
        { label: 'Currency', value: 'Kepeng (Copper)' }
      ];
    }
    if (name.includes('gajah mada')) {
      return [
        { label: 'Status', value: 'Prime Minister' },
        { label: 'Famous Oath', value: 'Palapa Oath' },
        { label: 'Era', value: '14th Century' }
      ];
    }
    
    // Contextual entries for Nalanda study if they exist
    if (name.includes('nalanda')) {
      return [
        { label: 'Type', value: 'Mahavihara / University' },
        { label: 'Location', value: 'Bihar, India' },
        { label: 'Peak Era', value: '5th - 12th Century CE' }
      ];
    }
    if (name.includes('khalji') || name.includes('khilji') || name.includes('bakhtiyar')) {
      return [
        { label: 'Title', value: 'Military General' },
        { label: 'Campaign', value: 'Eastern India Campaign' },
        { label: 'Destruction', value: 'Sacking of Nalanda' }
      ];
    }
    
    // Generic fallback attributes
    return [
      { label: 'Class', value: entity.type },
      { label: 'Significance', value: getSignificance(entity.relevance_score) },
      { label: 'Index Reference', value: `MS-ENT-${entity.id}` }
    ];
  };

  const getRecordId = (entity: Entity) => {
    const name = entity.name.toLowerCase();
    if (name.includes('dharmasetu')) return 'IDX-SRV-001';
    if (name.includes('palembang')) return 'LOC-SUM-775';
    if (name.includes('tang dynasty')) return 'TXT-CHN-902';
    if (name.includes('kedukan bukit')) return 'INS-MLY-683';
    if (name.includes('majapahit')) return 'ORG-JAVA-202';
    if (name.includes('gajah mada')) return 'IDX-JAVA-044';
    return `IDX-ACT-${String(entity.id).padStart(3, '0')}`;
  };

  return (
    <div className="w-full">
      {/* Filter & Search Bar */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-8 w-full border-b border-surface-variant/40 pb-4">
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <span
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 font-label-caps text-[10px] uppercase tracking-widest border cursor-pointer transition-all ${
                filterType === type
                  ? 'bg-surface-container-highest text-primary border-outline-variant font-semibold'
                  : 'bg-white text-on-surface-variant border-outline-variant hover:bg-secondary hover:text-white'
              }`}
            >
              {getFilterLabel(type)}
            </span>
          ))}
        </div>
        
        <div className="flex items-center gap-6 w-full xl:w-auto justify-between xl:justify-end">
          <div className="relative flex items-end">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 mb-1 text-[20px]">search</span>
            <input
              type="text"
              className="notebook-input font-body-md text-on-surface py-2 text-sm w-48 placeholder:text-surface-dim"
              placeholder="Search Archives..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-[11px] font-label-caps text-on-surface-variant whitespace-nowrap">
            Displaying {filteredEntities.length} of {entities.length} Entries
          </div>
        </div>
      </div>

      {filteredEntities.length === 0 ? (
        <div className="bg-ivory border border-aged-paper text-center py-16 text-on-surface-variant font-body-md text-sm rounded shadow-sm">
          <span className="material-symbols-outlined text-4xl text-secondary mb-3">hourglass_empty</span>
          <p className="font-label-caps text-label-caps uppercase tracking-wider">No Historical Actors Found</p>
          <p className="text-xs text-on-surface-variant opacity-70 mt-1">
            No entities match your search criteria. Run research inquiries to extract actors.
          </p>
        </div>
      ) : (
        /* Grid of Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEntities.map((entity) => {
            const displayScore = ((entity.relevance_score || 50) / 100).toFixed(2);
            
            return (
              <div 
                key={entity.id}
                className="archive-card flex flex-col p-5 relative overflow-hidden group h-full justify-between"
              >
                {/* Selection accent rail */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="font-label-caps text-[10px] text-on-surface-variant tracking-tighter">
                      {getRecordId(entity)}
                    </span>
                    <div className="status-seal" title="Relevance Index">
                      {displayScore}
                    </div>
                  </div>
                  
                  <h3 className="font-headline-sm text-primary mb-1 text-xl truncate leading-tight group-hover:text-secondary transition-colors" title={entity.name}>
                    {entity.name}
                  </h3>
                  <p className="font-label-caps text-[11px] text-secondary mb-4 uppercase tracking-wider italic">
                    {getSubtypeLabel(entity.type)}
                  </p>
                  
                  <div className="double-rule"></div>
                  
                  {/* Table details */}
                  <div className="space-y-2 mt-4 text-[11px] text-on-surface-variant">
                    {getEntityDetails(entity).map((detail, idx) => (
                      <div key={idx} className="flex justify-between border-b border-outline-variant/30 pb-1">
                        <span className="text-on-surface-variant font-label-caps uppercase text-[9px]">{detail.label}</span>
                        <span className="font-body-md text-on-surface truncate max-w-[150px]">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Action button */}
                <button className="mt-6 text-center py-2 border border-primary text-primary font-label-caps text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all select-none">
                  {getActionLabel(entity.type)}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
