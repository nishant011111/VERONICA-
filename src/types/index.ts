export type ThemeMode = 'dark' | 'light' | 'system';

export type ScreenId =
  | 'home'
  | 'ask_veronica'
  | 'planner'
  | 'subjects'
  | 'attendance'
  | 'timetable'
  | 'exams'
  | 'assignments'
  | 'notes'
  | 'vault'
  | 'study_timer'
  | 'analytics'
  | 'goals'
  | 'settings'
  | 'automations'
  | 'timeline'
  | 'integrations';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  degree: string;
  academicYear: string;
  semester: string;
  isOnboarded: boolean;
  avatarUrl?: string;
  createdAt: string;
  studentIdNumber?: string;
  major?: string;
  targetGpa?: string;
  currentGpa?: string;
  targetAttendance?: number;
  phone?: string;
  bio?: string;
  badgeTitle?: string;
}

export type AIMode = 'automatic' | 'online' | 'local' | 'offline';
export type AIProviderType = 'openai' | 'gemini' | 'groq' | 'ollama';
export type ExplanationLevel = 'beginner' | 'university' | 'advanced';
export type ResponseStyle = 'concise' | 'balanced' | 'detailed';
export type AcademicMode = 'general' | 'physics' | 'mathematics' | 'programming';

export interface DashboardWidget {
  id: string;
  type: 'overview_metrics' | 'schedule' | 'quick_access' | 'subjects' | 'study_goals' | 'recent_notes' | 'upcoming_exams' | 'attendance_summary' | 'ai_assistant' | 'daily_briefing';
  visible: boolean;
  order: number;
  size: 'small' | 'medium' | 'large' | 'full';
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
}

export interface UserSettings {
  theme: ThemeMode;
  accentColor?: string;
  dashboard?: DashboardLayout;
  notifications: {
    studyReminders: boolean;
    assignmentReminders: boolean;
    examReminders: boolean;
    attendanceAlerts: boolean;
    timetableReminders: boolean;
    timetableReminderMinutes: number;
    systemAlerts?: boolean;
    syncAlerts?: boolean;
  };
  privacy: {
    localOnly: boolean;
    telemetry: boolean;
    aiTrainingOptOut: boolean;
  };
  storage: {
    defaultSource: 'local' | 'cloud' | 'drive';
  };
  planner: PlannerSettings;
  ai: {
    aiMode: AIMode;
    activeProvider: AIProviderType;
    activeModel?: string; // Add this
    explanationLevel: ExplanationLevel;
    responseStyle: ResponseStyle;
    saveHistory: boolean;
    memoryEnabled: boolean;
    ollamaHost: string;
    groqApiKey?: string;
    geminiApiKey?: string;
  };
}

export type TopicStatus = 'not_started' | 'learning' | 'practicing' | 'revised' | 'mastered';
export type TopicPriorityLevel = 'low' | 'medium' | 'high';
export type TopicConfidence = 'low' | 'medium' | 'high';

export interface SyllabusTopic {
  id: string;
  title: string;
  unit?: string;
  completed: boolean; // keep for backward compatibility
  status: TopicStatus;
  importance: TopicPriorityLevel;
  difficulty: TopicPriorityLevel;
  confidence: TopicConfidence;
  lastStudied?: string;
  lastRevised?: string;
  nextRevisionDate?: string;
  examRelevance?: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  code: string;
  teacher: string;
  credits: number;
  semester: string;
  color: string; // Hex or tailwind color token
  icon: string;  // Lucide icon identifier
  description: string;
  syllabus: SyllabusTopic[];
  targetPercentage: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  subjectId?: string;
  date: string; // YYYY-MM-DD
  timetableSlotId?: string;
  startTime?: string; // HH:mm
  duration?: number; // in minutes
  priority: TaskPriority;
  status: TaskStatus;
  reminder: boolean;
  recurrence: RecurrenceType;
  notes?: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | 'late';

export interface AttendanceRecord {
  id: string;
  userId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
  createdAt: string;
}

export interface TimetableSlot {
  id: string;
  userId: string;
  subjectId: string;
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  room: string;
  teacher: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'other';
  semesterId?: string;
  notes?: string;
}

export interface Exam {
  id: string;
  userId: string;
  name: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  syllabus?: string;
  notes?: string;
  createdAt: string;
}

export type AssignmentStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';

export interface Assignment {
  id: string;
  userId: string;
  title: string;
  subjectId: string;
  description: string;
  dueDate: string; // YYYY-MM-DDTHH:mm
  priority: TaskPriority;
  status: AssignmentStatus;
  attachments: string[]; // file names or local keys
  notes?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  subjectId?: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VaultFolder {
  id: string;
  userId: string;
  name: string;
  parentId?: string | null;
  storageSource: 'local' | 'cloud' | 'drive';
  driveFolderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaultFile {
  id: string;
  userId: string;
  name: string;
  size: number; // in bytes
  type: string; // pdf | document | image | text | other
  mimeType: string;
  storageSource: 'local' | 'cloud' | 'drive';
  folderId?: string | null;
  subjectId?: string;
  uploadedAt: string;
  modifiedAt: string;
  fileData?: string; // base64 / Data URL preview string
  isOfflineAvailable: boolean;
  driveFileId?: string;
  driveWebViewLink?: string;
  drivePermission?: 'read_only' | 'edit';
  tags?: string[];
}

export interface VaultActivity {
  id: string;
  userId: string;
  action: 'opened' | 'uploaded' | 'renamed' | 'moved' | 'deleted' | 'saved_offline' | 'removed_offline' | 'created_folder';
  fileName: string;
  storageSource: 'local' | 'cloud' | 'drive';
  timestamp: string;
}

export type KnowledgeBaseStatus = 'not_indexed' | 'waiting' | 'processing' | 'indexed' | 'outdated' | 'failed';

export interface KnowledgeBaseDocument {
  id: string;
  userId: string;
  vaultFileId: string;
  subjectId?: string;
  status: KnowledgeBaseStatus;
  processingProgress?: number;
  chunkCount: number;
  lastIndexedAt?: string;
  error?: string;
}

export interface DocumentChunk {
  id: string;
  userId: string;
  documentId: string;
  vaultFileId: string;
  pageNumber?: number;
  section?: string;
  heading?: string;
  content: string;
}

export type KnowledgeSourceScope = 'all' | 'subject' | 'document' | 'documents';

export type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'stopwatch' | 'deep_work';

export type StudySessionStatus = 'planned' | 'started' | 'completed' | 'cancelled' | 'missed';

export interface StudySession {
  id: string;
  userId: string;
  subjectId?: string;
  topic?: string;
  plannedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  startTime?: string;
  endTime?: string;
  status: StudySessionStatus;
  mode?: TimerMode;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type GoalType = 'daily_study_hours' | 'weekly_study_hours' | 'subject_study_hours' | 'exam_target' | 'assignment_completion' | 'personal' | 'topic_completion';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string;
  subjectId?: string;
  completed: boolean;
  createdAt: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  type: 'mcq' | 'short_answer' | 'numerical' | 'conceptual' | 'long_answer';
}

export interface AnswerEvaluation {
  score: number; // 0 - 100
  correctness: 'correct' | 'partially_correct' | 'incorrect';
  summary: string;
  missingConcepts: string[];
  errorsIdentified: string[];
  explanationQuality: string;
  suggestedImprovement: string;
}

export interface PracticeQuestionParams {
  subjectId?: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  type: 'mcq' | 'short_answer' | 'numerical' | 'conceptual' | 'long_answer';
}

export interface AIContextAttachment {
  subjectId?: string;
  noteId?: string;
  vaultFileId?: string;
  assignmentId?: string;
  topic?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'veronica';
  content: string;
  timestamp: string;
  isSystemNotice?: boolean;
  providerUsed?: string;
  modeUsed?: string;
  academicMode?: AcademicMode;
  explanationLevel?: ExplanationLevel;
  sources?: string[];
  practiceQuestions?: PracticeQuestion[];
  evaluation?: AnswerEvaluation;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  academicMode: AcademicMode;
  explanationLevel: ExplanationLevel;
  subjectId?: string;
  messages: ChatMessage[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIProviderStatusInfo {
  id: AIProviderType | 'internet';
  name: string;
  status: 'operational' | 'connected' | 'available' | 'not_configured' | 'offline' | 'unavailable' | 'error';
  model?: string;
  reason?: string;
  message: string;
  latencyMs?: number;
  lastChecked: string;
}


export interface PlannerSettings {
  preferredStudyHoursStart: string; // HH:mm
  preferredStudyHoursEnd: string; // HH:mm
  maxDailyStudyTime: number; // in minutes
  minSessionDuration: number; // in minutes
  preferredSessionLength: number; // in minutes
  pomodoroStudy: number;
  pomodoroShortBreak: number;
  pomodoroLongBreak: number;
  pomodoroCycles: number;
  autoReschedule: boolean;
  aiPlanningEnabled: boolean;
  daysOff: number[]; // 0=Sunday, 1=Monday etc
}

export interface UniversityProfile {
  id: string;
  userId: string;
  name: string;
  collegeName?: string;
  program?: string;
  department?: string;
  batch?: string;
  rollNumber?: string;
  section?: string;
  studentId?: string;
  campus?: string;
  website?: string;
  updatedAt: string;
}

export interface AcademicSession {
  id: string;
  userId: string;
  name: string; // e.g., 2026-27
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface Faculty {
  id: string;
  userId: string;
  name: string;
  subjectIds: string[];
  department?: string;
  email?: string;
  contact?: string;
  notes?: string;
  createdAt: string;
}

export interface AcademicHoliday {
  id: string;
  userId: string;
  name: string;
  date: string;
  type: 'holiday' | 'exam' | 'event' | 'vacation' | 'other';
  notes?: string;
}


export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'deadline' | 'reminder' | 'sync' | 'security' | 'system';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
export type AutomationTrigger = 'time' | 'event' | 'schedule';
export type AutomationAction = 'notify' | 'organize' | 'summarize' | 'create_task';

export interface Automation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  triggerConfig: any;
  action: AutomationAction;
  actionConfig: any;
  status: 'active' | 'paused';
  createdAt: string;
  lastRun?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'create' | 'update' | 'delete' | 'system' | 'automation';
  title: string;
  description: string;
  timestamp: string;
  metadata?: any;
}

export interface Integration {
  id: string;
  provider: 'google_drive' | 'google_calendar' | 'github';
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  accountEmail?: string;
}

export interface AIMemory {
  id: string;
  userId: string;
  content: string;
  category: 'preference' | 'project' | 'fact' | 'instruction';
  createdAt: string;
  updatedAt: string;
}
