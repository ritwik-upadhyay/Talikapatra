import { useState } from 'react';

interface TimelineEvent {
  id: number;
  document_id: number | null;
  title: string;
  description: string | null;
  date_raw: string | null;
  date_iso: string | null;
}

interface TimelineTabProps {
  timeline: TimelineEvent[];
}

export default function TimelineTab({ timeline }: TimelineTabProps) {
  const [search, setSearch] = useState('');

  // Helper to extract a sortable year integer
  function parseYear(dateStr: string): number {
    const clean = dateStr.trim().toUpperCase();
    const isBC = clean.includes('BC') || clean.includes('BCE');
    const match = clean.match(/-?\d+/);
    if (!match) return 9999;
    
    let val = parseInt(match[0]);
    if (isBC) {
      val = -val;
    }
    return val;
  }

  // Filter and sort timeline events chronologically
  const sortedTimeline = [...timeline]
    .filter(event => {
      const matchText = event.title.toLowerCase().includes(search.toLowerCase()) || 
                        (event.description && event.description.toLowerCase().includes(search.toLowerCase())) ||
                        (event.date_raw && event.date_raw.toLowerCase().includes(search.toLowerCase()));
      return matchText;
    })
    .sort((a, b) => {
      const yearA = parseYear(a.date_iso || a.date_raw || '');
      const yearB = parseYear(b.date_iso || b.date_raw || '');
      return yearA - yearB;
    });

  // Helper to extract tags from title
  const getTags = (title: string) => {
    const clean = title.toUpperCase().replace(/[^A-Z\s]/g, '');
    const words = clean.split(/\s+/).filter(w => w.length > 3);
    if (words.length === 0) return ['ARCHIVE', 'CHRONICLE'];
    return words.slice(0, 3);
  };

  return (
    <div className="w-full">
      {/* Search Filter Header */}
      <div className="flex justify-end mb-8 w-full">
        <div className="relative flex items-end">
          <span className="material-symbols-outlined text-on-surface-variant mr-2 mb-1 text-[20px]">search</span>
          <input
            type="text"
            className="notebook-input font-body-md text-on-surface py-2 text-sm w-full md:w-64 placeholder:text-surface-dim"
            placeholder="Search Chronology..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {sortedTimeline.length === 0 ? (
        <div className="bg-ivory border border-aged-paper text-center py-16 text-on-surface-variant font-body-md text-sm rounded shadow-sm">
          <span className="material-symbols-outlined text-4xl text-secondary mb-3">hourglass_empty</span>
          <p className="font-label-caps text-label-caps uppercase tracking-wider">No Chronology Records Found</p>
          <p className="text-xs text-on-surface-variant opacity-70 mt-1 max-w-md mx-auto">
            No chronology events match your filter or have been compiled yet. Run a new inquiry to populate the timeline.
          </p>
        </div>
      ) : (
        <div className="relative mt-8 py-6">
          {/* Vertical Timeline Line */}
          <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 h-full timeline-line top-0 z-0"></div>

          <div className="space-y-12 md:space-y-8">
            {sortedTimeline.map((event, idx) => {
              const isEven = idx % 2 === 0;
              const recordId = `MS-${String(event.id).padStart(4, '0')}`;

              return (
                <div 
                  key={event.id}
                  className={`relative z-10 flex flex-col w-full items-start md:items-center md:justify-between ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Wax Seal Year Node */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 flex items-center justify-center z-20">
                    <div className="wax-seal px-2 py-3 min-w-[64px] min-h-[64px] rounded-xl flex flex-col items-center justify-center text-background font-display-lg text-sm md:text-base leading-tight shadow-lg transform hover:scale-110 transition-transform duration-300 cursor-pointer select-none text-center">
                      {event.date_raw || 'DAT'}
                    </div>
                  </div>

                  {/* Card Container */}
                  <div className="w-full pl-20 md:pl-0 md:w-[44%]">
                    <div className="paper-texture p-8 rounded shadow-sm hover:shadow-md transition-shadow relative">
                      {/* Left/Right Accent Bar */}
                      <div className={`absolute top-4 w-1 h-12 bg-secondary ${
                        isEven ? 'left-0' : 'right-0'
                      }`}></div>
                      
                      <span className="font-label-caps text-label-caps text-secondary mb-2 block text-xs tracking-wider">
                        RECORD ID: {recordId}
                      </span>
                      <h3 className="font-headline-sm text-primary mb-3 text-xl font-semibold">
                        {event.title}
                      </h3>
                      <p className="text-on-surface-variant leading-relaxed text-sm">
                        {event.description || 'No record description provided.'}
                      </p>
                      <div className="double-rule opacity-40"></div>
                      
                      {/* Dynamic Footer for Mockup Feel */}
                      {idx % 3 === 0 && (
                        <div className="flex gap-4 items-center">
                          <span className="text-caption italic text-secondary text-[12px]">
                            Verified by Senior Curator
                          </span>
                          <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full border border-background bg-surface-dim"></div>
                            <div className="w-6 h-6 rounded-full border border-background bg-outline-variant"></div>
                          </div>
                        </div>
                      )}
                      {idx % 3 === 1 && (
                        <div className="flex flex-wrap gap-2">
                          {getTags(event.title).map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-surface-container-highest text-label-caps text-[10px] uppercase rounded text-on-surface-variant font-semibold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {idx % 3 === 2 && (
                        <div className="flex items-center justify-between">
                          <button className="text-secondary font-label-caps text-label-caps border-b border-secondary hover:text-primary hover:border-primary transition-all text-xs tracking-wider uppercase font-semibold">
                            READ MORE
                          </button>
                          <span className="material-symbols-outlined text-secondary opacity-50">auto_stories</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Empty side placeholder on md+ screens */}
                  <div className="hidden md:block md:w-[44%]"></div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
