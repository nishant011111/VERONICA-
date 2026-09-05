import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyEngine } from '../../services/study/StudyEngine';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Sparkles, BrainCircuit, Plus } from 'lucide-react';

export const NextBestSession: React.FC = () => {
  const context = useApp();
  const { subjects, setActiveScreen } = context;

  const nextSession = useMemo(() => {
    // Provide available time from settings or default
    return StudyEngine.getNextBestSession({ ...context, userId: context.profile.id }, context.settings.planner.maxDailyStudyTime || 60);
  }, [context]);

  if (!nextSession) {
    return (
      <Card glass className="mb-6 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-900/10 dark:to-slate-900/50 border-indigo-100 dark:border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4">
          <div>
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4" /> Next Best Action
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Add your subjects and goals to get personalized study recommendations.
            </p>
          </div>
          <Button onClick={() => setActiveScreen('subjects')} variant="primary" className="whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" /> Add Subject
          </Button>
        </div>
      </Card>
    );
  }

  const handleStart = () => {
    // You could set active subject or topic in context before navigating
    setActiveScreen('study_timer');
  };

  return (
    <Card glass className="mb-6 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-500/30">
      <div className="p-6">
        <h3 className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-1 mb-4">
          <Sparkles className="w-3 h-3" /> WHAT SHOULD I STUDY NOW?
        </h3>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-1">
              {nextSession.subjectId ? subjects.find(s => s.id === nextSession.subjectId)?.name : ''}
            </h2>
            <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-3">
              {nextSession.topicTitle}
            </p>
            
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="bg-white/60 dark:bg-black/40 px-2.5 py-1 rounded-lg text-slate-700 dark:text-slate-300">
                {nextSession.durationMinutes} min
              </span>
              <span className={`px-2.5 py-1 rounded-lg ${nextSession.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                {nextSession.priority.toUpperCase()} PRIORITY
              </span>
              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-lg capitalize">
                {nextSession.type}
              </span>
            </div>
            
            <p className="mt-4 text-xs text-slate-600 dark:text-slate-400 max-w-lg border-l-2 border-indigo-200 dark:border-indigo-800 pl-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Why:</span> {nextSession.reason}
            </p>
          </div>
          
          <Button onClick={handleStart} variant="primary" size="lg" className="w-full sm:w-auto shadow-lg shadow-indigo-500/25">
            Start Session
          </Button>
        </div>
      </div>
    </Card>
  );
};
