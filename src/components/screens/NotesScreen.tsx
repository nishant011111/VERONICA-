import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Note, Subject } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { EditSubjectModal } from '../forms/EditSubjectModal';
import {
  StickyNote,
  Plus,
  Pin,
  Search,
  Tag,
  Edit2,
  Trash2,
  Calendar,
  BookOpen,
  Edit3
} from 'lucide-react';

interface NotesScreenProps {
  onOpenNoteModal: (note?: Note | null) => void;
}

export const NotesScreen: React.FC<NotesScreenProps> = ({ onOpenNoteModal }) => {
  const { notes, deleteNote, togglePinNote, subjects, searchQuery } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedNoteView, setSelectedNoteView] = useState<Note | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const getSubject = (subjectId?: string) => subjects.find((s) => s.id === subjectId);

  const filteredNotes = notes.filter((note) => {
    if (selectedSubjectFilter !== 'all' && note.subjectId !== selectedSubjectFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = note.title.toLowerCase().includes(q);
      const contentMatch = note.content.toLowerCase().includes(q);
      const tagMatch = note.tags.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !contentMatch && !tagMatch) return false;
    }
    return true;
  });

  // Pinned notes sorted to top
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Knowledge Vault & Study Notes
            <Badge variant="indigo">{notes.length} Saved</Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Organized markdown study notes linked with course subjects and tags
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => onOpenNoteModal(null)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Note
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2">
        <select
          value={selectedSubjectFilter}
          onChange={(e) => setSelectedSubjectFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
        >
          <option value="all">All Subjects ({notes.length})</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {selectedSubjectFilter !== 'all' && (
          <button
            onClick={() => {
              const sub = subjects.find(s => s.id === selectedSubjectFilter);
              if (sub) setEditingSubject(sub);
            }}
            className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors text-xs font-semibold flex items-center gap-1"
            title="Edit Subject Name"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Subject
          </button>
        )}
      </div>

      {/* Empty State vs Notes Grid */}
      {sortedNotes.length === 0 ? (
        <EmptyState
          icon={<StickyNote className="w-8 h-8" />}
          title="No study notes created yet."
          description="Capture lecture concepts, formulas, and revision materials here."
          actionLabel="+ Create Note"
          onAction={() => onOpenNoteModal(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedNotes.map((note) => {
            const sub = getSubject(note.subjectId);
            return (
              <Card
                key={note.id}
                glass
                hoverEffect
                className="flex flex-col justify-between space-y-3 relative group"
              >
                <div>
                  {/* Top Bar with Pin & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-500 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      <span>{sub ? sub.name : 'General Note'}</span>
                      {sub && (
                        <button
                          onClick={() => setEditingSubject(sub)}
                          className="text-slate-400 hover:text-indigo-500 p-0.5"
                          title="Edit Subject Name"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          note.isPinned
                            ? 'text-amber-500 bg-amber-500/10'
                            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                      >
                        <Pin className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        onClick={() => onOpenNoteModal(note)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => setSelectedNoteView(note)}
                    className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-500 cursor-pointer line-clamp-2"
                  >
                    {note.title}
                  </h3>

                  <p
                    onClick={() => setSelectedNoteView(note)}
                    className="text-xs text-slate-500 dark:text-slate-400 line-clamp-4 mt-2 font-mono whitespace-pre-wrap cursor-pointer"
                  >
                    {note.content}
                  </p>
                </div>

                {/* Tags & Date */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{note.createdAt.split('T')[0]}</span>
                    <span>{note.content.length} chars</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Full Note Detail Modal */}
      {selectedNoteView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="indigo">
                  {getSubject(selectedNoteView.subjectId)?.name || 'General Note'}
                </Badge>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {selectedNoteView.title}
                </h2>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedNoteView(null)}>
                Close
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 font-mono whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-800">
              {selectedNoteView.content}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
              <span>Created: {selectedNoteView.createdAt.replace('T', ' ')}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const noteToEdit = selectedNoteView;
                  setSelectedNoteView(null);
                  onOpenNoteModal(noteToEdit);
                }}
              >
                Edit Note
              </Button>
            </div>
          </div>
        </div>
      )}

      <EditSubjectModal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        subject={editingSubject}
      />
    </div>
  );
};
