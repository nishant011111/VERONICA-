const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Modify renderScreen
const oldRenderScreen = `  const renderScreen = () => {
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
      case 'study_timer':
        return <StudyTimerScreen />;
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
  };`;

const newRenderScreen = `  const renderScreen = () => {
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
  };`;

code = code.replace(oldRenderScreen, newRenderScreen);

const oldMain = `<main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderScreen()}
        </main>`;

const newMain = `<main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderScreen()}
          <div style={{ display: activeScreen === 'study_timer' ? 'block' : 'none', height: '100%' }}>
            <StudyTimerScreen />
          </div>
        </main>`;

code = code.replace(oldMain, newMain);

fs.writeFileSync('src/App.tsx', code);
console.log("updated App.tsx!");
