import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Assignment, AssignmentStatus, TaskPriority, Subject } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { EditSubjectModal } from './EditSubjectModal';
import { Edit3 } from 'lucide-react';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editAssignment?: Assignment | null;
}

export const AssignmentFormModal: React.FC<AssignmentFormModalProps> = ({
  isOpen,
  onClose,
  editAssignment,
}) => {
  const { addAssignment, updateAssignment, subjects } = useApp();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<AssignmentStatus>('not_started');
  const [notes, setNotes] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (editAssignment) {
      setTitle(editAssignment.title);
      setSubjectId(editAssignment.subjectId);
      setDescription(editAssignment.description);
      setDueDate(editAssignment.dueDate);
      setPriority(editAssignment.priority);
      setStatus(editAssignment.status);
      setNotes(editAssignment.notes || '');
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 7);
      const defaultIso = tomorrow.toISOString().slice(0, 16);

      setTitle('');
      setSubjectId(subjects[0]?.id ?? '');
      setDescription('');
      setDueDate(defaultIso);
      setPriority('medium');
      setStatus('not_started');
      setNotes('');
    }
  }, [editAssignment, isOpen, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    if (editAssignment) {
      updateAssignment(editAssignment.id, {
        title: title.trim(),
        subjectId,
        description: description.trim(),
        dueDate,
        priority,
        status,
        notes: notes.trim(),
      });
    } else {
      addAssignment({
        title: title.trim(),
        subjectId,
        description: description.trim(),
        dueDate,
        priority,
        status,
        attachments: [],
        notes: notes.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editAssignment ? 'Edit Assignment' : 'Add Assignment'}
      subtitle="Track coursework deliverables and submission dates"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Assignment Title" required>
          <input
            type="text"
            required
            placeholder="e.g., Problem Set 2 - Graph Algorithms Implementation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
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

          <FormField label="Due Date & Time" required>
            <input
              type="datetime-local"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </FormField>

          <FormField label="Submission Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AssignmentStatus)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </FormField>
        </div>

        <FormField label="Description & Instructions">
          <textarea
            rows={2}
            placeholder="Submission guidelines, required file format..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!subjectId}>
            {editAssignment ? 'Save Changes' : 'Create Assignment'}
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
