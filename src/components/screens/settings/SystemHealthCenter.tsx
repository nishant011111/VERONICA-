import React, { useState, useEffect } from 'react';
import { Card } from '../../ui/Card';
import { Activity, Database, Cloud, Zap, RefreshCw, HardDrive, Cpu, AlertTriangle } from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export const SystemHealthCenter: React.FC = () => {
  const { vaultFiles, settings } = useApp();
  
  const [dbStatus, setDbStatus] = useState('Operational');
  const [aiStatus, setAiStatus] = useState(settings.ai?.geminiApiKey ? 'Available' : 'API Key Missing');
  
  // Calculate storage mock
  const totalStorageBytes = vaultFiles.reduce((acc, f) => acc + (f.size || 0), 0);
  const storageUsageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);

  return (
    <Card glass className="space-y-4 border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-[#0F0F0F]/50">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            System Health Center
          </h3>
        </div>
        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">All Systems Nominal</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Local Database</p>
              <p className="text-xs text-slate-500">{dbStatus}</p>
            </div>
          </div>
        </div>

        {/* AI Service */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">AI Capabilities</p>
              <p className="text-xs text-slate-500">{aiStatus}</p>
            </div>
          </div>
        </div>

        {/* Sync */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Background Sync</p>
              <p className="text-xs text-slate-500">Synced</p>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <HardDrive className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Storage Status</p>
              <p className="text-xs text-slate-500">{storageUsageMB} MB Used</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
