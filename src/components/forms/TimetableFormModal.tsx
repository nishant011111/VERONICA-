import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TimetableSlot, Subject } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { EditSubjectModal } from './EditSubjectModal';
import { Edit3 } from 'lucide-react';

interface TimetableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSlot?: TimetableSlot | null;
  defaultDay?: number;
}

export const TimetableFormModal: React.FC<TimetableFormModalProps> = ({
  isOpen,
  onClose,
  editSlot,
  defaultDay = 1,
}) => {
  const { addTimetableSlot, updateTimetableSlot, subjects } = useApp();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [dayOfWeek, setDayOfWeek] = useState<number>(defaultDay);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [room, setRoom] = useState('');
  const [teacher, setTeacher] = useState('');
  const [type, setType] = useState<'lecture' | 'lab' | 'tutorial' | 'seminar' | 'other'>('lecture');
  const [notes, setNotes] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (editSlot) {
      setSubjectId(editSlot.subjectId);
      setDayOfWeek(editSlot.dayOfWeek);
      setStartTime(editSlot.startTime);
      setEndTime(editSlot.endTime);
      setRoom(editSlot.room);
      setTeacher(editSlot.teacher);
      setType(editSlot.type);
      setNotes(editSlot.notes || '');
    } else {
      setSubjectId(subjects[0]?.id ?? '');
      setDayOfWeek(defaultDay);
      setStartTime('09:00');
      setEndTime('10:30');
      setRoom('');
      setTeacher('');
      setType('lecture');
      setNotes('');
    }
  }, [editSlot, isOpen, defaultDay, subjects]);

  const days = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) return;

    if (editSlot) {
      updateTimetableSlot(editSlot.id, {
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        room: room.trim(),
        teacher: teacher.trim(),
        type,
        notes: notes.trim(),
      });
    } else {
      addTimetableSlot({
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        room: room.trim(),
        teacher: teacher.trim(),
        type,
        notes: notes.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editSlot ? 'Edit Class Slot' : 'Add Class to Timetable'}
      subtitle="Schedule recurring weekly lectures and labs"
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
              {subjects.length === 0 && <option value="">No subjects found. Create a subject first.</option>}
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
          <FormField label="Day of Week">
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {days.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Class Type">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lecture">Lecture</option>
              <option value="lab">Lab Practical</option>
              <option value="tutorial">Tutorial</option>
              <option value="seminar">Seminar</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Time">
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="End Time">
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Room / Location / Hall">
            <input
              type="text"
              placeholder="e.g. Hall B3 or Zoom Link"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Instructor">
            <input
              type="text"
              placeholder="e.g. Prof. Alan Turing"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!subjectId}>
            {editSlot ? 'Save Changes' : 'Add Class Slot'}
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
