import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import {
  BookOpen,
  CalendarCheck,
  UserCheck,
  Clock,
  GraduationCap,
  FileText,
  StickyNote,
  FolderLock,
  Target
} from 'lucide-react';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (type: 'subject' | 'task' | 'attendance' | 'timetable' | 'exam' | 'assignment' | 'note' | 'vault' | 'goal') => void;
}

export const QuickCreateModal: React.FC<QuickCreateModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const actions: { id: 'subject' | 'task' | 'attendance' | 'timetable' | 'exam' | 'assignment' | 'note' | 'vault' | 'goal'; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    { id: 'subject', label: 'Subject', desc: 'Add new course syllabus & credits', icon: <BookOpen className="w-5 h-5" />, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    { id: 'task', label: 'Task', desc: 'Create study task in Planner', icon: <CalendarCheck className="w-5 h-5" />, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { id: 'attendance', label: 'Attendance', desc: 'Log today\'s class attendance', icon: <UserCheck className="w-5 h-5" />, color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
    { id: 'timetable', label: 'Timetable Slot', desc: 'Schedule weekly lecture or lab', icon: <Clock className="w-5 h-5" />, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { id: 'exam', label: 'Exam', desc: 'Add exam date & venue', icon: <GraduationCap className="w-5 h-5" />, color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    { id: 'assignment', label: 'Assignment', desc: 'Track coursework deadline', icon: <FileText className="w-5 h-5" />, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    { id: 'note', label: 'Study Note', desc: 'Create formatted study notes', icon: <StickyNote className="w-5 h-5" />, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    { id: 'vault', label: 'Vault File', desc: 'Store local study PDF/doc', icon: <FolderLock className="w-5 h-5" />, color: 'text-sky-500 bg-sky-500/10 border-sky-500/20' },
    { id: 'goal', label: 'Academic Goal', desc: 'Set target hours or grade', icon: <Target className="w-5 h-5" />, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Create"
      subtitle="Select an academic item to add to your workspace"
      maxWidth="xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => {
              onClose();
              onSelectAction(act.id);
            }}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group"
          >
            <div className={`p-2.5 rounded-xl border ${act.color}`}>
              {act.icon}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-500 transition-colors">
                {act.label}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                {act.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
};
