import React, { useState, useEffect } from 'react';
import { VaultFile } from '../../types';
import { vaultIndexedDB } from '../../services/vaultIndexedDB';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Download,
  Search,
  Info,
  HardDrive,
  Cloud,
  FolderLock,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface PdfViewerModalProps {
  file: VaultFile;
  onClose: () => void;
  onOpenInfo: () => void;
  onSaveOffline?: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  file,
  onClose,
  onOpenInfo,
  onSaveOffline,
}) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5); // Simulated pagination for extracted pages
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadContent() {
      setLoading(true);
      try {
        if (file.fileData) {
          setBlobUrl(file.fileData);
        } else {
          const cached = await vaultIndexedDB.getBlob(file.id);
          if (cached) {
            if (typeof cached === 'string') {
              setBlobUrl(cached);
            } else if (cached instanceof Blob) {
              const url = URL.createObjectURL(cached);
              setBlobUrl(url);
            }
          } else {
            setBlobUrl(null);
          }
        }
      } catch (e) {
        console.warn('Error loading PDF blob', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadContent();

    return () => {
      isMounted = false;
      if (blobUrl && blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [file]);

  // Keyboard Shortcuts for Windows/Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || (e.ctrlKey && e.key === '=')) setZoom((z) => Math.min(z + 15, 200));
      if (e.key === '-' || (e.ctrlKey && e.key === '-')) setZoom((z) => Math.max(z - 15, 50));
      if (e.key === 'ArrowRight') setCurrentPage((p) => Math.min(p + 1, totalPages));
      if (e.key === 'ArrowLeft') setCurrentPage((p) => Math.max(p - 1, 1));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, totalPages]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getSourceIcon = () => {
    if (file.storageSource === 'local') return <HardDrive className="w-3.5 h-3.5 text-sky-400" />;
    if (file.storageSource === 'cloud') return <Cloud className="w-3.5 h-3.5 text-indigo-400" />;
    return <FolderLock className="w-3.5 h-3.5 text-emerald-400" />;
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col bg-[#050505] text-[#E0E0E0] ${isFullscreen ? 'p-0' : 'p-2 sm:p-6'}`}>
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-[#0A0A0A] border border-neutral-800 rounded-2xl shadow-xl shrink-0">
        {/* Left: File Metadata & Source */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase">
            {file.type || 'PDF'}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white max-w-xs sm:max-w-md truncate flex items-center gap-2">
              {file.name}
              {file.isOfflineAvailable && (
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Offline ✓
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider">
                {getSourceIcon()} {file.storageSource}
              </span>
              <span>•</span>
              <span className="text-[10px] font-mono">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        </div>

        {/* Center: Controls Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800">
          {/* Zoom */}
          <button
            onClick={() => setZoom((z) => Math.max(z - 15, 50))}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-1 min-w-[3.5rem] text-center text-neutral-300">
            {zoom}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(z + 15, 200))}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-neutral-800 mx-1" />

          {/* Rotate */}
          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Page Selector */}
          <div className="w-px h-4 bg-neutral-800 mx-1" />
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-30 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-neutral-300 px-1">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-neutral-800 disabled:opacity-30 text-neutral-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search in PDF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-36 bg-neutral-900 border border-neutral-800 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
            />
          </div>

          {!file.isOfflineAvailable && onSaveOffline && (
            <Button variant="secondary" size="sm" onClick={onSaveOffline}>
              Save Offline
            </Button>
          )}

          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="File Details"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Full Screen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
            title="Close Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document Preview Stage */}
      <div className="flex-1 overflow-auto mt-4 p-4 flex justify-center items-center bg-[#080808] rounded-2xl border border-neutral-800/80 relative">
        {loading ? (
          <div className="text-center p-8 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400">Loading document canvas...</p>
          </div>
        ) : blobUrl ? (
          <div
            className="transition-transform duration-200 ease-out shadow-2xl bg-white text-slate-900 rounded-xl overflow-hidden max-w-4xl w-full"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {blobUrl.startsWith('data:application/pdf') || blobUrl.startsWith('blob:') ? (
              <iframe
                src={blobUrl}
                title={file.name}
                className="w-full h-[70vh] border-0 rounded-xl"
              />
            ) : blobUrl.startsWith('data:image') ? (
              <img src={blobUrl} alt={file.name} className="w-full max-h-[75vh] object-contain" />
            ) : (
              <div className="p-8 text-slate-800 font-sans leading-relaxed min-h-[400px]">
                <div className="border-b pb-4 mb-4">
                  <h1 className="text-xl font-bold uppercase tracking-wide">{file.name}</h1>
                  <p className="text-xs text-slate-500 mt-1">Page {currentPage} of {totalPages}</p>
                </div>
                <p className="text-sm">
                  {searchQuery ? (
                    <mark className="bg-amber-200 px-1 font-semibold">{searchQuery}</mark>
                  ) : null}
                </p>
                <div className="prose text-sm text-slate-700 whitespace-pre-wrap mt-4">
                  {file.fileData && file.fileData.startsWith('data:text')
                    ? atob(file.fileData.split(',')[1] || '')
                    : `Document content view for ${file.name}.\n\nStorage Location: ${(file.storageSource || 'local').toUpperCase()}\nOffline Available: ${file.isOfflineAvailable ? 'YES' : 'NO'}\n\nThis study document is ready for offline reading and future Veronica AI analysis.`}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-8 max-w-md bg-[#0A0A0A] border border-neutral-800 rounded-2xl">
            <FileText className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-bold text-white mb-1">Document Preview Ready</h4>
            <p className="text-xs text-neutral-400 mb-4">
              {file.storageSource === 'drive'
                ? 'This file is hosted on Google Drive. You can stream it or save it offline.'
                : 'File metadata is synced.'}
            </p>
            {file.driveWebViewLink && (
              <a
                href={file.driveWebViewLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 transition-colors"
              >
                Open in Google Drive
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
