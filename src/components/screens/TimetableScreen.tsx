import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject, TimetableSlot } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { EditSubjectModal } from '../forms/EditSubjectModal';
import { ImportTimetableModal } from '../forms/ImportTimetableModal';
import { ImageIcon } from 'lucide-react';
import {
  Clock,
  Plus,
  MapPin,
  User,
  Edit2,
  Trash2,
  Calendar,
  Edit3
} from 'lucide-react';

interface TimetableScreenProps {
  onOpenTimetableModal: (slot?: TimetableSlot | null, defaultDay?: number) => void;
}

export const TimetableScreen: React.FC<TimetableScreenProps> = ({
  onOpenTimetableModal,
}) => {
  const { timetable, subjects, deleteTimetableSlot } = useApp();

  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay() || 7);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const days = [
    { value: 1, label: 'Mon', fullLabel: 'Monday' },
    { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
    { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
    { value: 4, label: 'Thu', fullLabel: 'Thursday' },
    { value: 5, label: 'Fri', fullLabel: 'Friday' },
    { value: 6, label: 'Sat', fullLabel: 'Saturday' },
    { value: 7, label: 'Sun', fullLabel: 'Sunday' },
  ];

  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'day'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Day View
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'week'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Week View
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsImportModalOpen(true)}
            icon={<ImageIcon className="w-4 h-4 text-blue-500" />}
            className="text-xs font-bold"
          >
            Import
          </Button>
          <Button
            variant="primary"
            onClick={() => onOpenTimetableModal(null, selectedDay)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Class
          </Button>
        </div>
      </div>

      {/* Day Selector Tabs if in Day Mode */}
      {viewMode === 'day' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {days.map((d) => (
            <button
              key={d.value}
              onClick={() => setSelectedDay(d.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedDay === d.value
                  ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {d.fullLabel}
            </button>
          ))}
        </div>
      )}

      {/* Empty State vs Schedule Grid */}
      {timetable.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="No classes in timetable"
          description="Build your weekly lecture, lab, and seminar schedule."
          actionLabel="+ Add Class Slot"
          onAction={() => onOpenTimetableModal(null, selectedDay)}
        />
      ) : viewMode === 'day' ? (
        // Day View
        <div className="space-y-3 max-w-3xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {days.find((d) => d.value === selectedDay)?.fullLabel} Schedule
          </h3>

          {timetable.filter((s) => s.dayOfWeek === selectedDay).length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center glass-panel rounded-2xl">
              No classes scheduled for {days.find((d) => d.value === selectedDay)?.fullLabel}.
            </p>
          ) : (
            timetable
              .filter((s) => s.dayOfWeek === selectedDay)
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map((slot) => {
                const sub = getSubject(slot.subjectId);
                return (
                  <Card key={slot.id} glass className="flex items-center justify-between p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-center px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                        <span className="text-xs font-bold block">{slot.startTime}</span>
                        <span className="text-[10px] opacity-80">{slot.endTime}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>{sub ? sub.name : 'Class Slot'}</span>
                            {sub && (
                              <button
                                onClick={() => setEditingSubject(sub)}
                                className="p-0.5 rounded text-slate-400 hover:text-blue-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Subject Name"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </h4>
                          <Badge variant="blue">{slot.type}</Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          {slot.room && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" /> {slot.room}
                            </span>
                          )}
                          {slot.teacher && (
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" /> {slot.teacher}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenTimetableModal(slot)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTimetableSlot(slot.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </Card>
                );
              })
          )}
        </div>
      ) : (
        // Week View Grid
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {days.map((day) => {
            const daySlots = timetable
              .filter((s) => s.dayOfWeek === day.value)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day.value}
                className="glass-panel p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col space-y-2 min-h-[220px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {day.fullLabel}
                  </span>
                  <button
                    onClick={() => onOpenTimetableModal(null, day.value)}
                    className="p-1 text-slate-400 hover:text-blue-500"
                    title={`Add class to ${day.fullLabel}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {daySlots.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic text-center my-auto">Free day</p>
                ) : (
                  <div className="space-y-2 flex-1">
                    {daySlots.map((slot) => {
                      const sub = getSubject(slot.subjectId);
                      return (
                        <div
                          key={slot.id}
                          className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-1 group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                            <span>{slot.startTime}</span>
                            <span className="uppercase text-blue-500">{slot.type}</span>
                          </div>

                          <div className="flex items-center justify-between gap-1">
                            <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">
                              {sub ? sub.name : 'Class'}
                            </h5>
                            {sub && (
                              <button
                                onClick={() => setEditingSubject(sub)}
                                className="text-slate-400 hover:text-blue-500 shrink-0 p-0.5"
                                title="Edit Subject Name"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          {slot.room && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {slot.room}
                            </p>
                          )}

                          <div className="flex items-center justify-end gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onOpenTimetableModal(slot)}
                              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[10px]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteTimetableSlot(slot.id)}
                              className="text-slate-400 hover:text-rose-500 text-[10px]"
                            >
                              Del
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <EditSubjectModal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        subject={editingSubject}
      />
      <ImportTimetableModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
