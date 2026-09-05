import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Assignment, AssignmentStatus, Subject } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { EditSubjectModal } from '../forms/EditSubjectModal';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Paperclip,
  Edit3
} from 'lucide-react';

interface AssignmentsScreenProps {
  onOpenAssignmentModal: (assignment?: Assignment | null) => void;
}

export const AssignmentsScreen: React.FC<AssignmentsScreenProps> = ({
  onOpenAssignmentModal,
}) => {
  const { assignments, updateAssignment, deleteAssignment, subjects } = useApp();

  const [statusTab, setStatusTab] = useState<string>('all');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  const filteredAssignments = assignments.filter((a) => {
    if (statusTab === 'all') return true;
    return a.status === statusTab;
  });

  const handleStatusChange = (assignmentId: string, newStatus: AssignmentStatus) => {
    updateAssignment(assignmentId, { status: newStatus });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Assignments Tracker
            <Badge variant="purple">{assignments.length} Total</Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track problem sets, lab reports, and term paper deadlines
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => onOpenAssignmentModal(null)}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Assignment
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Assignments' },
          { id: 'not_started', label: 'Not Started' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
          { id: 'overdue', label: 'Overdue' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusTab(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusTab === tab.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No assignments tracked."
          description="Keep track of coursework submissions and due dates."
          actionLabel="+ Add Assignment"
          onAction={() => onOpenAssignmentModal(null)}
        />
      ) : (
        <div className="space-y-3">
          {filteredAssignments.map((assignment) => {
            const sub = getSubject(assignment.subjectId);
            return (
              <Card key={assignment.id} glass className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-blue-500 flex items-center gap-1">
                        <span>{sub ? sub.name : 'General'}</span>
                        {sub && (
                          <button
                            onClick={() => setEditingSubject(sub)}
                            className="text-slate-400 hover:text-blue-500 p-0.5"
                            title="Edit Subject Name"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                      <Badge
                        variant={
                          assignment.priority === 'high'
                            ? 'rose'
                            : assignment.priority === 'medium'
                            ? 'amber'
                            : 'slate'
                        }
                      >
                        {assignment.priority} priority
                      </Badge>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {assignment.title}
                    </h3>

                    {assignment.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{assignment.description}</p>
                    )}
                  </div>

                  {/* Actions & Status selector */}
                  <div className="flex items-center gap-3">
                    <select
                      value={assignment.status}
                      onChange={(e) =>
                        handleStatusChange(assignment.id, e.target.value as AssignmentStatus)
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="overdue">Overdue</option>
                    </select>

                    <button
                      onClick={() => onOpenAssignmentModal(assignment)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAssignment(assignment.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-500" /> Due: {assignment.dueDate.replace('T', ' at ')}
                  </span>
                  {assignment.attachments.length > 0 && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Paperclip className="w-3.5 h-3.5" /> {assignment.attachments.length} attached
                    </span>
                  )}
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
