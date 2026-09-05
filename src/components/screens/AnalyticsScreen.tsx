import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { EditSubjectModal } from '../forms/EditSubjectModal';
import { generateAcademicPDFReport } from '../../utils/pdfGenerator';
import {
  BarChart3,
  Clock,
  Flame,
  CalendarCheck,
  UserCheck,
  BookOpen,
  PieChart,
  Award,
  Edit3,
  Download,
  FileText,
  Loader2,
} from 'lucide-react';

export const AnalyticsScreen: React.FC = () => {
  const { studySessions, tasks, attendance, subjects, goals, profile, showToast, vaultFiles, activityTimeline } = useApp();
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true);
      showToast('Generating Academic Performance PDF Report with Charts...', 'info');
      await generateAcademicPDFReport({
        profile,
        subjects,
        tasks,
        attendanceRecords: attendance,
        studySessions,
        goals,
      });
      showToast('Academic PDF Report generated and downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF Export Error:', err);
      showToast('Failed to generate PDF report. Please try again.', 'error');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Calculate real analytics strictly from user's data (NO DEMO DATA)
  const totalCompletedSessions = studySessions.filter((s) => s.status === 'completed');
  const totalStudyMinutes = totalCompletedSessions.reduce((sum, s) => sum + (s.actualDuration || s.plannedDuration || 0), 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  // Subject-wise study duration breakdown
  const subjectDistribution = subjects.map((sub) => {
    const subSessions = totalCompletedSessions.filter((s) => s.subjectId === sub.id);
    const subMins = subSessions.reduce((sum, s) => sum + (s.actualDuration || s.plannedDuration || 0), 0);
    return {
      subject: sub,
      minutes: subMins,
      percentage: totalStudyMinutes > 0 ? Math.round((subMins / totalStudyMinutes) * 100) : 0,
    };
  });

  // Tasks metric
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'completed').length;
  
  const totalStorageBytes = vaultFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const storageUsageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);
  const documentCount = vaultFiles.length;
  const taskCompletionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Attendance metric
  const totalAttendance = attendance.length;
  const presentAttendance = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendanceAvgPct = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;

  // Streak days
  const calculateStreak = () => {
    if (totalCompletedSessions.length === 0) return 0;
    const dates = Array.from(
      new Set(totalCompletedSessions.map((s) => s.createdAt.split('T')[0]))
    ).sort().reverse();

    if (dates.length === 0) return 0;
    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (dates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        if (i === 0) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
    }
    return streak;
  };

  const streakDays = calculateStreak();

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Academic Performance Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time metrics computed directly from your focus logs and course records
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="blue">Local Telemetry Engine</Badge>
          <Button
            variant="primary"
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            icon={isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            className="py-2.5 px-4 font-bold text-xs shadow-lg shadow-indigo-600/20"
          >
            {isExportingPDF ? 'Generating Report...' : 'Export Analytics PDF'}
          </Button>
        </div>
      </div>

      {/* Empty State check if no study records exist */}
      {studySessions.length === 0 && tasks.length === 0 && attendance.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="w-8 h-8" />}
          title="No study data yet."
          description="Complete your first study session to start seeing analytics."
        />
      ) : (
        <>
          {/* Key Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card glass>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Total Study Time</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {totalStudyHours} <span className="text-xs font-normal text-slate-500">hrs</span>
              </p>
            </Card>

            <Card glass>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Study Streak</span>
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {streakDays} <span className="text-xs font-normal text-slate-500">days</span>
              </p>
            </Card>

            <Card glass>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Task Completion</span>
                <CalendarCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {taskCompletionPct}%
              </p>
            </Card>

            <Card glass>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500">Attendance Avg</span>
                <UserCheck className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {attendanceAvgPct}%
              </p>
            </Card>
          </div>

          {/* Subject Distribution */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Subject Focus Distribution
            </h3>

            {subjects.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4">No subjects added to compute distribution.</p>
            ) : (
              <div className="space-y-3">
                {subjectDistribution.map(({ subject, minutes, percentage }) => (
                  <Card key={subject.id} glass className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color || '#3b82f6' }}
                        />
                        {subject.name}
                        <button
                          onClick={() => setEditingSubject(subject)}
                          className="text-slate-400 hover:text-blue-500 p-0.5"
                          title="Edit Subject Name"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </span>
                      <span className="font-semibold text-slate-500">
                        {minutes} mins ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: subject.color || '#3b82f6',
                        }}
                      />
                    </div>
                  </Card>
                ))}
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
