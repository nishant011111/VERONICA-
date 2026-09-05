import React from 'react';
import { VaultFile, Subject } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  X,
  HardDrive,
  Cloud,
  FolderLock,
  FileText,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Download,
  Trash2
} from 'lucide-react';

interface FileInfoModalProps {
  file: VaultFile;
  subject?: Subject;
  onClose: () => void;
  onSaveOffline?: () => void;
  onRemoveOffline?: () => void;
  onDelete?: () => void;
}

export const FileInfoModal: React.FC<FileInfoModalProps> = ({
  file,
  subject,
  onClose,
  onSaveOffline,
  onRemoveOffline,
  onDelete,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSourceBadge = () => {
    if (file.storageSource === 'local') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-xs font-mono font-bold uppercase">
          <HardDrive className="w-3.5 h-3.5" /> 💻 Local Device
        </span>
      );
    }
    if (file.storageSource === 'cloud') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-mono font-bold uppercase">
          <Cloud className="w-3.5 h-3.5" /> ☁ Veronica Cloud
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-bold uppercase">
        <FolderLock className="w-3.5 h-3.5" /> G Google Drive
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm uppercase">
              {file.type || 'PDF'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white break-all">{file.name}</h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{file.mimeType || 'Document'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Source Badge */}
        <div className="flex items-center justify-between bg-neutral-900/60 p-3 rounded-2xl border border-neutral-800/80">
          <span className="text-xs text-neutral-400 font-medium">Storage Location</span>
          {getSourceBadge()}
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl">
            <span className="text-neutral-500 block text-[10px] font-mono uppercase">File Size</span>
            <span className="font-bold text-white font-mono mt-1 block">{formatSize(file.size)}</span>
          </div>

          <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl">
            <span className="text-neutral-500 block text-[10px] font-mono uppercase">Offline Status</span>
            <span className="mt-1 block">
              {file.isOfflineAvailable ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Available Offline ✓
                </span>
              ) : (
                <span className="text-neutral-400 font-mono">Online Only</span>
              )}
            </span>
          </div>

          <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl">
            <span className="text-neutral-500 block text-[10px] font-mono uppercase">Associated Subject</span>
            <span className="font-semibold text-white mt-1 block truncate">
              {subject ? subject.name : 'General Vault'}
            </span>
          </div>

          <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl">
            <span className="text-neutral-500 block text-[10px] font-mono uppercase">Permissions</span>
            <span className="font-semibold text-white mt-1 block flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              {file.drivePermission === 'read_only' ? 'Read-only' : 'Full Control'}
            </span>
          </div>

          <div className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl col-span-2 flex items-center justify-between">
            <div>
              <span className="text-neutral-500 block text-[10px] font-mono uppercase">Uploaded Date</span>
              <span className="font-mono text-neutral-300 text-xs mt-0.5 block">{file.uploadedAt.split('T')[0]}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] font-mono uppercase">Last Modified</span>
              <span className="font-mono text-neutral-300 text-xs mt-0.5 block">{file.modifiedAt.split('T')[0]}</span>
            </div>
          </div>
        </div>

        {/* Offline Management Actions */}
        <div className="space-y-2 pt-2 border-t border-neutral-800/80">
          {file.storageSource !== 'local' && (
            file.isOfflineAvailable ? (
              <button
                onClick={onRemoveOffline}
                className="w-full py-2.5 px-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl text-xs font-bold hover:bg-amber-500/20 transition-colors flex items-center justify-center gap-2"
              >
                Remove Offline Copy
              </button>
            ) : (
              <button
                onClick={onSaveOffline}
                className="w-full py-2.5 px-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Save Copy Offline
              </button>
            )
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="w-full py-2.5 px-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
