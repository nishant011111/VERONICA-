import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, TaskPriority, TaskStatus, RecurrenceType, Subject } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { EditSubjectModal } from './EditSubjectModal';
import { Edit3 } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editTask?: Task | null;
  defaultDate?: string;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  editTask,
  defaultDate,
}) => {
  const { addTask, updateTask, subjects } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [reminder, setReminder] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');
  const [notes, setNotes] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setSubjectId(editTask.subjectId || '');
      setDate(editTask.date);
      setStartTime(editTask.startTime || '09:00');
      setDuration(editTask.duration || 60);
      setPriority(editTask.priority);
      setStatus(editTask.status);
      setReminder(editTask.reminder);
      setRecurrence(editTask.recurrence);
      setNotes(editTask.notes || '');
    } else {
      setTitle('');
      setDescription('');
      setSubjectId(subjects.length > 0 ? subjects[0].id : '');
      setDate(defaultDate || new Date().toISOString().split('T')[0]);
      setStartTime('09:00');
      setDuration(60);
      setPriority('medium');
      setStatus('todo');
      setReminder(false);
      setRecurrence('none');
      setNotes('');
    }
  }, [editTask, isOpen, defaultDate, subjects]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editTask) {
      updateTask(editTask.id, {
        title: title.trim(),
        description: description.trim(),
        subjectId: subjectId || undefined,
        date,
        startTime,
        duration,
        priority,
        status,
        reminder,
        recurrence,
        notes: notes.trim(),
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        subjectId: subjectId || undefined,
        date,
        startTime,
        duration,
        priority,
        status,
        reminder,
        recurrence,
        notes: notes.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTask ? 'Edit Task' : 'Create Task'}
      subtitle="Schedule academic tasks & study sessions"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Task Title" required>
          <input
            type="text"
            required
            placeholder="e.g., Read Chapter 4 & complete exercises"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Associated Subject">
            <div className="flex gap-2">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- General / No Subject --</option>
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

          <FormField label="Task Priority">
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
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Target Date">
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Start Time">
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Duration (Minutes)">
            <input
              type="number"
              min="5"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 30)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </FormField>

          <FormField label="Recurrence">
            <select
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </FormField>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="reminder-check"
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800"
          />
          <label htmlFor="reminder-check" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Set local study reminder notification
          </label>
        </div>

        <FormField label="Notes & References">
          <textarea
            rows={2}
            placeholder="Key formulas, textbook pages, links..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editTask ? 'Save Task' : 'Add Task'}
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
