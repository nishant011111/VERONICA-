import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Clock, Target, CalendarCheck, Flame } from 'lucide-react';
import { StudyEngine } from '../../../services/study/StudyEngine';

export const OverviewMetricsWidget: React.FC = () => {
  const { studySessions, goals, tasks, setActiveScreen } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.date === todayStr);

  const todaySessions = studySessions.filter((s) => s.startTime?.startsWith(todayStr) && s.status === 'completed');
  const totalTodayMinutes = todaySessions.reduce((acc, curr) => acc + (curr.actualDuration || 0), 0);

  const streakDays = // @ts-ignore
    StudyEngine.calculateStreak(studySessions);

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
          Overview Metrics
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
        <div
          onClick={() => setActiveScreen('study_timer')}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] p-5 rounded-2xl hover:border-indigo-500/40 transition-all cursor-pointer h-full flex flex-col"
        >
          <div className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-1 flex items-center justify-between">
            <span>Study Time</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-medium text-slate-900 dark:text-white flex-1 flex items-center">
            {formatStudyTime(totalTodayMinutes)}
          </div>
          <div className="text-gray-500 text-xs mt-2">
            {totalTodayMinutes > 0 ? 'Logged today' : 'No sessions yet'}
          </div>
        </div>

        <div
          onClick={() => setActiveScreen('goals')}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] p-5 rounded-2xl hover:border-indigo-500/40 transition-all cursor-pointer h-full flex flex-col"
        >
          <div className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-1 flex items-center justify-between">
            <span>Today's Target</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-medium text-slate-900 dark:text-white flex-1 flex items-center">
            {goals.length > 0 ? `${goals[0].currentValue}/${goals[0].targetValue} ${goals[0].unit}` : '--'}
          </div>
          <div className="text-gray-500 text-xs mt-2 truncate">
            {goals.length > 0 ? goals[0].title : 'Set a study goal'}
          </div>
        </div>

        <div
          onClick={() => setActiveScreen('planner')}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] p-5 rounded-2xl hover:border-indigo-500/40 transition-all cursor-pointer h-full flex flex-col"
        >
          <div className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-1 flex items-center justify-between">
            <span>Tasks</span>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-medium text-slate-900 dark:text-white flex-1 flex items-center">
            {todayTasks.length}
          </div>
          <div className="text-gray-500 text-xs mt-2">
            {todayTasks.length > 0
              ? `${todayTasks.filter((t) => t.status === 'completed').length} completed`
              : 'No active tasks'}
          </div>
        </div>

        <div
          onClick={() => setActiveScreen('analytics')}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] p-5 rounded-2xl hover:border-indigo-500/40 transition-all cursor-pointer h-full flex flex-col"
        >
          <div className="text-gray-500 text-[11px] font-bold uppercase tracking-widest mb-1 flex items-center justify-between">
            <span>Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-medium text-slate-900 dark:text-white flex-1 flex items-center">
            {streakDays} Days
          </div>
          <div className="text-gray-500 text-xs mt-2">
            {streakDays > 0 ? 'Active fire' : 'Start today'}
          </div>
        </div>
      </div>
    </div>
  );
};
