import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceRecord, AttendanceStatus, Subject } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { EditSubjectModal } from './EditSubjectModal';
import { Edit3 } from 'lucide-react';

interface AttendanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  initialRecord?: AttendanceRecord | null;
}

export const AttendanceFormModal: React.FC<AttendanceFormModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId,
  initialRecord,
}) => {
  const { addAttendanceRecord, updateAttendanceRecord, subjects } = useApp();

  const [subjectId, setSubjectId] = useState(defaultSubjectId || (subjects[0]?.id ?? ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<AttendanceStatus>('present');
  const [notes, setNotes] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (initialRecord) {
      setSubjectId(initialRecord.subjectId);
      setDate(initialRecord.date);
      setStatus(initialRecord.status);
      setNotes(initialRecord.notes || '');
    } else if (isOpen) {
      setSubjectId(defaultSubjectId || (subjects[0]?.id ?? ''));
      setDate(new Date().toISOString().split('T')[0]);
      setStatus('present');
      setNotes('');
    }
  }, [initialRecord, defaultSubjectId, subjects, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    if (initialRecord) {
      updateAttendanceRecord(initialRecord.id, {
        subjectId,
        date,
        status,
        notes: notes.trim(),
      });
    } else {
      addAttendanceRecord({
        subjectId,
        date,
        status,
        notes: notes.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Class Attendance"
      subtitle="Record your daily lecture presence"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Subject" required>
          <div className="flex gap-2">
            <select
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjects.length === 0 && <option value="">No subjects available. Add a subject first.</option>}
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
          <FormField label="Class Date">
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Attendance Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="cancelled">Cancelled Class</option>
            </select>
          </FormField>
        </div>

        <FormField label="Class Notes / Reason">
          <textarea
            rows={2}
            placeholder="e.g. Lecture topic on Memory Paging, or sickness excuse..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!subjectId}>
            Log Record
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
