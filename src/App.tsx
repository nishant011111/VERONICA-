import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginScreen } from './components/auth/LoginScreen';
import { Header } from './components/layout/Header';
import { TimetableReminderManager } from './components/layout/TimetableReminderManager';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { OnboardingModal } from './components/layout/OnboardingModal';
import { ToastContainer } from './components/ui/ToastContainer';

// Form Modals
import { SubjectFormModal } from './components/forms/SubjectFormModal';
import { TaskFormModal } from './components/forms/TaskFormModal';
import { AttendanceFormModal } from './components/forms/AttendanceFormModal';
import { TimetableFormModal } from './components/forms/TimetableFormModal';
import { ExamFormModal } from './components/forms/ExamFormModal';
import { AssignmentFormModal } from './components/forms/AssignmentFormModal';
import { NoteFormModal } from './components/forms/NoteFormModal';
import { VaultFileModal } from './components/forms/VaultFileModal';
import { GoalFormModal } from './components/forms/GoalFormModal';
import { QuickCreateModal } from './components/forms/QuickCreateModal';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { AskVeronicaScreen } from './components/screens/AskVeronicaScreen';
import { PlannerScreen } from './components/screens/PlannerScreen';
import { SubjectsScreen } from './components/screens/SubjectsScreen';
import { AttendanceScreen } from './components/screens/AttendanceScreen';
import { TimetableScreen } from './components/screens/TimetableScreen';
import { ExamsScreen } from './components/screens/ExamsScreen';
import { AssignmentsScreen } from './components/screens/AssignmentsScreen';
import { NotesScreen } from './components/screens/NotesScreen';
import { AutomationsScreen } from './components/screens/AutomationsScreen';
import { TimelineScreen } from './components/screens/TimelineScreen';
import { IntegrationsScreen } from './components/screens/IntegrationsScreen';
import { VaultScreen } from './components/screens/VaultScreen';
import { StudyTimerScreen } from './components/screens/StudyTimerScreen';
import { AnalyticsScreen } from './components/screens/AnalyticsScreen';
import { GoalsScreen } from './components/screens/GoalsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

// Types
import { Subject, Task, TimetableSlot, Exam, Assignment, Note, Goal } from './types';

const MainAppContent: React.FC = () => {
  const { activeScreen, profile, updateProfile, toasts, removeToast } = useApp();

  // Onboarding modal state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!profile.isOnboarded);

  // Quick Create modal state
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);

  // Individual Form Modal States
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceSubjectId, setAttendanceSubjectId] = useState<string | undefined>(undefined);
  const [editingAttendanceRecord, setEditingAttendanceRecord] = useState<any>(null);

  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [editingTimetableSlot, setEditingTimetableSlot] = useState<TimetableSlot | null>(null);
  const [timetableDefaultDay, setTimetableDefaultDay] = useState<number>(1);

  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Handlers to open modal dialogs
  const handleOpenSubjectModal = (sub?: Subject | null) => {
    setEditingSubject(sub || null);
    setIsSubjectModalOpen(true);
  };

  const handleOpenTaskModal = (task?: Task | null) => {
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  };

  const handleOpenAttendanceModal = (subjectId?: string, record?: any) => {
    setEditingAttendanceRecord(record || null);
    setAttendanceSubjectId(subjectId);
    setIsAttendanceModalOpen(true);
  };

  const handleOpenTimetableModal = (slot?: TimetableSlot | null, defaultDay?: number) => {
    setEditingTimetableSlot(slot || null);
    setTimetableDefaultDay(defaultDay || 1);
    setIsTimetableModalOpen(true);
  };

  const handleOpenExamModal = (exam?: Exam | null) => {
    setEditingExam(exam || null);
    setIsExamModalOpen(true);
  };

  const handleOpenAssignmentModal = (assignment?: Assignment | null) => {
    setEditingAssignment(assignment || null);
    setIsAssignmentModalOpen(true);
  };

  const handleOpenNoteModal = (note?: Note | null) => {
    setEditingNote(note || null);
    setIsNoteModalOpen(true);
  };

  const handleOpenGoalModal = (goal?: Goal | null) => {
    setEditingGoal(goal || null);
    setIsGoalModalOpen(true);
  };

  // Quick Create Modal Action dispatcher
  const handleQuickCreateSelect = (
    type: 'subject' | 'task' | 'attendance' | 'timetable' | 'exam' | 'assignment' | 'note' | 'vault' | 'goal'
  ) => {
    if (type === 'subject') handleOpenSubjectModal(null);
    else if (type === 'task') handleOpenTaskModal(null);
    else if (type === 'attendance') handleOpenAttendanceModal();
    else if (type === 'timetable') handleOpenTimetableModal(null);
    else if (type === 'exam') handleOpenExamModal(null);
    else if (type === 'assignment') handleOpenAssignmentModal(null);
    else if (type === 'note') handleOpenNoteModal(null);
    else if (type === 'vault') setIsVaultModalOpen(true);
    else if (type === 'goal') handleOpenGoalModal(null);
  };

  // Screen Switcher
  const renderScreen = () => {
    if (activeScreen === 'study_timer') return null;
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onOpenQuickCreate={() => setIsQuickCreateOpen(true)} />;
      case 'ask_veronica':
        return <AskVeronicaScreen />;
      case 'planner':
        return <PlannerScreen onOpenTaskModal={handleOpenTaskModal} />;
      case 'subjects':
        return <SubjectsScreen onOpenSubjectModal={handleOpenSubjectModal} />;
      case 'attendance':
        return <AttendanceScreen onOpenAttendanceModal={handleOpenAttendanceModal} />;
      case 'timetable':
        return <TimetableScreen onOpenTimetableModal={handleOpenTimetableModal} />;
      case 'exams':
        return <ExamsScreen onOpenExamModal={handleOpenExamModal} />;
      case 'assignments':
        return <AssignmentsScreen onOpenAssignmentModal={handleOpenAssignmentModal} />;
      case 'notes':
        return <NotesScreen onOpenNoteModal={handleOpenNoteModal} />;
      case 'vault':
        return <VaultScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      case 'goals':
        return <GoalsScreen onOpenGoalModal={handleOpenGoalModal} />;
      case 'settings':
        return <SettingsScreen />;
      case 'automations':
        return <AutomationsScreen />;
      case 'timeline':
        return <TimelineScreen />;
      case 'integrations':
        return <IntegrationsScreen />;
      default:
        return <HomeScreen onOpenQuickCreate={() => setIsQuickCreateOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
      {/* Top Header Bar */}
      <TimetableReminderManager />
      <Header onOpenQuickAdd={() => setIsQuickCreateOpen(true)} />

      {/* Main Body Shell */}
      <div className="flex-1 flex overflow-hidden max-w-[1600px] w-full mx-auto">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar />

        {/* Scrollable Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderScreen()}
          <div style={{ display: activeScreen === 'study_timer' ? 'block' : 'none', height: '100%' }}>
            <StudyTimerScreen />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Global Toast Notification Container */}
      <ToastContainer />

      {/* First-time User Onboarding Modal */}
      <OnboardingModal />

      {/* Quick Create Selector Modal */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        onSelectAction={handleQuickCreateSelect}
      />

      {/* 9 Form Modals */}
      <SubjectFormModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        editSubject={editingSubject}
      />

      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        editTask={editingTask}
      />

      <AttendanceFormModal
        initialRecord={editingAttendanceRecord}
        isOpen={isAttendanceModalOpen}
        onClose={() => { setIsAttendanceModalOpen(false); setEditingAttendanceRecord(null); }}
        defaultSubjectId={attendanceSubjectId}
      />

      <TimetableFormModal
        isOpen={isTimetableModalOpen}
        onClose={() => setIsTimetableModalOpen(false)}
        editSlot={editingTimetableSlot}
        defaultDay={timetableDefaultDay}
      />

      <ExamFormModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        editExam={editingExam}
      />

      <AssignmentFormModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        editAssignment={editingAssignment}
      />

      <NoteFormModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        editNote={editingNote}
      />

      <VaultFileModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
      />

      <GoalFormModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        editGoal={editingGoal}
      />
    </div>
  );
};

const RootAppContent: React.FC = () => {
  const { authUser, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-indigo-500 rounded-full mb-4"></div>
          <p className="text-slate-400 font-medium">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <LoginScreen />;
  }

  return <MainAppContent />;
};

export function App() {
  return (
    <AppProvider>
      <RootAppContent />
    </AppProvider>
  );
}

export default App;
