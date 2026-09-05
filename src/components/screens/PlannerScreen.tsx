import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, StudySession, Subject } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { CalendarCheck, Plus, CheckCircle2, Clock, Trash2, Edit2, Calendar as CalendarIcon, Filter, Tag, BrainCircuit, Play, AlertCircle, Edit3 } from 'lucide-react';
import { StudyEngine } from '../../services/study/StudyEngine';
import { AIPlanModal } from '../planner/AIPlanModal';
import { EditSubjectModal } from '../forms/EditSubjectModal';

interface PlannerScreenProps {
  onOpenTaskModal: (task?: Task | null) => void;
}

export const PlannerScreen: React.FC<PlannerScreenProps> = ({ onOpenTaskModal }) => {
  const context = useApp();
  const { tasks, toggleTaskStatus, deleteTask, subjects, searchQuery, studySessions, exams, assignments } = context;
  
  const [viewTab, setViewTab] = useState<'today' | 'week' | 'month'>('today');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [showAiModal, setShowAiModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const todayIso = new Date().toISOString().split('T')[0];

  // Helper date logic for week/month filtering
  const isDateInThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);
    return d >= firstDay && d <= lastDay;
  };

  const isDateInThisMonth = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const filteredItems = useMemo(() => {
    const combined: any[] = [];
    
    // Add tasks
    tasks.forEach(t => combined.push({ type: 'task', date: t.date, item: t }));
    // Add sessions
    studySessions.forEach(s => combined.push({ type: 'session', date: s.startTime?.split('T')[0] || s.createdAt.split('T')[0], item: s }));
    // Add exams
    exams.forEach(e => combined.push({ type: 'exam', date: e.date, item: e }));
    // Add assignments
    assignments.forEach(a => combined.push({ type: 'assignment', date: a.dueDate.split('T')[0], item: a }));
    
    let result = combined.filter((entry) => {
      // Date filter
      if (viewTab === 'today' && entry.date !== todayIso) return false;
      if (viewTab === 'week' && !isDateInThisWeek(entry.date)) return false;
      if (viewTab === 'month' && !isDateInThisMonth(entry.date)) return false;

      // Subject filter
      if (filterSubject !== 'all' && entry.item.subjectId !== filterSubject) return false;

      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const title = entry.item.title || entry.item.name || entry.item.topic || '';
        if (!title.toLowerCase().includes(q)) return false;
      }

      return true;
    });

    // Sort by date/time
    return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [tasks, studySessions, exams, assignments, viewTab, filterSubject, searchQuery, todayIso]);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button onClick={() => setViewTab('today')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewTab === 'today' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`}>Today</button>
          <button onClick={() => setViewTab('week')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewTab === 'week' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`}>This Week</button>
          <button onClick={() => setViewTab('month')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewTab === 'month' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`}>This Month</button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowAiModal(true)} icon={<BrainCircuit className="w-4 h-4" />}>
            Create Plan
          </Button>
          <Button variant="primary" onClick={() => onOpenTaskModal(null)} icon={<Plus className="w-4 h-4" />}>
            New Task
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Filter className="w-3.5 h-3.5" />
          <span>FILTER:</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-indigo-500/50 outline-none font-medium"
          >
            <option value="all">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
          {filterSubject !== 'all' && (
            <button
              onClick={() => {
                const sub = subjects.find(s => s.id === filterSubject);
                if (sub) setEditingSubject(sub);
              }}
              className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-colors"
              title="Edit Subject Name"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<CalendarCheck className="w-12 h-12 text-indigo-400" />}
          title="Your study plan is empty."
          description="Add your subjects, exams and goals to let Veronica create a plan."
          actionLabel="Add Task"
          onAction={() => onOpenTaskModal(null)}
        />
      ) : (
        <div className="space-y-4">
          {filteredItems.map((entry, idx) => {
            if (entry.type === 'task') {
              const task = entry.item as Task;
              const isDone = task.status === 'completed';
              return (
                <Card key={`task-${task.id}`} glass className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${isDone ? 'opacity-65' : 'hover:border-indigo-500/40'}`}>
                  <div className="flex items-start gap-3.5">
                    <button onClick={() => toggleTaskStatus(task.id)} className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isDone ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 hover:border-indigo-500'}`}>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="slate" size="sm">Task</Badge>
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400">
                        {task.date && <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {task.date}</span>}
                        {task.subjectId && (() => {
                          const sub = subjects.find(s => s.id === task.subjectId);
                          return (
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {sub?.name || 'Subject'}
                              {sub && (
                                <button
                                  onClick={() => setEditingSubject(sub)}
                                  className="text-slate-400 hover:text-indigo-500 p-0.5"
                                  title="Edit Subject Name"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            }
            if (entry.type === 'session') {
              const session = entry.item as StudySession;
              const isDone = session.status === 'completed';
              const isMissed = session.status === 'missed';
              return (
                <Card key={`session-${session.id}`} glass className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${isDone ? 'opacity-65' : ''} ${isMissed ? 'border-rose-500/30 bg-rose-50/10 dark:bg-rose-900/10' : ''}`}>
                   <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 w-5 h-5 flex items-center justify-center">
                      <Clock className={`w-4 h-4 ${isDone ? 'text-emerald-500' : (isMissed ? 'text-rose-500' : 'text-indigo-500')}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="indigo" size="sm">Study Session</Badge>
                        {isMissed && <Badge variant="rose" size="sm">Missed</Badge>}
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                           {subjects.find(s => s.id === session.subjectId)?.name || 'Study'} — {session.topic || 'General'}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.startTime ? session.startTime.split('T')[1]?.substring(0,5) : 'Anytime'} • {session.plannedDuration} min</span>
                      </div>
                    </div>
                  </div>
                  {!isDone && (
                    <div className="flex items-center gap-2">
                      <Button variant="primary" size="sm" onClick={() => context.setActiveScreen('study_timer')} icon={<Play className="w-3 h-3" />}>Start</Button>
                    </div>
                  )}
                </Card>
              );
            }
            if (entry.type === 'exam') {
              const exam = entry.item;
              return (
                <Card key={`exam-${exam.id}`} glass className="border-amber-500/30 bg-amber-50/10 dark:bg-amber-900/10">
                   <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 w-5 h-5 flex items-center justify-center text-amber-500">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="amber" size="sm">EXAM</Badge>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exam.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400">
                        <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {exam.date} • {exam.time}</span>
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {subjects.find(s => s.id === exam.subjectId)?.name}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            }
            return null;
          })}
        </div>
      )}

      {showAiModal && <AIPlanModal onClose={() => setShowAiModal(false)} />}

      <EditSubjectModal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        subject={editingSubject}
      />
    </div>
  );
};
