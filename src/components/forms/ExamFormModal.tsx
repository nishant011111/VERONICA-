import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, Subject } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { EditSubjectModal } from './EditSubjectModal';
import { Edit3 } from 'lucide-react';

interface ExamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editExam?: Exam | null;
}

export const ExamFormModal: React.FC<ExamFormModalProps> = ({
  isOpen,
  onClose,
  editExam,
}) => {
  const { addExam, updateExam, subjects } = useApp();

  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [notes, setNotes] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (editExam) {
      setName(editExam.name);
      setSubjectId(editExam.subjectId);
      setDate(editExam.date);
      setTime(editExam.time);
      setLocation(editExam.location);
      setSyllabus(editExam.syllabus || '');
      setNotes(editExam.notes || '');
    } else {
      setName('');
      setSubjectId(subjects[0]?.id ?? '');
      setDate(new Date().toISOString().split('T')[0]);
      setTime('10:00');
      setLocation('');
      setSyllabus('');
      setNotes('');
    }
  }, [editExam, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subjectId) return;

    if (editExam) {
      updateExam(editExam.id, {
        name: name.trim(),
        subjectId,
        date,
        time,
        location: location.trim(),
        syllabus: syllabus.trim(),
        notes: notes.trim(),
      });
    } else {
      addExam({
        name: name.trim(),
        subjectId,
        date,
        time,
        location: location.trim(),
        syllabus: syllabus.trim(),
        notes: notes.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editExam ? 'Edit Exam' : 'Schedule Exam'}
      subtitle="Track exam dates, syllabus coverage, and live countdowns"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Exam Name / Title" required>
          <input
            type="text"
            required
            placeholder="e.g., Midterm Examination - Data Structures"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <FormField label="Subject" required>
          <div className="flex gap-2">
            <select
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.length === 0 && <option value="">No subjects created yet.</option>}
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code ? `[${sub.code}] ` : ''}{sub.name}
                </option>
              ))}
            </select>
            {subjectId && (
              <button
                type="button"
                onClick={() => {
                  const sub = subjects.find(s => s.id === subjectId);
                  if (sub) setEditingSubject(sub);
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-500 hover:text-blue-500 hover:border-blue-500 shrink-0 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Edit selected subject name"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            )}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Exam Date" required>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Exam Start Time">
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <FormField label="Location / Venue">
          <input
            type="text"
            placeholder="e.g. Auditorium A, Desk 42"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <FormField label="Exam Syllabus Coverage">
          <textarea
            rows={2}
            placeholder="Chapters 1 to 5, Binary Trees, Graphs..."
            value={syllabus}
            onChange={(e) => setSyllabus(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!subjectId}>
            {editExam ? 'Save Exam' : 'Schedule Exam'}
          </Button>
        </div>
      </form>

      <EditSubjectModal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        subject={editingSubject}
      />
    </Modal>
  );
};
