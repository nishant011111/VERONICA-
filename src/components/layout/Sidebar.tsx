import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';
import {
  Activity,
  Workflow,
  Link as LinkIcon,
  LayoutDashboard,
  Sparkles,
  CalendarCheck,
  BookOpen,
  UserCheck,
  Clock,
  GraduationCap,
  FileText,
  StickyNote,
  FolderLock,
  Timer,
  BarChart3,
  Target,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  WifiOff,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeScreen, setActiveScreen } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems: { id: ScreenId; label: string; icon: React.ReactNode; isAi?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'ask_veronica', label: 'Ask Veronica', icon: <Sparkles className="w-5 h-5" />, isAi: true },
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

  return (
    <aside
      className={`relative hidden md:flex flex-col glass-panel border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 z-20 h-screen sticky top-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-200/80 dark:border-[#1A1A1A]">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-md">
              V
            </div>
            <div>
              <span className="text-xl font-semibold tracking-tighter text-slate-900 dark:text-white block">
                VERONICA
              </span>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Academic OS
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 mx-auto bg-indigo-600 rounded flex items-center justify-center font-bold text-white shadow-md">
            V
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#111111] transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List with Category Headers */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {[
          {
            category: 'Core',
            items: [
              { id: 'home', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'ask_veronica', label: 'Ask Veronica', icon: <Sparkles className="w-4 h-4 text-indigo-400" />, isAi: true },
              { id: 'planner', label: 'Planner', icon: <CalendarCheck className="w-4 h-4" /> },
            ],
          },
          {
            category: 'Academic',
            items: [
              { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'attendance', label: 'Attendance', icon: <UserCheck className="w-4 h-4" /> },
              { id: 'timetable', label: 'Timetable', icon: <Clock className="w-4 h-4" /> },
              { id: 'exams', label: 'Exams', icon: <GraduationCap className="w-4 h-4" /> },
              { id: 'assignments', label: 'Assignments', icon: <FileText className="w-4 h-4" /> },
              { id: 'notes', label: 'Notes', icon: <StickyNote className="w-4 h-4" /> },
              { id: 'study_timer', label: 'Timer', icon: <Timer className="w-4 h-4" /> },
              { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
            ],
          },
          {
            category: 'Storage & System',
            items: [
              { id: 'vault', label: 'Vault', icon: <FolderLock className="w-4 h-4" /> },
              { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
            ],
          },
        ].map((group, gIdx) => (
          <div key={group.category} className={gIdx > 0 ? 'mt-4' : ''}>
            {!isCollapsed && (
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2 mb-2">
                {group.category}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveScreen(item.id as ScreenId)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-slate-200 dark:bg-[#1A1A1A] text-slate-900 dark:text-white border border-slate-300 dark:border-[#2A2A2A] font-semibold'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-[#111111] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {!isCollapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.isAi && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* System Status / Offline badge in sidebar footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Local Storage
              </span>
              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              Privacy First. All records remain encrypted on this device.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
};
