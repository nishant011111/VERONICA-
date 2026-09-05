import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';
import {
  Activity,
  Workflow,
  Link as LinkIcon,
  LayoutDashboard,
  CalendarCheck,
  Clock,
  BookOpen,
  Sparkles,
  Menu,
  X,
  UserCheck,
  GraduationCap,
  FileText,
  StickyNote,
  FolderLock,
  Timer,
  BarChart3,
  Target,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeScreen, setActiveScreen } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const primaryTabs: { id: ScreenId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'planner', label: 'Planner', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'timetable', label: 'Timetable', icon: <Clock className="w-5 h-5" /> },
    { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'ask_veronica', label: 'Ask AI', icon: <Sparkles className="w-5 h-5 text-indigo-400" /> },
  ];

  const allScreens: { id: ScreenId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'ask_veronica', label: 'Ask Veronica', icon: <Sparkles className="w-5 h-5 text-indigo-400" /> },
    { id: 'planner', label: 'Planner', icon: <CalendarCheck className="w-5 h-5" /> },
    { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'attendance', label: 'Attendance', icon: <UserCheck className="w-5 h-5" /> },
    { id: 'timetable', label: 'Timetable', icon: <Clock className="w-5 h-5" /> },
    { id: 'exams', label: 'Exams', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'assignments', label: 'Assignments', icon: <FileText className="w-5 h-5" /> },
    { id: 'notes', label: 'Notes', icon: <StickyNote className="w-5 h-5" /> },
    { id: 'vault', label: 'Vault', icon: <FolderLock className="w-5 h-5" /> },
    { id: 'study_timer', label: 'Study Timer', icon: <Timer className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'automations', label: 'Automations', icon: <Workflow className="w-5 h-5" /> },
    { id: 'timeline', label: 'Activity', icon: <Activity className="w-5 h-5" /> },
    { id: 'integrations', label: 'Integrations', icon: <LinkIcon className="w-5 h-5" /> },
  ];

  const handleSelectScreen = (id: ScreenId) => {
    setActiveScreen(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Full Menu Sheet Overlay for Mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="p-4 flex items-center justify-between border-b border-slate-800 dark:border-[#1A1A1A] glass-panel">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                V
              </div>
              <span className="font-bold text-sm tracking-wider text-slate-100 uppercase">
                VERONICA MENU
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 bg-[#0A0A0A] border border-[#1A1A1A]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
            {allScreens.map((screen) => {
              const isActive = activeScreen === screen.id;
              return (
                <button
                  key={screen.id}
                  onClick={() => handleSelectScreen(screen.id)}
                  className={`flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-[#0A0A0A] border-[#1A1A1A] text-slate-300 hover:bg-[#111111]'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
                    {screen.icon}
                  </div>
                  <span className="text-xs font-bold">{screen.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 border-t border-[#1A1A1A] glass-panel flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Local Mode Active
            </span>
            <span>Version 1.0</span>
          </div>
        </div>
      )}

      {/* Bottom Sticky Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-panel border-t border-slate-200/80 dark:border-[#1A1A1A] px-2 py-2 flex items-center justify-around shadow-2xl">
        {primaryTabs.map((tab) => {
          const isActive = activeScreen === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveScreen(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1">More</span>
        </button>
      </nav>
    </>
  );
};
