import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  User,
  CheckCircle2,
  BarChart3,
  Award,
  ListTodo
} from 'lucide-react';

interface SubjectsScreenProps {
  onOpenSubjectModal: (subject?: Subject | null) => void;
}

export const SubjectsScreen: React.FC<SubjectsScreenProps> = ({ onOpenSubjectModal }) => {
  const { subjects, deleteSubject, updateSubject } = useApp();

  const handleToggleSyllabusTopic = (subjectId: string, topicId: string) => {
    const sub = subjects.find((s) => s.id === subjectId);
    if (!sub) return;
    const nextSyllabus = sub.syllabus.map((t) =>
      t.id === topicId ? { ...t, completed: !t.completed } : t
    );
    updateSubject(subjectId, { syllabus: nextSyllabus });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Course Subjects
            <Badge variant="blue">{subjects.length} Enrolled</Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage course syllabi, faculty, credits, and target percentages
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => onOpenSubjectModal(null)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Subject
        </Button>
      </div>

      {/* Empty State vs Subjects Grid */}
      {subjects.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No subjects yet"
          description="Add your first subject to start building your academic workspace."
          actionLabel="+ Add Subject"
          onAction={() => onOpenSubjectModal(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const completedTopics = sub.syllabus.filter((t) => t.completed).length;
            const totalTopics = sub.syllabus.length;
            const syllabusProgress =
              totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

            return (
              <Card key={sub.id} glass className="flex flex-col justify-between space-y-4">
                <div>
                  {/* Card Header with Color Icon */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-md"
                        style={{ backgroundColor: sub.color || '#3b82f6' }}
                      >
                        {sub.code ? sub.code.slice(0, 3) : <BookOpen className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                          {sub.code || 'NO CODE'}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                          {sub.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenSubjectModal(sub)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSubject(sub.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    <Badge variant="blue">{sub.credits} Credits</Badge>
                    <Badge variant="slate">{sub.semester || 'Current Semester'}</Badge>
                    <Badge variant={sub.priority === 'high' ? 'rose' : 'amber'}>
                      {sub.priority} priority
                    </Badge>
                  </div>

                  {/* Instructor */}
                  {sub.teacher && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Faculty: {sub.teacher}</span>
                    </p>
                  )}

                  {sub.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                      {sub.description}
                    </p>
                  )}

                  {/* Syllabus Progress */}
                  {totalTopics > 0 && (
                    <div className="space-y-1.5 border-t border-slate-200 dark:border-slate-800 pt-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <ListTodo className="w-3.5 h-3.5 text-blue-500" /> Syllabus
                        </span>
                        <span className="font-bold text-slate-500">
                          {completedTopics}/{totalTopics} ({syllabusProgress}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${syllabusProgress}%` }}
                        />
                      </div>

                      {/* Interactive topic checkboxes */}
                      <div className="space-y-1 pt-1 max-h-28 overflow-y-auto">
                        {sub.syllabus.map((topic) => (
                          <div
                            key={topic.id}
                            onClick={() => handleToggleSyllabusTopic(sub.id, topic.id)}
                            className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-500 cursor-pointer p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/60"
                          >
                            <input
                              type="checkbox"
                              checked={topic.completed}
                              onChange={() => {}}
                              className="w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className={topic.completed ? 'line-through opacity-60' : ''}>
                              {topic.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Target */}
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200 dark:border-slate-800 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Target Attendance:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {sub.targetPercentage || 75}%
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
