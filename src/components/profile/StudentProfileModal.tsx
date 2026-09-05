import React from 'react';
import { X, GraduationCap, Sparkles } from 'lucide-react';
import { StudentProfileCard } from './StudentProfileCard';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  startInEditMode?: boolean;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ isOpen, onClose, startInEditMode = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Digital Student Profile <Sparkles className="w-4 h-4 text-amber-400" />
              </h2>
              <p className="text-xs text-slate-400">Verified Academic Pass & Student Telemetry</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Body */}
        <StudentProfileCard onSaved={onClose} startInEditMode={startInEditMode} />
      </div>
    </div>
  );
};

export default StudentProfileModal;
