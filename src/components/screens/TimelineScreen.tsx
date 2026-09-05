import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Activity, Clock, Filter, Calendar, FileText, CheckCircle, Zap, ShieldAlert, Settings } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';

export const TimelineScreen: React.FC = () => {
  const { activityTimeline } = useApp();
  const [filter, setFilter] = useState<string>('all');

  const filteredTimeline = filter === 'all' 
    ? activityTimeline 
    : activityTimeline.filter(event => event.type === filter);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'create': return <FileText className="w-4 h-4 text-emerald-500" />;
      case 'update': return <Settings className="w-4 h-4 text-blue-500" />;
      case 'delete': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'system': return <Settings className="w-4 h-4 text-slate-500" />;
      case 'automation': return <Zap className="w-4 h-4 text-amber-500" />;
      default: return <Activity className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-500" />
            Activity Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track everything that happens in your workspace
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 outline-none"
          >
            <option value="all">All Activity</option>
            <option value="create">Creations</option>
            <option value="update">Updates</option>
            <option value="delete">Deletions</option>
            <option value="automation">Automations</option>
          </select>
        </div>
      </div>
      
      {filteredTimeline.length === 0 ? (
        <EmptyState
          icon={<Clock className="w-10 h-10" />}
          title="Timeline Ready"
          description="Your activity log will start populating as you use Veronica. Activities like creating notes, finishing tasks, and running automations will appear here."
        />
      ) : (
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 space-y-6 pb-8 mt-8">
          {filteredTimeline.map((event, i) => {
            const date = new Date(event.timestamp);
            return (
              <div key={event.id} className="relative pl-6">
                <div className="absolute -left-3.5 top-1 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>
                <div className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{event.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{event.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
