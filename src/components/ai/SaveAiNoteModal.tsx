import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileText, X, Check, Tag, Bookmark } from 'lucide-react';

interface SaveAiNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiContent: string;
  defaultSubjectId?: string;
}

export const SaveAiNoteModal: React.FC<SaveAiNoteModalProps> = ({
  isOpen,
  onClose,
  aiContent,
  defaultSubjectId
}) => {
  const { subjects, addNote, showToast } = useApp();
  const [title, setTitle] = useState(() => {
    const firstLine = aiContent.split('\n')[0].replace(/^#+\s*/, '').trim();
    return firstLine.slice(0, 45) || 'Veronica AI Explanation';
  });
  const [subjectId, setSubjectId] = useState<string>(defaultSubjectId || '');
  const [content, setContent] = useState(aiContent);
  const [tagInput, setTagInput] = useState('AI-Notes');
  const [tags, setTags] = useState<string[]>(['AI-Generated']);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    addNote({
      title: title.trim(),
      content: content.trim(),
      subjectId: subjectId || undefined,
      isPinned: false,
      tags
    });

    showToast('AI response saved to Notes database!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <Card glass className="w-full max-w-xl p-6 relative flex flex-col max-h-[90vh] shadow-2xl border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Save AI Answer to Notes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review and save this response directly into your persistent notebook
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Note Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quantum Mechanics Derivation Notes"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attach to Subject (Optional)
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">-- General / General Study --</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag and press enter"
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button size="sm" variant="ghost" onClick={handleAddTag} icon={<Tag className="w-3.5 h-3.5" />}>
                Add Tag
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(t => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium flex items-center gap-1"
                >
                  #{t}
                  <button onClick={() => handleRemoveTag(t)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Content Preview / Edit */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Note Content
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave} icon={<Bookmark className="w-4 h-4" />}>
            Save to Notes
          </Button>
        </div>
      </Card>
    </div>
  );
};
