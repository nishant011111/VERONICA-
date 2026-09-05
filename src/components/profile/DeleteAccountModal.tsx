import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Check, Server, HardDrive, Fingerprint, Cloud } from 'lucide-react';
import { Button } from '../ui/Button';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void> | void;
  userEmail?: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  userEmail,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = confirmText.trim().toUpperCase() === 'DELETE';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete();
      onClose();
    } catch (e) {
      console.error('Failed to delete account:', e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-rose-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Delete Account & Purge Data
              </h3>
              <p className="text-xs text-rose-300 font-medium">
                Irreversible Action • Cloud & Local Data Destruction
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner & Scope Breakdown */}
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs leading-relaxed flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-300 mb-1">
                Are you completely sure you want to delete account {userEmail ? `(${userEmail})` : ''}?
              </p>
              <p className="text-slate-300">
                This action is <strong>permanent</strong> and cannot be undone. All your academic profile data, course files, and credentials will be purged across all environments.
              </p>
            </div>
          </div>

          {/* Detailed Deletion Scope Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Cloud className="w-4 h-4" />
                <span>Cloud & Firebase</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Firestore user docs, authentication account, and SSO tokens.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <HardDrive className="w-4 h-4" />
                <span>Local Storage</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Enrolled courses, attendance, tasks, study sessions, notes & goals.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Server className="w-4 h-4" />
                <span>IndexedDB Vault</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Offline document blobs, uploaded PDFs, and cached assets.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <Fingerprint className="w-4 h-4" />
                <span>Biometrics</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Registered Touch ID / WebAuthn hardware passkeys.
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Input Box */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300">
            Type <span className="font-mono font-bold text-rose-400">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE"
            disabled={isDeleting}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm font-mono text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            disabled={!isConfirmed || isDeleting}
            onClick={handleDelete}
            icon={<Trash2 className="w-4 h-4" />}
            className="py-2.5 px-5 font-bold text-xs bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30"
          >
            {isDeleting ? 'Purging All Data...' : 'Permanently Delete Account & Data'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
