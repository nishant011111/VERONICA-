import React from 'react';
import { Button } from '../ui/Button';
import { AlertTriangle, Copy, RefreshCw, X } from 'lucide-react';

interface DuplicateFileDialogProps {
  fileName: string;
  onReplace: () => void;
  onKeepBoth: () => void;
  onCancel: () => void;
}

export const DuplicateFileDialog: React.FC<DuplicateFileDialogProps> = ({
  fileName,
  onReplace,
  onKeepBoth,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Duplicate File Detected</h3>
            <p className="text-xs text-neutral-400 mt-1">
              A file named <span className="font-mono text-amber-300 font-semibold">{fileName}</span> already exists in this Vault location.
            </p>
          </div>
        </div>

        <div className="bg-neutral-900/60 p-4 rounded-2xl border border-neutral-800/80 text-xs text-neutral-300 space-y-2">
          <p className="font-semibold text-white">Choose how to resolve this collision:</p>
          <ul className="list-disc list-inside space-y-1 text-neutral-400">
            <li><strong className="text-white">Replace</strong>: Overwrites the existing file content with the new file.</li>
            <li><strong className="text-white">Keep Both</strong>: Saves the new file with an appended copy suffix (e.g., <span className="font-mono text-xs">file (1).pdf</span>).</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
          <button
            onClick={onReplace}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Replace
          </button>
          <button
            onClick={onKeepBoth}
            className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> Keep Both
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto py-2.5 px-4 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-2xl text-xs font-bold transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
