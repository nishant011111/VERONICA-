import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Edit3, Check } from 'lucide-react';

interface EditSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject | null;
}

export const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  isOpen,
  onClose,
  subject,
}) => {
  const { updateSubject } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [teacher, setTeacher] = useState('');

  useEffect(() => {
    if (subject) {
      setName(subject.name || '');
      setCode(subject.code || '');
      setColor(subject.color || '#3b82f6');
      setTeacher(subject.teacher || '');
    }
  }, [subject, isOpen]);

  if (!subject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateSubject(subject.id, {
      name: name.trim(),
      code: code.trim(),
      color,
      teacher: teacher.trim(),
    });

    onClose();
  };

  const presetColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modify Subject Details"
      subtitle="Update subject name and properties across all sections"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Subject Name" required>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g., Data Structures & Algorithms"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Edit3 className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Subject Code">
            <input
              type="text"
              placeholder="e.g., CS201"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Instructor / Faculty">
            <input
              type="text"
              placeholder="e.g., Dr. Alan Turing"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <FormField label="Subject Theme Accent Color">
          <div className="flex items-center gap-2 pt-1">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                  color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {color === c && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            ))}
          </div>
        </FormField>

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-700 dark:text-blue-300">
          💡 Updating the subject name here automatically updates attendance, timetable, planner, exams, assignments, notes, goals, and analytics for this subject.
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
