import { useKnowledgeBase } from '../hooks/useKnowledgeBase';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginWithGoogle,
  logoutUser,
  deleteUserCloudAccount,
  onAuthStateChanged,
  auth,
  User,
  signInWithEmail,
  signUpWithEmail,
} from '../services/firebase';
import {
  UniversityProfile,
  AcademicSession,
  Faculty,
  AcademicHoliday,
  UserProfile,
  UserSettings,
  Subject,
  Task,
  TaskStatus,
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
  ChatMessage,
  ScreenId,
  ThemeMode,
  KnowledgeBaseDocument,
  Automation,
  Integration,
  ActivityEvent,
} from '../types';
import { StorageService, defaultProfile, defaultSettings } from '../services/storage';
import { vaultIndexedDB } from '../services/vaultIndexedDB';
import { GoogleDriveService, requestGoogleDriveToken } from '../services/googleDriveService';

interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  // Auth State & Google Login
  authUser: User | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<void>;
  signInWithFingerprintUser: (userObj: { uid: string; displayName: string; email: string; photoURL?: string }) => void;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;
  requestLogout: () => void;
  logout: () => Promise<void>;
  deleteUserAccountAndData: () => Promise<void>;

  // Navigation & Theme
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  deviceViewMode: 'responsive' | 'windows' | 'android';
  setDeviceViewMode: (mode: 'responsive' | 'windows' | 'android') => void;
  
  // Profile & Settings
  profile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  settings: UserSettings;
  updateSettings: (updated: Partial<UserSettings>) => void;
  
  // Collections State
  universityProfile: UniversityProfile | null;
  academicSessions: AcademicSession[];
  faculties: Faculty[];
  academicHolidays: AcademicHoliday[];
  
  updateUniversityProfile: (updated: Partial<UniversityProfile>) => void;
  
  addAcademicSession: (session: Omit<AcademicSession, 'id' | 'userId' | 'createdAt'>) => void;
  updateAcademicSession: (id: string, updated: Partial<AcademicSession>) => void;
  deleteAcademicSession: (id: string) => void;
  
  addFaculty: (faculty: Omit<Faculty, 'id' | 'userId' | 'createdAt'>) => void;
  updateFaculty: (id: string, updated: Partial<Faculty>) => void;
  deleteFaculty: (id: string) => void;
  
  addAcademicHoliday: (holiday: Omit<AcademicHoliday, 'id' | 'userId'>) => void;
  updateAcademicHoliday: (id: string, updated: Partial<AcademicHoliday>) => void;
  deleteAcademicHoliday: (id: string) => void;

  subjects: Subject[];
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'userId' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  tasks: Task[];
  attendance: AttendanceRecord[];
  timetable: TimetableSlot[];
  exams: Exam[];
  assignments: Assignment[];
  notes: Note[];
  vaultFiles: VaultFile[];
  vaultFolders: VaultFolder[];
  vaultActivities: VaultActivity[];
  googleDriveToken: string | null;
  setGoogleDriveToken: (token: string | null) => void;
  connectGoogleDrive: () => Promise<void>;
  disconnectGoogleDrive: () => void;
  studySessions: StudySession[];
  goals: Goal[];
  chatMessages: ChatMessage[];
  automations: Automation[];
  setAutomations: React.Dispatch<React.SetStateAction<Automation[]>>;
  integrations: Integration[];
  updateIntegration: (id: string, partial: Partial<Integration>) => void;
  activityTimeline: ActivityEvent[];
  addActivityEvent: (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => void;


  // CRUD Actions
  addSubject: (subject: Omit<Subject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateSubject: (id: string, updated: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => void;
  updateTask: (id: string, updated: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  addAttendanceRecord: (record: Omit<AttendanceRecord, 'id' | 'userId' | 'createdAt'>) => void;
  updateAttendanceRecord: (id: string, updated: Partial<AttendanceRecord>) => void;
  deleteAttendanceRecord: (id: string) => void;

  addTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'userId'>) => void;
  updateTimetableSlot: (id: string, updated: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;

  addExam: (exam: Omit<Exam, 'id' | 'userId' | 'createdAt'>) => void;
  updateExam: (id: string, updated: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  addAssignment: (assignment: Omit<Assignment, 'id' | 'userId' | 'createdAt'>) => void;
  updateAssignment: (id: string, updated: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  addNote: (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updated: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  togglePinNote: (id: string) => void;

  addVaultFile: (file: Omit<VaultFile, 'id' | 'userId' | 'uploadedAt' | 'modifiedAt' | 'isOfflineAvailable'> & { isOfflineAvailable?: boolean }) => void;
  updateVaultFile: (id: string, updated: Partial<VaultFile>) => void;
  deleteVaultFile: (id: string) => void;
  saveFileOffline: (fileId: string, blobData?: Blob | string) => Promise<void>;
  removeOfflineCopy: (fileId: string) => Promise<void>;

  addVaultFolder: (folder: Omit<VaultFolder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateVaultFolder: (id: string, updated: Partial<VaultFolder>) => void;
  deleteVaultFolder: (id: string) => void;

  logVaultActivity: (action: VaultActivity['action'], fileName: string, source: VaultActivity['storageSource']) => void;
  clearVaultActivities: () => void;

  addStudySession: (session: Omit<StudySession, 'id' | 'userId' | 'createdAt'>) => void;
  updateStudySession: (id: string, updated: Partial<StudySession>) => void;
  deleteStudySession: (id: string) => void;

  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => void;
  updateGoal: (id: string, updated: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;

  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChatMessages: () => void;

  // Onboarding & Data Tools
  showOnboarding: boolean;
  setShowOnboarding: (show: boolean) => void;
  completeOnboarding: (name: string, university: string, semester: string) => void;
  resetAllData: () => void;
  exportData: () => string;
  importData: (json: string) => boolean;

  // Knowledge Base
  kbDocuments: KnowledgeBaseDocument[];
  indexDocument: (vaultFileId: string, subjectId?: string, fileData?: string, mimeType?: string) => Promise<void>;
  removeDocumentFromIndex: (vaultFileId: string) => Promise<void>;

  // Toast System
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultStudentUser = {
  uid: 'std_veronica_2026',
  displayName: 'Academic Student',
  email: 'student@veronica.edu',
  photoURL: '',
} as User;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const requestLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [deviceViewMode, setDeviceViewMode] = useState<'responsive' | 'windows' | 'android'>('responsive');

  const [profile, setProfileState] = useState<UserProfile>(() => StorageService.getProfile());
  const [settings, setSettingsState] = useState<UserSettings>(() => StorageService.getSettings());

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
      if (user) {
        setProfileState((prev) => {
          const updated = {
            ...prev,
            id: user.uid,
            name: prev.name || user.displayName || 'Student User',
            email: user.email || prev.email || '',
          };
          StorageService.saveProfile(updated);
          return updated;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
    } finally {
      setAuthLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    setAuthLoading(true);
    try {
      await signUpWithEmail(email, password, name);
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Trigger Supabase OAuth directly
      await loginWithGoogle();
      // Note: OAuth redirects, so we don't handle user state here. 
      // onAuthStateChanged will pick it up on redirect back.
    } catch (error: any) {
      console.error('Sign In Error:', error);
      throw error;
    }
  };

  const signInWithFingerprintUser = (userObj: { uid: string; displayName: string; email: string; photoURL?: string }) => {
    const user = {
      uid: userObj.uid,
      displayName: userObj.displayName,
      email: userObj.email,
      photoURL: userObj.photoURL || '',
    };

    setAuthUser(user as unknown as User);

    setProfileState((prev) => {
      const updated = {
        ...prev,
        id: user.uid,
        name: user.displayName || prev.name || 'Fingerprint Student',
        email: user.email || prev.email || '',
        avatarUrl: user.photoURL || prev.avatarUrl || '',
      };
      StorageService.saveProfile(updated);
      return updated;
    });

    showToast(`Welcome back, ${user.displayName}! (Fingerprint Auth)`, 'success');
  };

  const logout = async () => {
    try {
      await logoutUser();
      setAuthUser(null);
      showToast('Signed out successfully', 'info');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Failed to sign out', 'error');
    }
  };

  // Data Collections initialized strictly from local storage (NO DEMO DATA)
  const [subjects, setSubjects] = useState<Subject[]>(() => StorageService.getSubjects());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => StorageService.getNotifications());
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.getTasks());
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => StorageService.getAttendance());
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => StorageService.getTimetable());
  const [exams, setExams] = useState<Exam[]>(() => StorageService.getExams());
  const [assignments, setAssignments] = useState<Assignment[]>(() => StorageService.getAssignments());
  const [notes, setNotes] = useState<Note[]>(() => StorageService.getNotes());
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>(() => StorageService.getVaultFiles());
  const [vaultFolders, setVaultFolders] = useState<VaultFolder[]>(() => StorageService.getVaultFolders());
  const [vaultActivities, setVaultActivities] = useState<VaultActivity[]>(() => StorageService.getVaultActivities());
  const { kbDocuments, indexDocument, removeDocument: removeDocumentFromIndex } = useKnowledgeBase(profile.id, settings.ai.geminiApiKey);
  const [googleDriveToken, setGoogleDriveTokenState] = useState<string | null>(() => {
    const saved = localStorage.getItem('veronica_gdrive_token');
    if (saved) {
      GoogleDriveService.setAccessToken(saved);
    }
    return saved;
  });
  const [studySessions, setStudySessions] = useState<StudySession[]>(() => StorageService.getStudySessions());
  const [universityProfile, setUniversityProfile] = useState<UniversityProfile | null>(() => StorageService.getUniversityProfile ? StorageService.getUniversityProfile() : null);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>(() => StorageService.getAcademicSessions ? StorageService.getAcademicSessions() : []);
  const [faculties, setFaculties] = useState<Faculty[]>(() => StorageService.getFaculties ? StorageService.getFaculties() : []);
  const [academicHolidays, setAcademicHolidays] = useState<AcademicHoliday[]>(() => StorageService.getAcademicHolidays ? StorageService.getAcademicHolidays() : []);
  const [goals, setGoals] = useState<Goal[]>(() => StorageService.getGoals());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => StorageService.getChatMessages());
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'google_drive', provider: 'google_drive', status: 'disconnected' },
    { id: 'google_calendar', provider: 'google_calendar', status: 'disconnected' },
    { id: 'github', provider: 'github', status: 'disconnected' }
  ]);
  const [activityTimeline, setActivityTimeline] = useState<ActivityEvent[]>([]);

  const updateIntegration = (id: string, partial: Partial<Integration>) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, ...partial } : i));
  };

  const addActivityEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    setActivityTimeline(prev => [newEvent, ...prev]);
  };


  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => !profile.isOnboarded && profile.name === '');
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Apply Theme Mode class to <html> document root
  useEffect(() => {
    const applyTheme = () => {
      const root = document.documentElement;
      let effectiveTheme = settings.theme;
      if (effectiveTheme === 'system') {
        effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      
      // Handle Accent Color
      const accents = ['theme-indigo', 'theme-emerald', 'theme-rose', 'theme-amber', 'theme-blue'];
      root.classList.remove(...accents);
      if (settings.accentColor) {
        root.classList.add('theme-' + settings.accentColor);
      }
    };
    applyTheme();

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [settings.theme, settings.accentColor]);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Profile & Settings Handlers
  const updateProfile = (updated: Partial<UserProfile>) => {
    setProfileState((prev) => {
      const newProf = { ...prev, ...updated };
      StorageService.saveProfile(newProf);
      return newProf;
    });
  };

  const updateSettings = (updated: Partial<UserSettings>) => {
    setSettingsState((prev) => {
      const newSet = { ...prev, ...updated };
      StorageService.saveSettings(newSet);
      return newSet;
    });
  };

  // University & Academic Handlers
  const updateUniversityProfile = (updated: Partial<UniversityProfile>) => {
    setUniversityProfile((prev) => {
      const newProf: UniversityProfile = {
        id: prev?.id || 'uni_' + Date.now(),
        userId: profile.id || 'user_local_primary',
        name: updated.name ?? prev?.name ?? '',
        ...prev,
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      StorageService.saveUniversityProfile(newProf);
      return newProf;
    });
    showToast('University profile updated', 'success');
  };

  const addAcademicSession = (session: Omit<AcademicSession, 'id' | 'userId' | 'createdAt'>) => {
    const newSession: AcademicSession = {
      ...session,
      id: 'as_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
    };
    setAcademicSessions((prev) => {
      const next = [newSession, ...prev];
      StorageService.saveAcademicSessions(next);
      return next;
    });
    showToast(`Academic Session "${session.name}" added`, 'success');
  };

  const updateAcademicSession = (id: string, updated: Partial<AcademicSession>) => {
    setAcademicSessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updated } : s));
      StorageService.saveAcademicSessions(next);
      return next;
    });
    showToast('Academic session updated', 'success');
  };

  const deleteAcademicSession = (id: string) => {
    setAcademicSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      StorageService.saveAcademicSessions(next);
      return next;
    });
    showToast('Academic session deleted', 'info');
  };

  const addFaculty = (faculty: Omit<Faculty, 'id' | 'userId' | 'createdAt'>) => {
    const newFaculty: Faculty = {
      ...faculty,
      id: 'fac_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
    };
    setFaculties((prev) => {
      const next = [newFaculty, ...prev];
      StorageService.saveFaculties(next);
      return next;
    });
    showToast(`Faculty member "${faculty.name}" added`, 'success');
  };

  const updateFaculty = (id: string, updated: Partial<Faculty>) => {
    setFaculties((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...updated } : f));
      StorageService.saveFaculties(next);
      return next;
    });
    showToast('Faculty information updated', 'success');
  };

  const deleteFaculty = (id: string) => {
    setFaculties((prev) => {
      const next = prev.filter((f) => f.id !== id);
      StorageService.saveFaculties(next);
      return next;
    });
    showToast('Faculty member removed', 'info');
  };

  const addAcademicHoliday = (holiday: Omit<AcademicHoliday, 'id' | 'userId'>) => {
    const newHol: AcademicHoliday = {
      ...holiday,
      id: 'hol_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
    };
    setAcademicHolidays((prev) => {
      const next = [newHol, ...prev];
      StorageService.saveAcademicHolidays(next);
      return next;
    });
    showToast(`Holiday/Event "${holiday.name}" added`, 'success');
  };

  const updateAcademicHoliday = (id: string, updated: Partial<AcademicHoliday>) => {
    setAcademicHolidays((prev) => {
      const next = prev.map((h) => (h.id === id ? { ...h, ...updated } : h));
      StorageService.saveAcademicHolidays(next);
      return next;
    });
    showToast('Holiday updated', 'success');
  };

  const deleteAcademicHoliday = (id: string) => {
    setAcademicHolidays((prev) => {
      const next = prev.filter((h) => h.id !== id);
      StorageService.saveAcademicHolidays(next);
      return next;
    });
    showToast('Holiday removed', 'info');
  };

  // CRUD Handlers with local storage persistence
  const addSubject = (subj: Omit<Subject, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newSubj: Subject = {
      ...subj,
      id: 'subj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSubjects((prev) => {
      const updated = [newSubj, ...prev];
      StorageService.saveSubjects(updated);
      return updated;
    });
    showToast(`Subject "${subj.name}" added successfully`, 'success');
  };

  const updateSubject = (id: string, updated: Partial<Subject>) => {
    setSubjects((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updated, updatedAt: new Date().toISOString() } : s));
      StorageService.saveSubjects(next);
      return next;
    });
    showToast('Subject updated', 'success');
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => {
      const next = prev.filter((s) => s.id !== id);
      StorageService.saveSubjects(next);
      return next;
    });
    showToast('Subject deleted', 'info');
  };

  // Task Handlers
  const addNotification = (n: Omit<AppNotification, 'id' | 'userId' | 'createdAt'>) => {
    const newN: AppNotification = {
      ...n,
      id: crypto.randomUUID(),
      userId: authUser?.uid || 'local-user',
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => {
      const next = [newN, ...prev];
      StorageService.saveNotifications(next);
      return next;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      StorageService.saveNotifications(next);
      return next;
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const next = prev.filter(n => n.id !== id);
      StorageService.saveNotifications(next);
      return next;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    StorageService.saveNotifications([]);
  };

  const addTask = (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => {
      const next = [newTask, ...prev];
      StorageService.saveTasks(next);
      return next;
    });
    showToast('Task created', 'success');
  };

  const updateTask = (id: string, updated: Partial<Task>) => {
    setTasks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updated } : t));
      StorageService.saveTasks(next);
      return next;
    });
    showToast('Task updated', 'success');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      StorageService.saveTasks(next);
      return next;
    });
    showToast('Task removed', 'info');
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id === id) {
          const newStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
          return { ...t, status: newStatus };
        }
        return t;
      });
      StorageService.saveTasks(next);
      return next;
    });
  };

  // Attendance Handlers
  const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id' | 'userId' | 'createdAt'>) => {
    const newRec: AttendanceRecord = {
      ...record,
      id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
    };
    setAttendance((prev) => {
      const next = [newRec, ...prev];
      StorageService.saveAttendance(next);
      return next;
    });
    showToast('Attendance logged', 'success');
  };

  const updateAttendanceRecord = (id: string, updated: Partial<AttendanceRecord>) => {
    setAttendance((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updated } : a));
      StorageService.saveAttendance(next);
      return next;
    });
    showToast('Attendance updated', 'success');
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendance((prev) => {
      const next = prev.filter((a) => a.id !== id);
      StorageService.saveAttendance(next);
      return next;
    });
    showToast('Attendance record deleted', 'info');
  };

  // Timetable Handlers
  const addTimetableSlot = (slot: Omit<TimetableSlot, 'id' | 'userId'>) => {
    const newSlot: TimetableSlot = {
      ...slot,
      id: 'time_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
    };
    setTimetable((prev) => {
      const next = [...prev, newSlot];
      StorageService.saveTimetable(next);
      return next;
    });
    showToast('Class slot added to timetable', 'success');
  };

  const updateTimetableSlot = (id: string, updated: Partial<TimetableSlot>) => {
    setTimetable((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updated } : s));
      StorageService.saveTimetable(next);
      return next;
    });
    showToast('Timetable updated', 'success');
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable((prev) => {
      const next = prev.filter((s) => s.id !== id);
      StorageService.saveTimetable(next);
      return next;
    });
    showToast('Slot removed', 'info');
  };

  // Exam Handlers
  const addExam = (exam: Omit<Exam, 'id' | 'userId' | 'createdAt'>) => {
    const newExam: Exam = {
      ...exam,
      id: 'exam_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
    };
    setExams((prev) => {
      const next = [newExam, ...prev];
      StorageService.saveExams(next);
      return next;
    });
    showToast('Exam scheduled', 'success');
  };

  const updateExam = (id: string, updated: Partial<Exam>) => {
    setExams((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...updated } : e));
      StorageService.saveExams(next);
      return next;
    });
    showToast('Exam details updated', 'success');
  };

  const deleteExam = (id: string) => {
    setExams((prev) => {
      const next = prev.filter((e) => e.id !== id);
      StorageService.saveExams(next);
      return next;
    });
    showToast('Exam deleted', 'info');
  };

  // Assignment Handlers
  const addAssignment = (assignment: Omit<Assignment, 'id' | 'userId' | 'createdAt'>) => {
    const newAssn: Assignment = {
      ...assignment,
      id: 'assn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
    };
    setAssignments((prev) => {
      const next = [newAssn, ...prev];
      StorageService.saveAssignments(next);
      return next;
    });
    showToast('Assignment added', 'success');
  };

  const updateAssignment = (id: string, updated: Partial<Assignment>) => {
    setAssignments((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...updated } : a));
      StorageService.saveAssignments(next);
      return next;
    });
    showToast('Assignment updated', 'success');
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => {
      const next = prev.filter((a) => a.id !== id);
      StorageService.saveAssignments(next);
      return next;
    });
    showToast('Assignment removed', 'info');
  };

  // Note Handlers
  const addNote = (note: Omit<Note, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newNote: Note = {
      ...note,
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => {
      const next = [newNote, ...prev];
      StorageService.saveNotes(next);
      return next;
    });
    showToast('Note saved', 'success');
  };

  const updateNote = (id: string, updated: Partial<Note>) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, ...updated, updatedAt: new Date().toISOString() } : n));
      StorageService.saveNotes(next);
      return next;
    });
    showToast('Note updated', 'success');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      StorageService.saveNotes(next);
      return next;
    });
    showToast('Note deleted', 'info');
  };

  const togglePinNote = (id: string) => {
    setNotes((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
      StorageService.saveNotes(next);
      return next;
    });
  };

  // Google Drive Handlers
  const setGoogleDriveToken = (token: string | null) => {
    setGoogleDriveTokenState(token);
    GoogleDriveService.setAccessToken(token);
    if (token) {
      localStorage.setItem('veronica_gdrive_token', token);
      showToast('Google Drive connected', 'success');
    } else {
      localStorage.removeItem('veronica_gdrive_token');
    }
  };

  const connectGoogleDrive = async () => {
    try {
      showToast('Opening Google Drive authorization...', 'info');
      const token = await requestGoogleDriveToken();
      setGoogleDriveTokenState(token);
      GoogleDriveService.setAccessToken(token);
      localStorage.setItem('veronica_gdrive_token', token);
      showToast('Google Drive connected successfully!', 'success');
    } catch (err: any) {
      console.error('Google Drive Connection Error:', err);
      showToast('Failed to connect Google Drive: ' + (err?.message || 'Authorization cancelled'), 'error');
    }
  };

  const disconnectGoogleDrive = () => {
    setGoogleDriveTokenState(null);
    GoogleDriveService.setAccessToken(null);
    localStorage.removeItem('veronica_gdrive_token');
    showToast('Google Drive disconnected', 'info');
  };

  // Activity Logger
  const logVaultActivity = (action: VaultActivity['action'], fileName: string, source: VaultActivity['storageSource']) => {
    const act: VaultActivity = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      action,
      fileName,
      storageSource: source,
      timestamp: new Date().toISOString(),
    };
    setVaultActivities((prev) => {
      const next = [act, ...prev.slice(0, 99)]; // Keep latest 100 activities
      StorageService.saveVaultActivities(next);
      return next;
    });
  };

  const clearVaultActivities = () => {
    setVaultActivities([]);
    StorageService.saveVaultActivities([]);
    showToast('Vault activity history cleared', 'info');
  };

  // Vault Handlers
  const addVaultFile = (file: Omit<VaultFile, 'id' | 'userId' | 'uploadedAt' | 'modifiedAt' | 'isOfflineAvailable'> & { isOfflineAvailable?: boolean }) => {
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();
    const newFile: VaultFile = {
      ...file,
      id: fileId,
      userId: profile.id || 'user_local_primary',
      uploadedAt: now,
      modifiedAt: now,
      isOfflineAvailable: file.isOfflineAvailable ?? (file.storageSource === 'local'),
    };

    // If file has raw data, cache in IndexedDB if offline available
    if (file.fileData && newFile.isOfflineAvailable) {
      vaultIndexedDB.saveBlob(fileId, file.fileData);
    }

    setVaultFiles((prev) => {
      const next = [newFile, ...prev];
      StorageService.saveVaultFiles(next);
      return next;
    });

    logVaultActivity('uploaded', file.name, file.storageSource);
    showToast(`File "${file.name}" saved to Vault`, 'success');
  };

  const updateVaultFile = (id: string, updated: Partial<VaultFile>) => {
    setVaultFiles((prev) => {
      const next = prev.map((f) => {
        if (f.id === id) {
          const mod = { ...f, ...updated, modifiedAt: new Date().toISOString() };
          if (updated.name && updated.name !== f.name) {
            logVaultActivity('renamed', updated.name, f.storageSource);
          }
          if (updated.folderId !== undefined && updated.folderId !== f.folderId) {
            logVaultActivity('moved', f.name, f.storageSource);
          }
          return mod;
        }
        return f;
      });
      StorageService.saveVaultFiles(next);
      return next;
    });
    showToast('Vault file updated', 'success');
  };

  const deleteVaultFile = (id: string) => {
    const file = vaultFiles.find((f) => f.id === id);
    if (file) {
      logVaultActivity('deleted', file.name, file.storageSource);
    }
    // Remove local IndexedDB blob if exists
    vaultIndexedDB.deleteBlob(id);

    setVaultFiles((prev) => {
      const next = prev.filter((f) => f.id !== id);
      StorageService.saveVaultFiles(next);
      return next;
    });
    showToast('File removed from Vault', 'info');
  };

  const saveFileOffline = async (fileId: string, blobData?: Blob | string) => {
    const file = vaultFiles.find((f) => f.id === fileId);
    if (!file) return;

    if (blobData) {
      await vaultIndexedDB.saveBlob(fileId, blobData);
    } else if (file.fileData) {
      await vaultIndexedDB.saveBlob(fileId, file.fileData);
    }

    updateVaultFile(fileId, { isOfflineAvailable: true });
    logVaultActivity('saved_offline', file.name, file.storageSource);
    showToast(`"${file.name}" saved for offline access ✓`, 'success');
  };

  const removeOfflineCopy = async (fileId: string) => {
    const file = vaultFiles.find((f) => f.id === fileId);
    if (!file) return;

    await vaultIndexedDB.deleteBlob(fileId);
    updateVaultFile(fileId, { isOfflineAvailable: false });
    logVaultActivity('removed_offline', file.name, file.storageSource);
    showToast(`Removed offline copy for "${file.name}". Remote file unchanged.`, 'info');
  };

  // Vault Folder Handlers
  const addVaultFolder = (folder: Omit<VaultFolder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    const newFolder: VaultFolder = {
      ...folder,
      id: 'folder_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setVaultFolders((prev) => {
      const next = [newFolder, ...prev];
      StorageService.saveVaultFolders(next);
      return next;
    });
    logVaultActivity('created_folder', folder.name, folder.storageSource);
    showToast(`Folder "${folder.name}" created`, 'success');
  };

  const updateVaultFolder = (id: string, updated: Partial<VaultFolder>) => {
    setVaultFolders((prev) => {
      const next = prev.map((f) => (f.id === id ? { ...f, ...updated, updatedAt: new Date().toISOString() } : f));
      StorageService.saveVaultFolders(next);
      return next;
    });
    showToast('Folder updated', 'success');
  };

  const deleteVaultFolder = (id: string) => {
    setVaultFolders((prev) => {
      const next = prev.filter((f) => f.id !== id);
      StorageService.saveVaultFolders(next);
      return next;
    });
    // Unassign files in this folder
    setVaultFiles((prev) => {
      const next = prev.map((f) => (f.folderId === id ? { ...f, folderId: null } : f));
      StorageService.saveVaultFiles(next);
      return next;
    });
    showToast('Folder deleted', 'info');
  };

  // Study Session Handlers
  const addStudySession = (session: Omit<StudySession, 'id' | 'userId' | 'createdAt'>) => {
    const newSession: StudySession = {
      ...session,
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
    };
    setStudySessions((prev) => {
      const next = [newSession, ...prev];
      StorageService.saveStudySessions(next);
      return next;
    });
    showToast(`Study session recorded (${session.actualDuration}m)`, 'success');
  };

  const updateStudySession = (id: string, updated: Partial<StudySession>) => {
    setStudySessions((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updated } : s));
      StorageService.saveStudySessions(next);
      return next;
    });
    showToast('Study session updated', 'success');
  };

  const deleteStudySession = (id: string) => {
    setStudySessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      StorageService.saveStudySessions(next);
      return next;
    });
    showToast('Study session removed', 'info');
  };

  // Goal Handlers
  const addGoal = (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goal,
      id: 'goal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: profile.id || 'user_local_primary',
      createdAt: new Date().toISOString(),
    };
    setGoals((prev) => {
      const next = [newGoal, ...prev];
      StorageService.saveGoals(next);
      return next;
    });
    showToast('Goal created', 'success');
  };

  const updateGoal = (id: string, updated: Partial<Goal>) => {
    setGoals((prev) => {
      const next = prev.map((g) => (g.id === id ? { ...g, ...updated } : g));
      StorageService.saveGoals(next);
      return next;
    });
    showToast('Goal updated', 'success');
  };

  const deleteGoal = (id: string) => {
    setGoals((prev) => {
      const next = prev.filter((g) => g.id !== id);
      StorageService.saveGoals(next);
      return next;
    });
    showToast('Goal deleted', 'info');
  };

  // Chat Handlers
  const addChatMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => {
      const next = [...prev, newMsg];
      StorageService.saveChatMessages(next);
      return next;
    });
  };

  const clearChatMessages = () => {
    setChatMessages([]);
    StorageService.saveChatMessages([]);
    showToast('Chat history cleared', 'info');
  };

  // Onboarding
  const completeOnboarding = (name: string, university: string, semester: string) => {
    const updatedProf: UserProfile = {
      ...profile,
      name,
      university,
      semester,
      isOnboarded: true,
    };
    setProfileState(updatedProf);
    StorageService.saveProfile(updatedProf);
    setShowOnboarding(false);
    showToast(`Welcome to VERONICA, ${name || 'Student'}!`, 'success');
  };

  // Data Tools
  const deleteUserAccountAndData = async () => {
    try {
      await deleteUserCloudAccount();
    } catch (e) {
      console.warn('Cloud account deletion error:', e);
    }

    try {
      StorageService.clearAllUserEverywhere();
    } catch (e) {
      console.warn('Storage clear error:', e);
    }

    setAuthUser(null);
    setProfileState(defaultProfile);
    setSettingsState(defaultSettings);
    setSubjects([]);
    setTasks([]);
    setAttendance([]);
    setTimetable([]);
    setExams([]);
    setAssignments([]);
    setNotes([]);
    setVaultFiles([]);
    setVaultFolders([]);
    setVaultActivities([]);
    setStudySessions([]);
    setUniversityProfile(null);
    setAcademicSessions([]);
    setFaculties([]);
    setAcademicHolidays([]);
    setGoals([]);
    setChatMessages([]);
    setGoogleDriveTokenState(null);
    setShowOnboarding(true);

    showToast('Account and all user data have been permanently deleted from cloud and local storage.', 'info');
  };

  const resetAllData = () => {
    StorageService.clearAllData();
    setProfileState(defaultProfile);
    setSettingsState(defaultSettings);
    setSubjects([]);
    setTasks([]);
    setAttendance([]);
    setTimetable([]);
    setExams([]);
    setAssignments([]);
    setNotes([]);
    setVaultFiles([]);
    setStudySessions([]);
    setGoals([]);
    setChatMessages([]);
    setShowOnboarding(true);
    showToast('All local application data reset', 'warning');
  };

  const exportData = () => {
    return StorageService.exportAllData();
  };

  const importData = (json: string): boolean => {
    const success = StorageService.importAllData(json);
    if (success) {
      setProfileState(StorageService.getProfile());
      setSettingsState(StorageService.getSettings());
      setSubjects(StorageService.getSubjects());
      setTasks(StorageService.getTasks());
      setAttendance(StorageService.getAttendance());
      setTimetable(StorageService.getTimetable());
      setExams(StorageService.getExams());
      setAssignments(StorageService.getAssignments());
      setNotes(StorageService.getNotes());
      setVaultFiles(StorageService.getVaultFiles());
      setStudySessions(StorageService.getStudySessions());
      setGoals(StorageService.getGoals());
      setChatMessages(StorageService.getChatMessages());
      showToast('Data imported successfully!', 'success');
    } else {
      showToast('Failed to parse backup JSON file', 'error');
    }
    return success;
  };

  return (
    <AppContext.Provider
      value={{
        notifications,
        addNotification,
        markNotificationRead,
        deleteNotification,
        clearAllNotifications,
        authUser,
        authLoading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInWithFingerprintUser,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        requestLogout,
        logout,
        activeScreen,
        setActiveScreen,
        searchQuery,
        setSearchQuery,
        deviceViewMode,
        setDeviceViewMode,
        profile,
        updateProfile,
        settings,
        updateSettings,
        universityProfile,
        academicSessions,
        faculties,
        academicHolidays,
        updateUniversityProfile,
        addAcademicSession,
        updateAcademicSession,
        deleteAcademicSession,
        addFaculty,
        updateFaculty,
        deleteFaculty,
        addAcademicHoliday,
        updateAcademicHoliday,
        deleteAcademicHoliday,
        subjects,
        tasks,
        attendance,
        timetable,
        exams,
        assignments,
        notes,
        vaultFiles,
        vaultFolders,
        vaultActivities,
        kbDocuments,
        indexDocument,
        removeDocumentFromIndex,
        googleDriveToken,
        setGoogleDriveToken,
        connectGoogleDrive,
        disconnectGoogleDrive,
        studySessions,
        goals,
        chatMessages,
        automations,
        setAutomations,
        integrations,
        updateIntegration,
        activityTimeline,
        addActivityEvent,

        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addAttendanceRecord,
        updateAttendanceRecord,
        deleteAttendanceRecord,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        addExam,
        updateExam,
        deleteExam,
        addAssignment,
        updateAssignment,
        deleteAssignment,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        addVaultFile,
        updateVaultFile,
        deleteVaultFile,
        saveFileOffline,
        removeOfflineCopy,
        addVaultFolder,
        updateVaultFolder,
        deleteVaultFolder,
        logVaultActivity,
        clearVaultActivities,
        addStudySession,
        updateStudySession,
        deleteStudySession,
        addGoal,
        updateGoal,
        deleteGoal,
        addChatMessage,
        clearChatMessages,
        showOnboarding,
        setShowOnboarding,
        completeOnboarding,
        resetAllData,
        deleteUserAccountAndData,
        exportData,
        importData,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
