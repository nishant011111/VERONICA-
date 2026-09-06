import {
  UniversityProfile,
  AcademicSession,
  Faculty,
  AcademicHoliday,
  UserProfile,
  UserSettings,
  Subject,
  Task,
  AttendanceRecord,
  TimetableSlot,
  Exam,
  Assignment,
  Note,
  VaultFile,
  VaultFolder,
  VaultActivity,
  StudySession,
  Goal, AppNotification,
  ChatMessage
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'veronica_profile',
  SETTINGS: 'veronica_settings',
  SUBJECTS: 'veronica_subjects',
  TASKS: 'veronica_tasks',
  ATTENDANCE: 'veronica_attendance',
  TIMETABLE: 'veronica_timetable',
  EXAMS: 'veronica_exams',
  ASSIGNMENTS: 'veronica_assignments',
  NOTES: 'veronica_notes',
  VAULT: 'veronica_vault',
  VAULT_FOLDERS: 'veronica_vault_folders',
  VAULT_ACTIVITIES: 'veronica_vault_activities',
  SESSIONS: 'veronica_study_sessions',
  GOALS: 'veronica_goals',
  CHAT_MESSAGES: 'veronica_chat_messages',
  UNIVERSITY_PROFILE: 'veronica_university_profile',
  ACADEMIC_SESSIONS: 'veronica_academic_sessions',
  FACULTIES: 'veronica_faculties',
  ACADEMIC_HOLIDAYS: 'veronica_academic_holidays',
};

export const defaultProfile: UserProfile = {
  id: 'user_local_primary',
  name: '',
  email: '',
  university: '',
  degree: '',
  academicYear: '',
  semester: '',
  isOnboarded: false,
  createdAt: new Date().toISOString(),
};

export const defaultSettings: UserSettings = {
  theme: 'system',
  accentColor: 'indigo',
  dashboard: {
    widgets: [
      { id: 'w-briefing', type: 'daily_briefing', visible: true, order: 0, size: 'full' },
      { id: 'w-overview', type: 'overview_metrics', visible: true, order: 1, size: 'full' },
      { id: 'w-schedule', type: 'schedule', visible: true, order: 2, size: 'large' },
      { id: 'w-quick', type: 'quick_access', visible: true, order: 3, size: 'large' },
      { id: 'w-subjects', type: 'subjects', visible: true, order: 4, size: 'full' },
    ]
  },
  notifications: {
    studyReminders: true,
    timetableReminders: true,
    timetableReminderMinutes: 15,
    assignmentReminders: true,
    examReminders: true,
    attendanceAlerts: true,
    systemAlerts: true,
    syncAlerts: true,
  },
  privacy: {
      localOnly: true,
      telemetry: false,
      aiTrainingOptOut: true,
    },
    planner: {
      preferredStudyHoursStart: '09:00',
      preferredStudyHoursEnd: '21:00',
      maxDailyStudyTime: 240,
      minSessionDuration: 15,
      preferredSessionLength: 60,
      pomodoroStudy: 25,
      pomodoroShortBreak: 5,
      pomodoroLongBreak: 15,
      pomodoroCycles: 4,
      autoReschedule: true,
      aiPlanningEnabled: true,
      daysOff: [0],
    },
  storage: {
    defaultSource: 'local',
  },
  ai: {
    aiMode: 'automatic',
    activeProvider: 'gemini',
    explanationLevel: 'university',
    responseStyle: 'balanced',
    saveHistory: true,
    memoryEnabled: true,
    ollamaHost: 'http://localhost:11434',
    groqApiKey: '',
    geminiApiKey: '',
  },
};

export class StorageService {
  private static getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage:`, e);
      return defaultValue;
    }
  }

  private static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage:`, e);
    }
  }

  // Profile & Settings
  static getProfile(): UserProfile {
    const saved = this.getItem<UserProfile>(STORAGE_KEYS.PROFILE, defaultProfile);
    return {
      ...defaultProfile,
      ...saved,
    };
  }

  static saveProfile(profile: UserProfile): void {
    this.setItem(STORAGE_KEYS.PROFILE, profile);
  }

  static getSettings(): UserSettings {
    const saved = this.getItem<UserSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
    return {
      ...defaultSettings,
      ...saved,
      notifications: {
        ...defaultSettings.notifications,
        ...(saved?.notifications || {}),
      },
      privacy: {
        ...defaultSettings.privacy,
        ...(saved?.privacy || {}),
      },
      storage: {
        ...defaultSettings.storage,
        ...(saved?.storage || {}),
      },
      ai: {
        ...defaultSettings.ai,
        ...(saved?.ai || {}),
      },
    };
  }

  static saveSettings(settings: UserSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
  }

  // Collections - NO DEMO DATA, strictly empty arrays by default
  static getSubjects(): Subject[] {
    return this.getItem<Subject[]>(STORAGE_KEYS.SUBJECTS, []);
  }

  static saveSubjects(subjects: Subject[]): void {
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);
  }

  static getNotifications(): AppNotification[] {
    return this.getItem<AppNotification[]>('veronica_notifications', []);
  }
  static saveNotifications(notifications: AppNotification[]): void {
    this.setItem('veronica_notifications', notifications);
  }

  static getTasks(): Task[] {
    return this.getItem<Task[]>(STORAGE_KEYS.TASKS, []);
  }

  static saveTasks(tasks: Task[]): void {
    this.setItem(STORAGE_KEYS.TASKS, tasks);
  }

  static getAttendance(): AttendanceRecord[] {
    return this.getItem<AttendanceRecord[]>(STORAGE_KEYS.ATTENDANCE, []);
  }

  static saveAttendance(records: AttendanceRecord[]): void {
    this.setItem(STORAGE_KEYS.ATTENDANCE, records);
  }

  static getTimetable(): TimetableSlot[] {
    return this.getItem<TimetableSlot[]>(STORAGE_KEYS.TIMETABLE, []);
  }

  static saveTimetable(slots: TimetableSlot[]): void {
    this.setItem(STORAGE_KEYS.TIMETABLE, slots);
  }

  static getExams(): Exam[] {
    return this.getItem<Exam[]>(STORAGE_KEYS.EXAMS, []);
  }

  static saveExams(exams: Exam[]): void {
    this.setItem(STORAGE_KEYS.EXAMS, exams);
  }

  static getAssignments(): Assignment[] {
    return this.getItem<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);
  }

  static saveAssignments(assignments: Assignment[]): void {
    this.setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }

  static getNotes(): Note[] {
    return this.getItem<Note[]>(STORAGE_KEYS.NOTES, []);
  }

  static saveNotes(notes: Note[]): void {
    this.setItem(STORAGE_KEYS.NOTES, notes);
  }

  static getVaultFiles(): VaultFile[] {
    return this.getItem<VaultFile[]>(STORAGE_KEYS.VAULT, []);
  }

  static saveVaultFiles(files: VaultFile[]): void {
    this.setItem(STORAGE_KEYS.VAULT, files);
  }

  static getVaultFolders(): VaultFolder[] {
    return this.getItem<VaultFolder[]>(STORAGE_KEYS.VAULT_FOLDERS, []);
  }

  static saveVaultFolders(folders: VaultFolder[]): void {
    this.setItem(STORAGE_KEYS.VAULT_FOLDERS, folders);
  }

  static getVaultActivities(): VaultActivity[] {
    return this.getItem<VaultActivity[]>(STORAGE_KEYS.VAULT_ACTIVITIES, []);
  }

  static saveVaultActivities(activities: VaultActivity[]): void {
    this.setItem(STORAGE_KEYS.VAULT_ACTIVITIES, activities);
  }

  static getStudySessions(): StudySession[] {
    return this.getItem<StudySession[]>(STORAGE_KEYS.SESSIONS, []);
  }

  static saveStudySessions(sessions: StudySession[]): void {
    this.setItem(STORAGE_KEYS.SESSIONS, sessions);
  }

  static getGoals(): Goal[] {
    return this.getItem<Goal[]>(STORAGE_KEYS.GOALS, []);
  }

  static saveGoals(goals: Goal[]): void {
    this.setItem(STORAGE_KEYS.GOALS, goals);
  }

  static getChatMessages(): ChatMessage[] {
    return this.getItem<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []);
  }

  static saveChatMessages(messages: ChatMessage[]): void {
    this.setItem(STORAGE_KEYS.CHAT_MESSAGES, messages);
  }

  // University Profile
  static getUniversityProfile(): UniversityProfile | null {
    return this.getItem<UniversityProfile | null>(STORAGE_KEYS.UNIVERSITY_PROFILE, null);
  }

  static saveUniversityProfile(profile: UniversityProfile): void {
    this.setItem(STORAGE_KEYS.UNIVERSITY_PROFILE, profile);
  }

  // Academic Sessions
  static getAcademicSessions(): AcademicSession[] {
    return this.getItem<AcademicSession[]>(STORAGE_KEYS.ACADEMIC_SESSIONS, []);
  }

  static saveAcademicSessions(sessions: AcademicSession[]): void {
    this.setItem(STORAGE_KEYS.ACADEMIC_SESSIONS, sessions);
  }

  // Faculties
  static getFaculties(): Faculty[] {
    return this.getItem<Faculty[]>(STORAGE_KEYS.FACULTIES, []);
  }

  static saveFaculties(faculties: Faculty[]): void {
    this.setItem(STORAGE_KEYS.FACULTIES, faculties);
  }

  // Academic Holidays
  static getAcademicHolidays(): AcademicHoliday[] {
    return this.getItem<AcademicHoliday[]>(STORAGE_KEYS.ACADEMIC_HOLIDAYS, []);
  }

  static saveAcademicHolidays(holidays: AcademicHoliday[]): void {
    this.setItem(STORAGE_KEYS.ACADEMIC_HOLIDAYS, holidays);
  }

  // Backup & Restore
  static exportAllData(): string {
    const data = {
      profile: this.getProfile(),
      settings: this.getSettings(),
      subjects: this.getSubjects(),
      tasks: this.getTasks(),
      attendance: this.getAttendance(),
      timetable: this.getTimetable(),
      exams: this.getExams(),
      assignments: this.getAssignments(),
      notes: this.getNotes(),
      vaultFiles: this.getVaultFiles(),
      studySessions: this.getStudySessions(),
      goals: this.getGoals(),
      chatMessages: this.getChatMessages(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    return JSON.stringify(data, null, 2);
  }

  static importAllData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (data.settings) this.saveSettings(data.settings);
      if (Array.isArray(data.subjects)) this.saveSubjects(data.subjects);
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.attendance)) this.saveAttendance(data.attendance);
      if (Array.isArray(data.timetable)) this.saveTimetable(data.timetable);
      if (Array.isArray(data.exams)) this.saveExams(data.exams);
      if (Array.isArray(data.assignments)) this.saveAssignments(data.assignments);
      if (Array.isArray(data.notes)) this.saveNotes(data.notes);
      if (Array.isArray(data.vaultFiles)) this.saveVaultFiles(data.vaultFiles);
      if (Array.isArray(data.studySessions)) this.saveStudySessions(data.studySessions);
      if (Array.isArray(data.goals)) this.saveGoals(data.goals);
      if (Array.isArray(data.chatMessages)) this.saveChatMessages(data.chatMessages);
      return true;
    } catch (e) {
      console.error('Failed to import data JSON:', e);
      return false;
    }
  }

  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  }

  static clearAllUserEverywhere(): void {
    try {
      // 1. Purge all localStorage keys
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage clear error:', e);
    }

    try {
      // 2. Purge all sessionStorage keys
      sessionStorage.clear();
    } catch (e) {
      console.warn('sessionStorage clear error:', e);
    }

    try {
      // 3. Delete IndexedDB vault database
      if (window.indexedDB) {
        window.indexedDB.deleteDatabase('veronica_vault_db');
      }
    } catch (e) {
      console.warn('IndexedDB deletion error:', e);
    }
  }
}
