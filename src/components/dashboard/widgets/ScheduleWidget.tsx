import React from 'react';
import { useApp } from '../../../context/AppContext';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { CalendarCheck, ArrowRight } from 'lucide-react';

export const ScheduleWidget: React.FC = () => {
  const { tasks, setActiveScreen } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((t) => t.date === todayStr);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">
          Today's Plan
        </h3>
        <Button size="sm" variant="ghost" onClick={() => setActiveScreen('planner')} icon={<ArrowRight className="w-3.5 h-3.5" />}>
          Open Planner
        </Button>
      </div>

      {todayTasks.length === 0 ? (
        <div className="flex-1 border-2 border-dashed border-slate-200 dark:border-[#1A1A1A] rounded-3xl flex flex-col items-center justify-center text-center p-8 min-h-[200px]">
          <div className="w-12 h-12 bg-slate-100 dark:bg-[#111111] rounded-full flex items-center justify-center mb-4">
            <CalendarCheck className="w-6 h-6 text-slate-400 dark:text-gray-600" />
          </div>
          <p className="text-slate-700 dark:text-gray-400 font-medium">Your schedule is empty</p>
          <p className="text-slate-500 dark:text-gray-600 text-sm mt-1">Add subjects or tasks to see your daily view.</p>
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {todayTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-[#0A0A0A] p-4 rounded-2xl flex items-center justify-between gap-3 border border-slate-200 dark:border-[#1A1A1A]"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={task.status === 'completed'}
                  readOnly
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <h4 className={`text-xs font-bold text-slate-900 dark:text-slate-100 ${task.status === 'completed' ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-gray-500">
                    {task.startTime || 'All Day'} • {task.duration || 30} mins
                  </p>
                </div>
              </div>
              <Badge variant={task.priority === 'high' ? 'rose' : task.priority === 'medium' ? 'amber' : 'slate'}>
                {task.priority}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
