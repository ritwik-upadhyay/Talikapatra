import { useState, useRef, useEffect } from 'react';

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
}

interface ChatTabProps {
  workspaceId: number;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

export default function ChatTab({ workspaceId, apiFetch }: ChatTabProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Greetings. I am your Historical Research Assistant. Ask me anything about the documents, events, or entities gathered in this workspace.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const res = await apiFetch(`/workspaces/${workspaceId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: 'assistant',
            text: data.response,
            sources: data.sources,
          },
        ]);
      } else {
        const data = await res.json();
        setError(data.detail || 'Assistant encountered an error.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while communicating with the assistant.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const email = localStorage.getItem('email') || 'US';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] max-w-4xl mx-auto relative pb-28">
      {/* Intro Greeting (only if 1 message exists) */}
      {messages.length === 1 && (
        <div className="text-center space-y-4 pt-4 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-secondary mb-2">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
          </div>
          <h2 className="font-display-lg text-2xl text-primary">Scriptorium Library</h2>
          <p className="font-body-lg text-on-surface-variant italic text-sm">
            "The library is a quiet garden of human thought." Which folio shall we consult today?
          </p>
        </div>
      )}

      {/* Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-8 pr-2 scrollbar-hide py-4">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          if (isUser) {
            return (
              <div key={index} className="flex justify-end pr-3">
                <div className="bg-white border border-aged-paper p-5 rounded relative shadow-sm max-w-lg rotate-1 hover:rotate-0 transition-transform duration-300">
                  {/* User Initial stamp */}
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold font-label-caps">
                    {getInitials()}
                  </div>
                  <p className="font-label-caps text-[9px] text-secondary mb-1">
                    QUERY NO. {String(index).padStart(3, '0')} — {timeString}
                  </p>
                  <p className="font-body-md text-primary italic leading-relaxed text-sm">
                    "{msg.text}"
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div key={index} className="flex justify-start pl-4">
              <div className="bg-ivory border border-aged-paper p-8 rounded relative shadow-sm max-w-3xl -rotate-1 hover:rotate-0 transition-transform duration-300 w-full">
                {/* Red Wax Seal */}
                <div className="absolute -top-5 -left-5 wax-seal w-12 h-12 rounded-full flex items-center justify-center text-background font-display-lg text-[9px] shadow-md uppercase select-none tracking-wider">
                  Talika
                </div>

                <header className="border-b border-[#E8DFCC] pb-3 mb-5">
                  <p className="font-label-caps text-[9px] text-on-surface-variant flex justify-between items-center">
                    <span>INTERNAL ARCHIVE QUERY</span>
                    <span>REF: AS-{String(index).padStart(4, '0')}</span>
                  </p>
                </header>

                <div className="font-body-md text-primary space-y-4 leading-relaxed text-sm whitespace-pre-wrap text-justify">
                  {msg.text}
                </div>

                {/* Sources Footer */}
                {msg.sources && msg.sources.length > 0 && (
                  <footer className="mt-8 pt-6 border-t border-[#E8DFCC]">
                    <h4 className="font-label-caps text-[10px] uppercase tracking-widest text-secondary mb-3">Cited Sources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {msg.sources.map((source, sIdx) => (
                        <div key={sIdx} className="flex gap-3 p-3 border border-aged-paper bg-white/50 hover:bg-white rounded-sm transition-colors group">
                          <div className="w-8 h-10 shrink-0 bg-surface-dim border border-aged-paper flex items-center justify-center text-secondary">
                            <span className="material-symbols-outlined text-sm">library_books</span>
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                            <p className="font-label-caps text-[8px] text-secondary">[{sIdx + 1}] MANUSCRIPT</p>
                            <p className="font-body-md text-xs font-semibold text-primary truncate" title={source}>{source}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </footer>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start pl-4">
            <div className="bg-ivory border border-aged-paper p-5 rounded relative shadow-sm max-w-lg -rotate-1 w-full flex items-center gap-3 text-secondary text-sm italic">
              <span className="terminal-spinner w-5 h-5"></span>
              Consulting Scriptorium archives...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-error rounded p-4 text-sm flex items-start gap-2 max-w-lg mx-auto">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Notebook-Style Input Area */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background via-background to-transparent z-10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
          <div className="border border-aged-paper bg-[#F9F5F0] p-4 rounded flex items-end gap-4 shadow-sm focus-within:ring-2 focus-within:ring-secondary/20">
            <div className="flex-1">
              <label className="block font-label-caps text-[9px] text-secondary mb-1 uppercase tracking-widest">Inquire with Assistant</label>
              <textarea 
                className="w-full bg-transparent border-0 border-b border-secondary/20 focus:border-secondary focus:ring-0 font-body-md text-primary placeholder:text-on-surface-variant/50 italic py-1 resize-none text-sm"
                placeholder="Write your scholarly inquiry..." 
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
              />
            </div>
            <button 
              type="submit" 
              className="px-6 py-3 btn-ink font-label-caps text-[10px] uppercase tracking-widest rounded-sm"
              disabled={loading || !input.trim()}
            >
              Consult
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
