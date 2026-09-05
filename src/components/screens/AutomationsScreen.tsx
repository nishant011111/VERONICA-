import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Workflow, Plus, Play, Pause, Copy, Trash2, Clock, Zap, FileText, Bell } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { Badge } from '../ui/Badge';

export const AutomationsScreen: React.FC = () => {
  const { automations, setAutomations, addActivityEvent } = useApp();
  
  const handleToggle = (id: string) => {
    setAutomations(prev => prev.map(a => {
      if (a.id === id) {
        const newStatus = a.status === 'active' ? 'paused' : 'active';
        addActivityEvent({
          type: 'automation',
          title: `Automation ${newStatus === 'active' ? 'Resumed' : 'Paused'}`,
          description: `Automation "${a.name}" was ${newStatus}.`
        });
        return { ...a, status: newStatus };
      }
      return a;
    }));
  };

  const handleCreateMock = () => {
    const newAutomation = {
      id: crypto.randomUUID(),
      name: 'Weekly Summary',
      trigger: 'time' as const,
      triggerConfig: { day: 'Monday', time: '08:00' },
      action: 'summarize' as const,
      actionConfig: { target: 'notes' },
      status: 'active' as const,
      createdAt: new Date().toISOString()
    };
    setAutomations(prev => [...prev, newAutomation]);
    addActivityEvent({
      type: 'automation',
      title: 'Automation Created',
      description: `Created automation "${newAutomation.name}"`
    });
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Workflow className="w-6 h-6 text-indigo-500" />
            Automation Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create rules and workflows to manage your academic ecosystem
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={handleCreateMock}
        >
          New Automation
        </Button>
      </div>
      
      {automations.length === 0 ? (
        <EmptyState
          icon={<Zap className="w-10 h-10" />}
          title="No Automations Yet"
          description="Create your first rule, such as 'Every Monday, summarize my notes for the week' or 'When a task is overdue, notify me'."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {automations.map(auto => (
            <Card key={auto.id} glass className="p-4 border border-slate-200 dark:border-slate-800 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-xl ${auto.status === 'active' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                    <Workflow className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{auto.name}</h3>
                    <Badge variant={auto.status === 'active' ? 'green' : 'slate'} className="mt-1 text-[10px]">
                      {auto.status === 'active' ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-3 mt-2">
                <div className="flex items-start gap-2 text-xs">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">When: </span>
                    <span className="text-slate-500">
                      {auto.trigger === 'time' ? `Every ${auto.triggerConfig.day} at ${auto.triggerConfig.time}` : 'Event triggers'}
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Then: </span>
                    <span className="text-slate-500">
                      {auto.action === 'summarize' ? 'Summarize recent notes' : 
                       auto.action === 'notify' ? 'Send a notification' : 'Execute action'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {auto.lastRun ? `Last run: ${auto.lastRun}` : 'Never run'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(auto.id)} className="p-1.5 text-slate-400 hover:text-indigo-500 transition-colors">
                    {auto.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setAutomations(prev => prev.filter(a => a.id !== auto.id))} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
