import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam, Subject } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { EditSubjectModal } from '../forms/EditSubjectModal';
import {
  GraduationCap,
  Plus,
  MapPin,
  Clock,
  BookOpen,
  Edit2,
  Trash2,
  Calendar,
  Edit3
} from 'lucide-react';

interface ExamsScreenProps {
  onOpenExamModal: (exam?: Exam | null) => void;
}

export const ExamsScreen: React.FC<ExamsScreenProps> = ({ onOpenExamModal }) => {
  const { exams, deleteExam, subjects } = useApp();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Update live countdown timer every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getSubject = (subjectId: string) => subjects.find((s) => s.id === subjectId);

  // Helper calculation for live exam countdown
  const getCountdown = (examDateStr: string, examTimeStr: string) => {
    const examDateTime = new Date(`${examDateStr}T${examTimeStr || '09:00'}:00`);
    const diffMs = examDateTime.getTime() - currentTime.getTime();

    if (diffMs <= 0) {
      return { expired: true, text: 'Exam in progress or completed' };
    }

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const seconds = Math.floor((diffMs / 1000) % 60);

    return {
      expired: false,
      days,
      hours,
      minutes,
      seconds,
    };
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Exams Schedule
            <Badge variant="rose">{exams.length} Scheduled</Badge>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track midterm & final exams with real-time countdowns and venue locations
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => onOpenExamModal(null)}
          icon={<Plus className="w-4 h-4" />}
        >
          Schedule Exam
        </Button>
      </div>

      {/* Empty State vs Exam List */}
      {exams.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="No exams added yet."
          description="Prepare ahead of time. Add your midterm and final exam dates to enable live countdowns."
          actionLabel="+ Schedule Exam"
          onAction={() => onOpenExamModal(null)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {exams.map((exam) => {
            const sub = getSubject(exam.subjectId);
            const countdown = getCountdown(exam.date, exam.time);

            return (
              <Card key={exam.id} glass className="space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-extrabold uppercase text-rose-500 tracking-wider">
                        {sub ? `${sub.name}${sub.code ? ` (${sub.code})` : ''}` : 'EXAM'}
                      </span>
                      {sub && (
                        <button
                          onClick={() => setEditingSubject(sub)}
                          className="text-slate-400 hover:text-rose-500 p-0.5"
                          title="Edit Subject Name"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {exam.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenExamModal(exam)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteExam(exam.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Live Countdown Box */}
                {!countdown.expired ? (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 grid grid-cols-4 gap-2 text-center">
                    <div>
                      <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 block">
                        {countdown.days}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Days</span>
                    </div>
                    <div>
                      <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 block">
                        {countdown.hours}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Hours</span>
                    </div>
                    <div>
                      <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 block">
                        {countdown.minutes}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Mins</span>
                    </div>
                    <div>
                      <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 block">
                        {countdown.seconds}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Secs</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 text-center font-medium">
                    {countdown.text}
                  </div>
                )}

                {/* Date & Location Info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" /> {exam.date} at {exam.time}
                  </span>
                  {exam.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" /> {exam.location}
                    </span>
                  )}
                </div>

                {/* Syllabus Notes */}
                {exam.syllabus && (
                  <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Syllabus Coverage:
                    </span>
                    <p className="text-slate-500 dark:text-slate-400">{exam.syllabus}</p>
                  </div>
                )}
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
