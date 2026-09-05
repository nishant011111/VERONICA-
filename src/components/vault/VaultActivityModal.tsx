import React from 'react';
import { VaultActivity } from '../../types';
import { Button } from '../ui/Button';
import {
  X,
  History,
  HardDrive,
  Cloud,
  FolderLock,
  Trash2,
  FilePlus,
  Edit2,
  MoveRight,
  Download,
  Eye,
  CheckCircle2
} from 'lucide-react';

interface VaultActivityModalProps {
  activities: VaultActivity[];
  onClose: () => void;
  onClearHistory: () => void;
}

export const VaultActivityModal: React.FC<VaultActivityModalProps> = ({
  activities,
  onClose,
  onClearHistory,
}) => {
  const getActionIcon = (action: VaultActivity['action']) => {
    switch (action) {
      case 'uploaded': return <FilePlus className="w-4 h-4 text-emerald-400" />;
      case 'opened': return <Eye className="w-4 h-4 text-sky-400" />;
      case 'renamed': return <Edit2 className="w-4 h-4 text-amber-400" />;
      case 'moved': return <MoveRight className="w-4 h-4 text-indigo-400" />;
      case 'saved_offline': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'removed_offline': return <Download className="w-4 h-4 text-amber-400" />;
      case 'deleted': return <Trash2 className="w-4 h-4 text-rose-400" />;
      default: return <History className="w-4 h-4 text-neutral-400" />;
    }
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return ts;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Vault Activity History</h3>
              <p className="text-xs text-neutral-400 font-mono">Operations log & file audit trail</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto space-y-2 pr-1">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No recent activity logged in Vault.
            </div>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className="p-3 bg-neutral-900/40 border border-neutral-800/60 rounded-2xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center shrink-0">
                    {getActionIcon(act.action)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{act.fileName}</p>
                    <p className="text-[10px] text-neutral-400 font-mono capitalize">
                      {(act.action || '').replace('_', ' ')} • {(act.storageSource || 'local').toUpperCase()}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                  {formatTime(act.timestamp)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {activities.length > 0 && (
          <div className="pt-3 border-t border-neutral-800/80 flex justify-end shrink-0">
            <button
              onClick={onClearHistory}
              className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-rose-400 hover:bg-rose-500/10 rounded-2xl text-xs font-bold transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History Log
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
