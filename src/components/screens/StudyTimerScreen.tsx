import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { TimerMode, StudySession } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Play, Pause, Square, RotateCcw, CheckCircle2, Check, Clock, CalendarCheck } from 'lucide-react';


export const StudyTimerScreen: React.FC = () => {
  const { subjects, studySessions, addStudySession, settings } = useApp();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState<number>(settings.planner?.pomodoroStudy * 60 || 25 * 60);
  const [initialDuration, setInitialDuration] = useState<number>(settings.planner?.pomodoroStudy * 60 || 25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionConfidence, setSessionConfidence] = useState<'low' | 'medium' | 'high'>('medium');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [actualDuration, setActualDuration] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      handleFinish();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleModeChange = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    
    let minutes = 25;
    if (newMode === 'pomodoro') minutes = settings.planner?.pomodoroStudy || 25;
    else if (newMode === 'short_break') minutes = settings.planner?.pomodoroShortBreak || 5;
    else if (newMode === 'long_break') minutes = settings.planner?.pomodoroLongBreak || 15;
    else if (newMode === 'deep_work') minutes = 50;
    
    setTimeLeft(minutes * 60);
    setInitialDuration(minutes * 60);
  };

  const handleToggle = () => {
    setIsRunning(!isRunning);
  };

  const handleFinish = () => {
    setIsRunning(false);
    const durationCompletedMinutes = Math.round((initialDuration - timeLeft) / 60);
    setActualDuration(Math.max(1, durationCompletedMinutes)); // At least 1 minute to save
    setShowCompleteModal(true);
  };

  const handleSaveSession = () => {
    addStudySession({
      subjectId: selectedSubject || undefined,
      plannedDuration: Math.round(initialDuration / 60),
      actualDuration: actualDuration,
      status: 'completed',
      mode,
      notes: sessionNotes,
      
      startTime: new Date(Date.now() - actualDuration * 60000).toISOString(),
      endTime: new Date().toISOString(), updatedAt: new Date().toISOString()
    });
    setSessionNotes('');
    setShowCompleteModal(false);
    setTimeLeft(initialDuration);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialDuration);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const todayIso = new Date().toISOString().split('T')[0];
  const todaySessions = studySessions.filter((s) => s.createdAt.startsWith(todayIso) && s.status === 'completed');
  const todayTotalMins = todaySessions.reduce((sum, s) => sum + (s.actualDuration || s.plannedDuration || 0), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-6 relative">
      <Card glass className="p-8 text-center space-y-6 border border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className={`absolute top-0 left-0 w-full h-1 transition-all ${isRunning ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} />

        <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'pomodoro', label: `Pomodoro (${settings.planner?.pomodoroStudy || 25}m)` },
            { id: 'short_break', label: `Short Break (${settings.planner?.pomodoroShortBreak || 5}m)` },
            { id: 'long_break', label: `Long Break (${settings.planner?.pomodoroLongBreak || 15}m)` },
            { id: 'deep_work', label: 'Deep Work (50m)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleModeChange(tab.id as any)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === tab.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center py-6 sm:py-12">
          <div className="text-[5rem] sm:text-[7rem] font-bold text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none mb-6">
            {formatTimer(timeLeft)}
          </div>
          
          <div className="w-full max-w-xs mx-auto mb-6">
             <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">General Focus Session</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant={isRunning ? 'outline' : 'primary'}
              size="lg"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center !p-0"
              onClick={handleToggle}
            >
              {isRunning ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8 ml-1" />}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center !p-0"
              onClick={initialDuration !== timeLeft ? handleFinish : undefined}
              disabled={initialDuration === timeLeft}
              title="Finish Early"
            >
              <Square className="w-5 h-5 sm:w-6 sm:h-6" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center !p-0"
              onClick={handleReset}
            >
              <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </Card>

      <Card glass className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-indigo-500" />
            Today's Sessions
          </h3>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
             {Math.floor(todayTotalMins / 60)}h {todayTotalMins % 60}m Total
          </div>
        </div>
        
        {todaySessions.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">
            No study sessions completed today yet.
          </p>
        ) : (
          <div className="space-y-2">
            {todaySessions.map((session) => {
              const sub = subjects.find((s) => s.id === session.subjectId);
              return (
                <div key={session.id} className="glass-panel p-3.5 rounded-2xl flex items-center justify-between border border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {sub ? sub.name : 'General Focus'}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {(session.actualDuration || session.actualDuration)} min • {(session.mode || 'pomodoro').toUpperCase()} {session.notes ? `• ${session.notes}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm">
          <Card glass className="w-full max-w-sm bg-white/95 dark:bg-slate-900/95 shadow-2xl p-6 text-center space-y-5">
            <div className="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">Session Complete</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {subjects.find(s => s.id === selectedSubject)?.name || 'General Focus'} • {actualDuration} minutes
              </p>
            </div>

            <div className="text-left space-y-4">
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">What did you accomplish?</label>
                 <textarea
                  value={sessionNotes}
                  onChange={e => setSessionNotes(e.target.value)}
                  placeholder="Notes (optional)..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm resize-none h-20 outline-none focus:border-indigo-500"
                 />
              </div>
              
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Confidence</label>
                 <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((conf) => (
                      <button
                        key={conf}
                        onClick={() => setSessionConfidence(conf as any)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize border transition-all ${
                          sessionConfidence === conf 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white dark:bg-slate-900 text-slate-600 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {conf}
                      </button>
                    ))}
                 </div>
              </div>
            </div>

            <Button variant="primary" onClick={handleSaveSession} className="w-full py-3">
              Save Session
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
