import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { EditSubjectModal } from '../forms/EditSubjectModal';
import {
  UserCheck,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Edit3
} from 'lucide-react';

interface AttendanceScreenProps {
  onOpenAttendanceModal: (subjectId?: string, record?: any) => void;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  onOpenAttendanceModal,
}) => {
  const { attendance, subjects, deleteAttendanceRecord } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'dashboard' | 'calendar'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Empty state check
  if (attendance.length === 0 && subjects.length === 0) {
    return (
      <EmptyState
        icon={<UserCheck className="w-8 h-8" />}
        title="No attendance records"
        description="Add a subject to begin tracking attendance and monitor minimum threshold criteria."
        actionLabel="+ Add Attendance"
        onAction={() => onOpenAttendanceModal()}
      />
    );
  }

  // Calculate subject-wise attendance statistics
  const subjectStats = subjects.map((sub) => {
    const subRecords = attendance.filter((a) => a.subjectId === sub.id);
    const total = subRecords.length;
    const present = subRecords.filter((a) => a.status === 'present' || a.status === 'late').length;
    const missed = subRecords.filter((a) => a.status === 'absent').length;
    const cancelled = subRecords.filter((a) => a.status === 'cancelled').length;
    const effectiveTotal = total - cancelled;

    const percentage =
      effectiveTotal > 0 ? Math.round((present / effectiveTotal) * 100) : null;

    const targetPct = sub.targetPercentage || 75;

    let requiredClassesToTarget = 0;
    if (percentage !== null && percentage < targetPct) {
      const numerator = (targetPct * effectiveTotal - 100 * present);
      const denominator = (100 - targetPct);
      requiredClassesToTarget = Math.max(0, Math.ceil(numerator / (denominator || 1)));
    }

    return {
      subject: sub,
      records: subRecords,
      total,
      present,
      missed,
      cancelled,
      percentage,
      targetPct,
      requiredClassesToTarget,
    };
  });

  // Filter history records for dashboard
  const filteredRecords = attendance.filter((rec) => {
    if (selectedSubjectFilter !== 'all' && rec.subjectId !== selectedSubjectFilter) {
      return false;
    }
    return true;
  });

  // Calendar logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Attendance Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track classes attended, missed, and target criteria
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
          </div>
          <Button
            variant="primary"
            onClick={() => onOpenAttendanceModal()}
            icon={<Plus className="w-4 h-4" />}
          >
            Mark
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <Card glass className="p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {monthNames[month]} {year}
            </h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Subjects</option>
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
                  className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition-colors"
                  title="Edit Subject Name"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              <button onClick={handlePrevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={handleNextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-[10px] font-bold uppercase text-slate-400 pb-2">
                {d}
              </div>
            ))}
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-24 rounded-2xl bg-transparent" />;
              }
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              const dayRecords = attendance.filter((rec) => {
                if (rec.date !== dateStr) return false;
                if (selectedSubjectFilter !== 'all' && rec.subjectId !== selectedSubjectFilter) return false;
                return true;
              });

              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-24 p-1 sm:p-2 rounded-2xl border ${
                    isToday
                      ? 'border-blue-500/50 bg-blue-500/5 dark:bg-blue-500/10'
                      : 'border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50'
                  } flex flex-col`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {day}
                    </span>
                    <button 
                      onClick={() => onOpenAttendanceModal(selectedSubjectFilter !== 'all' ? selectedSubjectFilter : undefined, { date: dateStr })}
                      className="opacity-0 hover:opacity-100 text-slate-400 hover:text-blue-500 transition-opacity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-1 overflow-y-auto">
                    {dayRecords.map(rec => {
                      const sub = subjects.find(s => s.id === rec.subjectId);
                      const color = sub?.color || '#3b82f6';
                      let statusIcon = null;
                      let bgClass = '';
                      if (rec.status === 'present') { bgClass = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'; }
                      if (rec.status === 'absent') { bgClass = 'bg-rose-500/10 text-rose-700 dark:text-rose-400'; }
                      if (rec.status === 'late') { bgClass = 'bg-amber-500/10 text-amber-700 dark:text-amber-400'; }
                      if (rec.status === 'cancelled') { bgClass = 'bg-slate-500/10 text-slate-700 dark:text-slate-400'; }

                      return (
                        <div
                          key={rec.id}
                          className={`group text-[10px] sm:text-xs px-1.5 py-1 rounded flex items-center justify-between cursor-pointer ${bgClass}`}
                          onClick={() => onOpenAttendanceModal(rec.subjectId, rec)}
                          title={`${sub?.name}: ${rec.status} ${rec.notes ? `(${rec.notes})` : ''}`}
                        >
                          <div className="flex items-center gap-1 overflow-hidden">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                            <span className="truncate font-semibold">{sub?.code || sub?.name}</span>
                          </div>
                          <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                            <Edit2 className="w-3 h-3 opacity-70 hover:opacity-100" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <>
          {/* Subject Wise Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectStats.map(({ subject, present, missed, total, percentage, targetPct, requiredClassesToTarget }) => (
              <Card key={subject.id} glass className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: subject.color || '#3b82f6' }}
                    />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {subject.name}
                    </h4>
                    <button
                      onClick={() => setEditingSubject(subject)}
                      className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
                      title="Edit Subject Name"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenAttendanceModal(subject.id)}
                  >
                    + Log
                  </Button>
                </div>

                {/* Percentage Display */}
                {percentage === null ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No attendance data logged yet for {subject.name}.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-2xl font-extrabold ${
                          percentage >= targetPct
                            ? 'text-emerald-500'
                            : 'text-rose-500'
                        }`}
                      >
                        {percentage}%
                      </span>
                      <span className="text-xs text-slate-500">
                        Target: {targetPct}%
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          percentage >= targetPct ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Attended: <strong className="text-emerald-500">{present}</strong></span>
                      <span>Missed: <strong className="text-rose-500">{missed}</strong></span>
                      <span>Total: <strong>{total}</strong></span>
                    </div>

                    {/* Required classes alert if below target */}
                    {percentage < targetPct && requiredClassesToTarget > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-2 mt-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>
                          Must attend next <strong>{requiredClassesToTarget}</strong> classes to reach {targetPct}% threshold!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Attendance History Section */}
          <div className="space-y-3 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Attendance History Log ({filteredRecords.length})
              </h3>

              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="all">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {filteredRecords.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="w-6 h-6" />}
                title="No history records"
                description="Log class lectures to populate attendance history."
                actionLabel="+ Mark Attendance"
                onAction={() => onOpenAttendanceModal()}
              />
            ) : (
              <div className="space-y-2">
                {filteredRecords.map((rec) => {
                  const sub = subjects.find((s) => s.id === rec.subjectId);
                  return (
                    <div
                      key={rec.id}
                      className="glass-panel p-3.5 rounded-2xl flex items-center justify-between gap-3 border border-slate-200/80 dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        {rec.status === 'present' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {rec.status === 'absent' && <XCircle className="w-5 h-5 text-rose-500" />}
                        {rec.status === 'late' && <Clock className="w-5 h-5 text-amber-500" />}
                        {rec.status === 'cancelled' && <Clock className="w-5 h-5 text-slate-400" />}

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {sub ? sub.name : 'Unknown Subject'}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Date: {rec.date} {rec.notes ? `• ${rec.notes}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            rec.status === 'present'
                              ? 'emerald'
                              : rec.status === 'absent'
                              ? 'rose'
                              : rec.status === 'late'
                              ? 'amber'
                              : 'slate'
                          }
                        >
                          {(rec.status || 'present').toUpperCase()}
                        </Badge>
                        
                        <div className="flex gap-1">
                          <button
                            onClick={() => onOpenAttendanceModal(rec.subjectId, rec)}
                            className="text-slate-400 hover:text-blue-500 p-1"
                            title="Edit entry"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAttendanceRecord(rec.id)}
                            className="text-slate-400 hover:text-rose-500 p-1"
                            title="Delete entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <EditSubjectModal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        subject={editingSubject}
      />
    </div>
  );
};
