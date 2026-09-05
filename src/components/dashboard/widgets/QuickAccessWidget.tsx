import React from 'react';
import { useApp } from '../../../context/AppContext';
import { FileText, BookOpen, GraduationCap, Compass } from 'lucide-react';

export const QuickAccessWidget: React.FC = () => {
  const { exams, setActiveScreen } = useApp();
  
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingExams = exams.filter((e) => e.date >= todayStr);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] h-8 flex items-center">
        Quick Access
      </h3>
      <div className="grid grid-cols-2 gap-4 flex-1">
        <div
          onClick={() => setActiveScreen('notes')}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all cursor-pointer"
        >
          <div>
            <div className="w-8 h-8 bg-amber-500/10 text-amber-500 rounded flex items-center justify-center mb-4">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-medium text-sm">Create Note</h4>
          </div>
          <p className="text-slate-500 dark:text-gray-600 text-xs mt-3">Knowledge vault & markdown</p>
        </div>

        <div
          onClick={() => setActiveScreen('vault')}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all cursor-pointer"
        >
          <div>
            <div className="w-8 h-8 bg-emerald-500/10 text-emerald-500 rounded flex items-center justify-center mb-4">
              <BookOpen className="w-4 h-4" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-medium text-sm">Open Vault</h4>
          </div>
          <p className="text-slate-500 dark:text-gray-600 text-xs mt-3">PDFs & files</p>
        </div>

        <div
          onClick={() => setActiveScreen('exams')}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all cursor-pointer"
        >
          <div>
            <div className="w-8 h-8 bg-rose-500/10 text-rose-500 rounded flex items-center justify-center mb-4">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-medium text-sm">Exams</h4>
          </div>
          <p className="text-slate-500 dark:text-gray-600 text-xs mt-3">{upcomingExams.length} upcoming exams</p>
        </div>

        <div
          onClick={() => setActiveScreen('analytics')}
          className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/40 transition-all cursor-pointer"
        >
          <div>
            <div className="w-8 h-8 bg-indigo-500/10 text-indigo-400 rounded flex items-center justify-center mb-4">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="text-slate-900 dark:text-white font-medium text-sm">Analytics</h4>
          </div>
          <p className="text-slate-500 dark:text-gray-600 text-xs mt-3">Study metrics</p>
        </div>
      </div>
    </div>
  );
};
