import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentProfileModal } from '../profile/StudentProfileModal';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { NotificationCenter } from './NotificationCenter';
import {
  Search,
  Moon,
  Sun,
  Monitor,
  Smartphone,
  Laptop,
  Sparkles,
  User,
  Plus,
  LogOut,
  GraduationCap,
  Edit3,
} from 'lucide-react';
import { ScreenId } from '../../types';

interface HeaderProps {
  onOpenQuickAdd?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickAdd }) => {
  const {
    activeScreen,
    setActiveScreen,
    searchQuery,
    setSearchQuery,
    profile,
    settings,
    updateSettings,
    deviceViewMode,
    setDeviceViewMode,
    authUser,
  } = useApp();

  const screenTitles: Record<ScreenId, { title: string; desc: string }> = {
    home: { title: 'Dashboard', desc: 'Welcome back to your academic workspace' },
    ask_veronica: { title: 'Ask Veronica AI', desc: 'Personal study assistant' },
    planner: { title: 'Planner', desc: 'Manage your tasks & daily schedule' },
    subjects: { title: 'Subjects', desc: 'Course syllabi, credits & target grades' },
    attendance: { title: 'Attendance', desc: 'Track class attendance & threshold targets' },
    timetable: { title: 'Timetable', desc: 'Weekly schedule & class locations' },
    exams: { title: 'Exams', desc: 'Upcoming exam schedule & countdowns' },
    assignments: { title: 'Assignments', desc: 'Coursework deadlines & submissions' },
    notes: { title: 'Notes', desc: 'Knowledge vault & subject notes' },
    vault: { title: 'Vault', desc: 'Documents, PDFs & learning materials' },
    study_timer: { title: 'Study Timer', desc: 'Focus timer & Pomodoro sessions' },
    analytics: { title: 'Analytics', desc: 'Real study statistics & performance metrics' },
    goals: { title: 'Goals', desc: 'Set and track academic targets' },
    settings: { title: 'Settings', desc: 'App configuration & data controls' },
    automations: { title: 'Automations', desc: 'Smart workflows & rules' },
    timeline: { title: 'Activity Timeline', desc: 'Recent events & changes' },
    integrations: { title: 'Integrations', desc: 'Connected accounts & services' },
  };

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [startInEditMode, setStartInEditMode] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-200/80 dark:border-[#1A1A1A] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Active Screen Title / Branding */}
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            V
          </div>
          <span className="font-bold text-sm tracking-wider text-slate-900 dark:text-slate-100 uppercase">
            VERONICA
          </span>
        </div>

        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {screenTitles[activeScreen]?.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {screenTitles[activeScreen]?.desc}
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] text-slate-500 dark:text-slate-400 text-left hover:bg-slate-200 dark:hover:bg-[#111111] transition-all flex items-center justify-between"
          >
            <span>Search Veronica OS...</span>
            <span className="text-[10px] bg-slate-200 dark:bg-[#1A1A1A] px-1.5 py-0.5 rounded text-slate-500">⌘K</span>
          </button>
        </div>
      </div>

      {/* Top Header Actions */}
      <div className="flex items-center gap-2">
        {/* Device Mode Toggle Simulator */}
        <div className="hidden lg:flex items-center bg-slate-100 dark:bg-[#0A0A0A] p-1 rounded-xl border border-slate-200 dark:border-[#1A1A1A]">
          <button
            onClick={() => setDeviceViewMode('responsive')}
            title="Auto Responsive View"
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              deviceViewMode === 'responsive'
                ? 'bg-white dark:bg-[#1A1A1A] text-indigo-600 dark:text-indigo-400 shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="text-[11px]">Auto</span>
          </button>
          <button
            onClick={() => setDeviceViewMode('windows')}
            title="Force Windows Desktop Mode"
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              deviceViewMode === 'windows'
                ? 'bg-white dark:bg-[#1A1A1A] text-indigo-600 dark:text-indigo-400 shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
            <span className="text-[11px]">Desktop</span>
          </button>
          <button
            onClick={() => setDeviceViewMode('android')}
            title="Force Android Mobile Mode"
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              deviceViewMode === 'android'
                ? 'bg-white dark:bg-[#1A1A1A] text-indigo-600 dark:text-indigo-400 shadow-sm font-medium'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="text-[11px]">Mobile</span>
          </button>
        </div>

        {/* Quick Add Button */}
        {onOpenQuickAdd && (
          <button
            onClick={onOpenQuickAdd}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Quick Create</span>
          </button>
        )}

        <NotificationCenter />
        
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] transition-colors"
          title={`Current Theme: ${settings.theme}. Click to switch.`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Profile Quick Access & Sign Out */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0A0A0A] p-1 rounded-xl border border-slate-200 dark:border-[#1A1A1A]">
          <button
            onClick={() => {
              setStartInEditMode(false);
              setIsProfileModalOpen(true);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-white dark:hover:bg-[#1A1A1A] transition-all cursor-pointer group"
            title="View Student Digital ID & Profile"
          >
            {profile.avatarUrl || authUser?.photoURL ? (
              <img
                src={profile.avatarUrl || authUser?.photoURL || ''}
                alt={profile.name || 'User Avatar'}
                className="w-6 h-6 rounded-md object-cover ring-1 ring-indigo-500/50"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {profile.name ? profile.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
            )}
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden xl:inline max-w-[100px] truncate group-hover:text-indigo-400 transition-colors">
              {profile.name || authUser?.displayName || 'Student Pass'}
            </span>
          </button>
          <div className="w-px h-5 bg-slate-200 dark:bg-[#2A2A2A] mx-0.5"></div>
          <button
            onClick={() => {
              setStartInEditMode(true);
              setIsProfileModalOpen(true);
            }}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
            title="Edit Profile"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Student Profile Quick Access Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        startInEditMode={startInEditMode}
      />
    </header>
  );
};
