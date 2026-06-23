import { useState } from 'react';

interface DocumentBrief {
  id: number;
  title: string;
  source_url: string | null;
  source_type: string | null;
  source_confidence_score: number | null;
}

interface DocumentsTabProps {
  workspaceId: number;
  documents: DocumentBrief[];
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
  onRefreshWorkspace: () => Promise<void>;
}

export default function DocumentsTab({ workspaceId, documents, apiFetch, onRefreshWorkspace }: DocumentsTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ id: number; title: string; raw_text_content: string } | null>(null);
  const [loadingDocText, setLoadingDocText] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiFetch(`/workspaces/${workspaceId}/documents/upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setFile(null);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        await onRefreshWorkspace();
      } else {
        const data = await res.json();
        setError(data.detail || 'Upload failed. Make sure it is a PDF or TXT file.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDoc = async (doc: DocumentBrief) => {
    setError(null);
    setLoadingDocText(true);
    try {
      const res = await apiFetch(`/workspaces/${workspaceId}/documents/${doc.id}`);
      if (res.ok) {
        const data = await res.json();
        setViewingDoc(data);
      } else {
        setError('Failed to fetch document content.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while opening the document.');
    } finally {
      setLoadingDocText(false);
    }
  };

  const getSourceTypeBadge = (type: string | null) => {
    switch (type) {
      case 'primary_context':
        return <span className="px-2 py-0.5 bg-secondary-container/40 text-on-secondary-container font-label-caps text-[9px] uppercase tracking-wider border border-secondary/20">Primary Source</span>;
      case 'expanded_context':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-label-caps text-[9px] uppercase tracking-wider border border-blue-200">Expanded Source</span>;
      case 'user_upload':
        return <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant font-label-caps text-[9px] uppercase tracking-wider border border-outline/20">User Material</span>;
      default:
        return <span className="px-2 py-0.5 bg-surface-container text-on-surface font-label-caps text-[9px] uppercase tracking-wider">{type || 'Source'}</span>;
    }
  };

  const getConfidenceColor = (score: number | null) => {
    if (score === null || score === undefined) return 'text-muted';
    if (score >= 85) return 'text-success';
    if (score >= 60) return 'text-secondary';
    return 'text-error';
  };

  return (
    <div>
      <div className="mb-8">
        <h3 className="font-label-caps text-label-caps uppercase text-secondary tracking-widest text-xs mb-1">Sources Explorer</h3>
        <p className="font-body-md text-on-surface-variant text-sm">
          Catalog and upload manuscripts, text transcriptions, or PDF materials. The intelligence system scores relevance and integrity automatically.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-error rounded p-4 mb-6 text-sm flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Upload Form Panel */}
        <div className="bg-ivory border border-aged-paper p-6 relative rounded shadow-sm">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary"></div>
          <h4 className="font-headline-sm text-primary text-xl mb-4">Ingest Material</h4>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps uppercase text-secondary tracking-widest block text-xs">PDF or TXT Folio</label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.txt"
                className="w-full bg-transparent border border-aged-paper focus:border-bronze focus:ring-0 font-body-md text-on-surface p-2 text-sm"
                onChange={handleFileChange}
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 btn-ink font-label-caps text-label-caps uppercase tracking-widest rounded-sm"
              disabled={uploading || !file}
            >
              {uploading ? 'Ingesting...' : 'Ingest Document'}
            </button>
          </form>
        </div>

        {/* Documents catalog list */}
        <div className="lg:col-span-2 space-y-4">
          {loadingDocText && (
            <div className="fixed inset-0 bg-black/25 backdrop-blur-xs z-[200] flex items-center justify-center text-secondary">
              <span className="terminal-spinner w-10 h-10"></span>
            </div>
          )}

          {documents.length === 0 ? (
            <div className="bg-ivory border border-aged-paper text-center py-12 text-on-surface-variant font-body-md text-sm rounded">
              No folios registered in this collection. Ingest a file or run research above.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {documents.map((doc) => (
                <article
                  key={doc.id}
                  className="bg-ivory border border-aged-paper p-5 hover:shadow-md transition-shadow rounded-sm flex justify-between items-center"
                >
                  <div className="space-y-2 min-w-0 pr-4">
                    <h4 className="font-headline-sm text-lg text-primary truncate leading-tight">
                      {doc.title}
                    </h4>
                    <div className="flex flex-wrap gap-3 items-center">
                      {getSourceTypeBadge(doc.source_type)}
                      {doc.source_confidence_score !== null && (
                        <span className={`font-label-caps text-[10px] uppercase font-bold tracking-wider ${getConfidenceColor(doc.source_confidence_score)}`}>
                          Usefulness: {doc.source_confidence_score}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    className="btn-ink px-4 py-2 font-label-caps text-[10px] uppercase tracking-widest rounded-sm flex-shrink-0"
                    onClick={() => handleOpenDoc(doc)}
                  >
                    Inspect Folio
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scriptorium Raw Text Viewer Modal */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-6" onClick={() => setViewingDoc(null)}>
          <div className="bg-background border border-aged-paper w-full max-w-4xl h-[80vh] flex flex-col shadow-xl rounded-sm paper-texture" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-aged-paper px-8 py-6 flex justify-between items-center shrink-0">
              <div className="space-y-1">
                <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest text-[10px]">Vault Codex Preview</span>
                <h3 className="font-display-lg text-headline-sm text-primary text-2xl truncate max-w-xl">{viewingDoc.title}</h3>
              </div>
              <button
                className="px-4 py-2 border border-error text-error font-label-caps text-[10px] uppercase tracking-widest hover:bg-red-50 transition-colors"
                onClick={() => setViewingDoc(null)}
              >
                Close Folio
              </button>
            </div>
            
            <div className="flex-grow p-8 overflow-y-auto font-body-md text-on-surface-variant leading-relaxed text-justify select-text">
              {/* Drop-cap rendering first letter in display style */}
              <span className="first-letter:text-4xl first-letter:font-display-lg first-letter:float-left first-letter:mr-2 whitespace-pre-wrap">
                {viewingDoc.raw_text_content}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
