import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Goal, Subject } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { EditSubjectModal } from '../forms/EditSubjectModal';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Edit2,
  Trash2,
  TrendingUp,
  Edit3
} from 'lucide-react';

interface GoalsScreenProps {
  onOpenGoalModal: (goal?: Goal | null) => void;
}

export const GoalsScreen: React.FC<GoalsScreenProps> = ({ onOpenGoalModal }) => {
  const { goals, updateGoal, deleteGoal, subjects } = useApp();
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const getSubject = (subjectId?: string) => subjects.find((s) => s.id === subjectId);

  const handleIncrementProgress = (goal: Goal) => {
    const nextVal = goal.currentValue + 1;
    updateGoal(goal.id, {
      currentValue: nextVal,
      completed: nextVal >= goal.targetValue,
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Academic Goals & Targets
            <Badge variant="indigo">{goals.length} Active</Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Quantitative study targets, grade objectives, and semester milestones
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => onOpenGoalModal(null)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Goal
        </Button>
      </div>

      {/* Empty State vs Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          icon={<Target className="w-8 h-8" />}
          title="No academic goals set."
          description="Define measurable targets for study hours, subject grades, or exam outcomes."
          actionLabel="+ Create Goal"
          onAction={() => onOpenGoalModal(null)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const sub = getSubject(goal.subjectId);
            const pct = Math.min(
              100,
              Math.round((goal.currentValue / (goal.targetValue || 1)) * 100)
            );
            const isFinished = goal.completed || pct >= 100;

            return (
              <Card key={goal.id} glass className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase text-cyan-500">
                      {goal.type.replace('_', ' ')}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {goal.title}
                    </h3>
                    {sub && (
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <span>Subject: {sub.name}</span>
                        <button
                          onClick={() => setEditingSubject(sub)}
                          className="text-slate-400 hover:text-cyan-500 p-0.5"
                          title="Edit Subject Name"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenGoalModal(goal)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                      {goal.currentValue} / {goal.targetValue}{' '}
                      <span className="text-xs font-normal text-slate-500">{goal.unit}</span>
                    </span>
                    <span
                      className={`font-bold ${
                        isFinished ? 'text-emerald-500' : 'text-cyan-500'
                      }`}
                    >
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isFinished ? 'bg-emerald-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Controls & Deadline */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-800">
                  {goal.deadline ? (
                    <span className="flex items-center gap-1 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" /> Deadline: {goal.deadline}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">No deadline set</span>
                  )}

                  <Button
                    size="sm"
                    variant={isFinished ? 'ghost' : 'outline'}
                    onClick={() => handleIncrementProgress(goal)}
                    icon={<TrendingUp className="w-3.5 h-3.5 text-cyan-500" />}
                  >
                    +1 {goal.unit}
                  </Button>
                </div>
              </Card>
            );
          })}
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
