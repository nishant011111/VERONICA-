import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Note, Subject } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { EditSubjectModal } from './EditSubjectModal';
import { Edit3 } from 'lucide-react';

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editNote?: Note | null;
}

export const NoteFormModal: React.FC<NoteFormModalProps> = ({
  isOpen,
  onClose,
  editNote,
}) => {
  const { addNote, updateNote, subjects } = useApp();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title);
      setContent(editNote.content);
      setSubjectId(editNote.subjectId || '');
      setIsPinned(editNote.isPinned);
      setTagsInput(editNote.tags.join(', '));
    } else {
      setTitle('');
      setContent('');
      setSubjectId('');
      setIsPinned(false);
      setTagsInput('');
    }
  }, [editNote, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (editNote) {
      updateNote(editNote.id, {
        title: title.trim(),
        content: content.trim(),
        subjectId: subjectId || undefined,
        isPinned,
        tags: parsedTags,
      });
    } else {
      addNote({
        title: title.trim(),
        content: content.trim(),
        subjectId: subjectId || undefined,
        isPinned,
        tags: parsedTags,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editNote ? 'Edit Note' : 'Create Note'}
      subtitle="Knowledge vault & study note editor"
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Note Title" required>
          <input
            type="text"
            required
            placeholder="e.g., Summary of Operating Systems Concurrency & Semaphores"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Subject Association">
            <div className="flex gap-2">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Uncategorized Note --</option>
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

          <FormField label="Tags (comma separated)" hint="e.g. revision, exam-prep, formulas">
            <input
              type="text"
              placeholder="revision, formulas, chapter1"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        <FormField label="Note Content" required>
          <textarea
            required
            rows={8}
            placeholder="Write your study notes, markdown snippets, or formulas here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono leading-relaxed"
          />
        </FormField>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pin-check"
            checked={isPinned}
            onChange={(e) => setIsPinned(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800"
          />
          <label htmlFor="pin-check" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Pin this note to top of list
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editNote ? 'Save Note' : 'Create Note'}
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
