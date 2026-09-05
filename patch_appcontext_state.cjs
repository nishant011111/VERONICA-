const fs = require('fs');
let ctx = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add imports to AppContext
const importTarget = "import { ScreenId, UserProfile, UserSettings, ThemeMode, AcademicSession, Faculty, AcademicHoliday, UniversityProfile, Subject, Task, Note, AttendanceRecord, Exam, Assignment, TimetableEvent, AppNotification, DashboardLayout, VaultFile, VaultFolder, DocumentChunk, PracticeQuestion, AnswerEvaluation } from '../types';";
const newImport = "import { ScreenId, UserProfile, UserSettings, ThemeMode, AcademicSession, Faculty, AcademicHoliday, UniversityProfile, Subject, Task, Note, AttendanceRecord, Exam, Assignment, TimetableEvent, AppNotification, DashboardLayout, VaultFile, VaultFolder, DocumentChunk, PracticeQuestion, AnswerEvaluation, Automation, ActivityEvent, Integration } from '../types';";
ctx = ctx.replace(importTarget, newImport);

// 2. Add to AppContextType
const typeTarget = "  setFaculties: React.Dispatch<React.SetStateAction<Faculty[]>>;";
const newType = `  setFaculties: React.Dispatch<React.SetStateAction<Faculty[]>>;
  automations: Automation[];
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
  activityTimeline: ActivityEvent[];
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;
  integrations: Integration[];
  updateIntegration: (id: string, updates: Partial<Integration>) => void;`;
ctx = ctx.replace(typeTarget, newType);

// 3. Add to Provider state
const stateTarget = "const [faculties, setFaculties] = useState<Faculty[]>([]);";
const newState = `const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityEvent[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'google_drive', provider: 'google_drive', status: 'disconnected' },
    { id: 'google_calendar', provider: 'google_calendar', status: 'disconnected' },
    { id: 'github', provider: 'github', status: 'disconnected' }
  ]);

  const addActivityEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    setActivityTimeline(prev => [newEvent, ...prev]);
  };

  const updateIntegration = (id: string, updates: Partial<Integration>) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };
`;
ctx = ctx.replace(stateTarget, newState);

// 4. Add to Provider value
const valTarget = "faculties,\n        setFaculties,";
const newVal = `faculties,
        setFaculties,
        automations,
        setAutomations,
        activityTimeline,
        addActivityEvent,
        integrations,
        updateIntegration,`;
ctx = ctx.replace(valTarget, newVal);

fs.writeFileSync('src/context/AppContext.tsx', ctx);
console.log('patched appcontext');
