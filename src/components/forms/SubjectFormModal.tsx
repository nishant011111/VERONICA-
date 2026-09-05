import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, SyllabusTopic } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Plus, Trash2 } from 'lucide-react';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSubject?: Subject | null;
}

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  isOpen,
  onClose,
  editSubject,
}) => {
  const { addSubject, updateSubject } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [teacher, setTeacher] = useState('');
  const [credits, setCredits] = useState(3);
  const [semester, setSemester] = useState('Semester 1');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');
  const [targetPercentage, setTargetPercentage] = useState(85);
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [syllabusTopics, setSyllabusTopics] = useState<SyllabusTopic[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  useEffect(() => {
    if (editSubject) {
      setName(editSubject.name);
      setCode(editSubject.code);
      setTeacher(editSubject.teacher);
      setCredits(editSubject.credits);
      setSemester(editSubject.semester);
      setColor(editSubject.color || '#3b82f6');
      setDescription(editSubject.description);
      setTargetPercentage(editSubject.targetPercentage || 85);
      setPriority(editSubject.priority || 'medium');
      setSyllabusTopics(editSubject.syllabus || []);
    } else {
      setName('');
      setCode('');
      setTeacher('');
      setCredits(3);
      setSemester('Semester 1');
      setColor('#3b82f6');
      setDescription('');
      setTargetPercentage(85);
      setPriority('medium');
      setSyllabusTopics([]);
    }
  }, [editSubject, isOpen]);

  const handleAddSyllabusTopic = () => {
    if (!newTopicTitle.trim()) return;
    setSyllabusTopics([
      ...syllabusTopics,
      { id: 'top_' + Date.now(), title: newTopicTitle.trim(), completed: false, status: 'not_started', importance: 'medium', difficulty: 'medium', confidence: 'low' },
    ]);
    setNewTopicTitle('');
  };

  const handleRemoveSyllabusTopic = (id: string) => {
    setSyllabusTopics(syllabusTopics.filter((t) => t.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editSubject) {
      updateSubject(editSubject.id, {
        name: name.trim(),
        code: code.trim(),
        teacher: teacher.trim(),
        credits,
        semester,
        color,
        description,
        syllabus: syllabusTopics,
        targetPercentage,
        priority,
      });
    } else {
      addSubject({
        name: name.trim(),
        code: code.trim(),
        teacher: teacher.trim(),
        credits,
        semester,
        color,
        icon: 'BookOpen',
        description: description.trim(),
        syllabus: syllabusTopics,
        targetPercentage,
        priority,
      });
    }
    onClose();
  };

  const presetColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editSubject ? 'Edit Subject' : 'Add Subject'}
      subtitle="Define academic subject properties and syllabus details"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FormField label="Subject Name" required>
              <input
                type="text"
                required
                placeholder="e.g., Computer Organization & Architecture"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>

          <FormField label="Subject Code">
            <input
              type="text"
              placeholder="e.g., CS302"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Instructor / Faculty">
            <input
              type="text"
              placeholder="e.g., Dr. Robert Chen"
              value={teacher}
              onChange={(e) => setTeacher(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Credits">
            <input
              type="number"
              min="1"
              max="20"
              value={credits}
              onChange={(e) => setCredits(parseInt(e.target.value, 10) || 3)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <FormField label="Semester">
            <input
              type="text"
              placeholder="e.g., Fall 2026"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Attendance Target (%)">
            <input
              type="number"
              min="0"
              max="100"
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(parseInt(e.target.value, 10) || 75)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField label="Priority">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </FormField>
        </div>

        {/* Color Accent Selection */}
        <FormField label="Subject Accent Color">
          <div className="flex items-center gap-2">
            {presetColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full transition-transform ${
                  color === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </FormField>

        <FormField label="Description">
          <textarea
            rows={2}
            placeholder="Course scope, learning objectives..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        {/* Syllabus Topic Manager */}
        <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
          <label className="block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase">
            Syllabus Topics
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add syllabus topic title..."
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button type="button" size="sm" variant="secondary" onClick={handleAddSyllabusTopic} icon={<Plus className="w-3.5 h-3.5" />}>
              Add
            </Button>
          </div>

          {syllabusTopics.length > 0 && (
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {syllabusTopics.map((top) => (
                <div
                  key={top.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <span className="text-slate-800 dark:text-slate-200">{top.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSyllabusTopic(top.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editSubject ? 'Save Changes' : 'Create Subject'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
