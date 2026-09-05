import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyEngine } from '../../services/study/StudyEngine';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { BrainCircuit, X, Check, Loader2 } from 'lucide-react';

interface AIPlanModalProps {
  onClose: () => void;
}

export const AIPlanModal: React.FC<AIPlanModalProps> = ({ onClose }) => {
  const context = useApp();
  const [prompt, setPrompt] = useState('I have 90 minutes today. Create a quick plan.');
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const plan = await StudyEngine.generateAIPlan({ ...context, userId: context.profile.id }, prompt);
      setPlanResult(plan);
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
      <Card glass className="w-full max-w-lg bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" /> Generate Study Plan
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {!planResult ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Veronica will analyze your upcoming exams, weak topics, and deadlines to suggest a study plan.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  What do you need?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none min-h-[100px]"
                  placeholder="e.g. Plan my week for the upcoming Physics exam..."
                />
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {planResult}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {planResult ? 'Close' : 'Cancel'}
          </Button>
          {!planResult && (
            <Button variant="primary" onClick={handleGenerate} disabled={loading} icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BrainCircuit className="w-4 h-4" />}>
              {loading ? 'Generating...' : 'Generate Plan'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
