import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal, GoalType, Subject } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { EditSubjectModal } from './EditSubjectModal';
import { Edit3 } from 'lucide-react';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  editGoal,
}) => {
  const { addGoal, updateGoal, subjects } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<GoalType>('daily_study_hours');
  const [targetValue, setTargetValue] = useState(20);
  const [currentValue, setCurrentValue] = useState(0);
  const [unit, setUnit] = useState('hours');
  const [deadline, setDeadline] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (editGoal) {
      setTitle(editGoal.title);
      setType(editGoal.type);
      setTargetValue(editGoal.targetValue);
      setCurrentValue(editGoal.currentValue);
      setUnit(editGoal.unit);
      setDeadline(editGoal.deadline || '');
      setSubjectId(editGoal.subjectId || '');
    } else {
      setTitle('');
      setType('daily_study_hours');
      setTargetValue(20);
      setCurrentValue(0);
      setUnit('hours');
      setDeadline('');
      setSubjectId('');
    }
  }, [editGoal, isOpen]);

  const handleTypeChange = (newType: GoalType) => {
    setType(newType);
    if (newType === 'daily_study_hours') setUnit('hours');
    else if (newType === 'assignment_completion') setUnit('assignments');
    else if (newType === 'exam_target') setUnit('% score');
    else setUnit('items');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editGoal) {
      updateGoal(editGoal.id, {
        title: title.trim(),
        type,
        targetValue,
        currentValue,
        unit,
        deadline: deadline || undefined,
        subjectId: subjectId || undefined,
        completed: currentValue >= targetValue,
      });
    } else {
      addGoal({
        title: title.trim(),
        type,
        targetValue,
        currentValue,
        unit,
        deadline: deadline || undefined,
        subjectId: subjectId || undefined,
        completed: false,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editGoal ? 'Edit Goal' : 'Create Academic Goal'}
      subtitle="Define quantitative targets for study hours, subjects, or exams"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Goal Title" required>
          <input
            type="text"
            required
            placeholder="e.g., Log 50 Hours of Deep Focus this Semester"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Goal Category">
            <select
              value={type}
              onChange={(e) => handleTypeChange(e.target.value as GoalType)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="study_hours">Study Hours Goal</option>
              <option value="subject_grade">Subject Target Grade</option>
              <option value="exam_target">Exam Target Score</option>
              <option value="assignment_completion">Assignment Completion</option>
              <option value="personal">Personal Academic Goal</option>
            </select>
          </FormField>

          <FormField label="Associated Subject (Optional)">
            <div className="flex gap-2">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- All / General Goal --</option>
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
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Target Value">
            <input
              type="number"
              required
              min="1"
              value={targetValue}
              onChange={(e) => setTargetValue(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Current Value">
            <input
              type="number"
              min="0"
              value={currentValue}
              onChange={(e) => setCurrentValue(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Unit">
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <FormField label="Target Deadline">
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editGoal ? 'Save Goal' : 'Create Goal'}
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
