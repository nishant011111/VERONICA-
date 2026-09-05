import { MotivationalQuote } from "../ui/MotivationalQuote";
import { NextBestSession } from "../planner/NextBestSession";
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentProfileModal } from '../profile/StudentProfileModal';
import { Dashboard } from '../dashboard/Dashboard';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import {
  Sparkles,
  Clock,
  Target,
  CalendarCheck,
  UserCheck,
  Flame,
  BookOpen,
  ArrowRight,
  Plus,
  Compass,
  FileText,
  GraduationCap
} from 'lucide-react';

interface HomeScreenProps {
  onOpenQuickCreate: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenQuickCreate }) => {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const {
    profile,
    subjects,
    tasks,
    attendance,
    exams,
    assignments,
    studySessions,
    goals,
    setActiveScreen,
  } = useApp();

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Calculate real study time today (in minutes)
  return (
    <div className="space-y-8 pb-20 md:pb-6">
      {/* Header & Ask Veronica Input */}
      <header className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-light text-slate-900 dark:text-white tracking-tight">
              {getGreeting()},{' '}
              <button
                type="button"
                onClick={() => setIsProfileModalOpen(true)}
                className="font-bold text-indigo-600 dark:text-indigo-400 underline decoration-indigo-300 dark:decoration-indigo-800 underline-offset-8 hover:text-indigo-500 transition-colors cursor-pointer"
                title="View Digital Student ID Pass"
              >
                {profile.name ? profile.name : 'Student'}
              </button>
              .
            </h1>
            <MotivationalQuote />
          </div>
          <div className="hidden sm:flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0A0A0A] hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              <span>Student Pass</span>
            </button>
            <Badge variant="indigo">VERONICA OS v1.0</Badge>
          </div>
        </div>

        <NextBestSession />

        {/* Ask Veronica Prompt Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Ask Veronica anything about your studies..."
            onClick={() => setActiveScreen('ask_veronica')}
            readOnly
            className="w-full bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] rounded-2xl py-4 sm:py-5 px-6 text-sm sm:text-lg text-slate-900 dark:text-gray-300 placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-900/50 transition-all cursor-pointer shadow-sm"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-indigo-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CONNECTED</span>
          </div>
        </div>
      </header>

      <Dashboard onOpenQuickCreate={onOpenQuickCreate} />

            {/* Student Profile Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
