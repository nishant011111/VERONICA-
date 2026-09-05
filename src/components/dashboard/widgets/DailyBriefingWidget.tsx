import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { Sparkles, ArrowRight, CheckCircle2, Clock, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { Button } from '../../ui/Button';

export const DailyBriefingWidget: React.FC = () => {
  const { profile, tasks, exams, vaultFiles, setActiveScreen } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayTasks = tasks.filter(t => t.date === todayStr && t.status !== 'completed');
  const upcomingExams = exams.filter(e => e.date >= todayStr).slice(0, 1);
  const recentDocs = vaultFiles.slice(0, 2);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden flex flex-col sm:flex-row gap-6 items-start sm:items-center w-full">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-900 opacity-20 rounded-full blur-3xl pointer-events-none" />

      <div className="flex-1 z-10 w-full">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <Sparkles className="w-4 h-4 text-indigo-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-100">Daily Briefing</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          {getGreeting()}, {profile.name.split(' ')[0] || 'Student'}.
        </h2>
        
        <div className="flex flex-wrap gap-4 mt-2">
          {todayTasks.length > 0 && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl py-2 px-4 backdrop-blur-sm border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span className="text-sm">{todayTasks.length} tasks due today</span>
            </div>
          )}
          
          {upcomingExams.length > 0 && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl py-2 px-4 backdrop-blur-sm border border-white/10">
              <CalendarIcon className="w-4 h-4 text-amber-300" />
              <span className="text-sm">{upcomingExams[0].name} approaching</span>
            </div>
          )}

          {recentDocs.length > 0 && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl py-2 px-4 backdrop-blur-sm border border-white/10">
              <FileText className="w-4 h-4 text-blue-300" />
              <span className="text-sm">{recentDocs.length} recent documents</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 z-10 w-full sm:w-auto shrink-0">
        <Button 
          variant="secondary" 
          className="bg-white text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto font-medium shadow-xl shadow-indigo-900/20"
          onClick={() => setActiveScreen('ask_veronica')}
          icon={<Sparkles className="w-4 h-4" />}
        >
          Ask Veronica
        </Button>
        <Button 
          variant="ghost" 
          className="text-indigo-100 hover:bg-white/10 w-full sm:w-auto"
          onClick={() => setDismissed(true)}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
};
