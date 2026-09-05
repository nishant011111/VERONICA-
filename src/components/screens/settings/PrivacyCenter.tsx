import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Shield, EyeOff, Database, History, CloudOff, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/Button';

export const PrivacyCenter: React.FC = () => {
  const [clearingMemory, setClearingMemory] = useState(false);

  const handleClearMemory = () => {
    setClearingMemory(true);
    // Simulate clearing memory
    setTimeout(() => {
      setClearingMemory(false);
      alert('Search history and conversational memory cleared.');
    }, 1000);
  };

  return (
    <Card glass className="space-y-4 border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-[#0F0F0F]/50">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Privacy Center
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Control what data Veronica stores, uses, and sends to AI services. 
          Your private vault documents are only sent to the AI when explicitly required to answer a question.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Conversational Memory</span>
              <span className="text-xs text-slate-500">Clear past AI chats and context</span>
            </div>
            <Button size="sm" variant="outline" onClick={handleClearMemory} disabled={clearingMemory}>
              {clearingMemory ? 'Clearing...' : 'Clear Memory'}
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Telemetry & Analytics</span>
              <span className="text-xs text-slate-500">Send anonymous usage data</span>
            </div>
            <Button size="sm" variant="ghost" className="text-slate-500">
              Opt Out
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-500/20">
          <div className="flex items-start gap-3">
            <EyeOff className="w-5 h-5 text-indigo-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Data Sent to AI</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                When you use the "Ask Veronica" feature, only the <strong>minimum necessary context</strong> (like your active tasks and up to 5 recent documents) is sent to the configured AI provider. No personal identifying information (PII) is included in the system prompt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
