import { Exam, Task, StudySession, Subject, SyllabusTopic, UserSettings } from '../../types';

export interface StudyRecommendation {
  subjectId: string;
  topicId?: string;
  topicTitle: string;
  durationMinutes: number;
  priority: 'low' | 'medium' | 'high';
  reason: string;
  type: 'revision' | 'practice' | 'learning' | 'assignment' | 'exam_prep';
  taskId?: string;
  examId?: string;
}

export interface PlannerContext {
  userId: string;
  exams: Exam[];
  tasks: Task[];
  studySessions: StudySession[];
  subjects: Subject[];
  settings: UserSettings;
}

export interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface DayPlan {
  date: string; // YYYY-MM-DD
  sessions: StudySession[];
}

export interface TopicScore {
  subjectId: string;
  topic: SyllabusTopic;
  score: number;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}
