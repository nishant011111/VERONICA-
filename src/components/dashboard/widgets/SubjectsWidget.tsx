import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { BookOpen, ArrowRight } from 'lucide-react';

export const SubjectsWidget: React.FC = () => {
  const { subjects, setActiveScreen } = useApp();

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
          Subjects Workspace
        </h3>
        <Button size="sm" variant="ghost" onClick={() => setActiveScreen('subjects')} icon={<ArrowRight className="w-3.5 h-3.5" />}>
          Manage Subjects
        </Button>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
          <BookOpen className="w-8 h-8 text-slate-400 dark:text-gray-600 mb-3" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">No subjects added yet</h4>
          <p className="text-xs text-slate-500 dark:text-gray-500 mt-1 max-w-sm">
            Add your subjects to manage syllabi, credit hours, and faculty info.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              onClick={() => setActiveScreen('subjects')}
              className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] p-5 rounded-2xl hover:border-indigo-500/40 transition-all cursor-pointer h-full flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: sub.color || '#4f46e5' }}
                >
                  {sub.code ? sub.code.slice(0, 3) : <BookOpen className="w-4 h-4" />}
                </div>
                <Badge variant="indigo">{sub.credits} Credits</Badge>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{sub.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex-1">{sub.teacher || 'Faculty not assigned'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
