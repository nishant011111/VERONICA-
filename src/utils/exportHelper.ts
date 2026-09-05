import { Task, AttendanceRecord, Note, Subject, Exam, Assignment } from '../types';

/**
 * Escapes a field for CSV format (wraps in quotes if contains commas, quotes, or newlines).
 */
export const escapeCSV = (value: any): string => {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Triggers browser download of a blob file.
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Helper to get subject name by subjectId
 */
const getSubjectName = (subjectId: string | undefined, subjects: Subject[]): string => {
  if (!subjectId) return 'General';
  const found = subjects.find((s) => s.id === subjectId);
  return found ? `${found.name} (${found.code})` : subjectId;
};

/**
 * Converts Tasks to CSV
 */
export const exportTasksToCSV = (tasks: Task[], subjects: Subject[]): string => {
  const headers = [
    'ID',
    'Title',
    'Description',
    'Subject',
    'Date',
    'Start Time',
    'Duration (Min)',
    'Priority',
    'Status',
    'Reminder',
    'Recurrence',
    'Created At',
  ];

  const rows = tasks.map((t) => [
    t.id,
    t.title,
    t.description || '',
    getSubjectName(t.subjectId, subjects),
    t.date,
    t.startTime || '',
    t.duration || '',
    t.priority,
    t.status,
    t.reminder ? 'Yes' : 'No',
    t.recurrence || 'none',
    t.createdAt,
  ]);

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ];

  return csvLines.join('\n');
};

/**
 * Converts Attendance Records to CSV
 */
export const exportAttendanceToCSV = (attendance: AttendanceRecord[], subjects: Subject[]): string => {
  const headers = [
    'Record ID',
    'Subject Code',
    'Subject Name',
    'Date',
    'Status',
    'Notes / Remarks',
    'Recorded At',
  ];

  const rows = attendance.map((a) => {
    const subject = subjects.find((s) => s.id === a.subjectId);
    return [
      a.id,
      subject?.code || '',
      subject?.name || a.subjectId,
      a.date,
      a.status.toUpperCase(),
      a.notes || '',
      a.createdAt,
    ];
  });

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ];

  return csvLines.join('\n');
};

/**
 * Converts Notes to CSV
 */
export const exportNotesToCSV = (notes: Note[], subjects: Subject[]): string => {
  const headers = [
    'Note ID',
    'Title',
    'Subject',
    'Is Pinned',
    'Tags',
    'Content',
    'Created At',
    'Last Updated',
  ];

  const rows = notes.map((n) => [
    n.id,
    n.title,
    getSubjectName(n.subjectId, subjects),
    n.isPinned ? 'Yes' : 'No',
    Array.isArray(n.tags) ? n.tags.join('; ') : '',
    n.content || '',
    n.createdAt,
    n.updatedAt,
  ]);

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ];

  return csvLines.join('\n');
};

/**
 * Converts Combined Academic Records (Tasks, Attendance, Notes) to a combined CSV sheet with section markers
 */
export const exportAllAcademicToCSV = (
  tasks: Task[],
  attendance: AttendanceRecord[],
  notes: Note[],
  subjects: Subject[]
): string => {
  const sections: string[] = [];

  // Section 1: Tasks
  sections.push('=== ACADEMIC TASKS ===');
  sections.push(exportTasksToCSV(tasks, subjects));
  sections.push('\n');

  // Section 2: Attendance Records
  sections.push('=== ATTENDANCE RECORDS ===');
  sections.push(exportAttendanceToCSV(attendance, subjects));
  sections.push('\n');

  // Section 3: Notes
  sections.push('=== ACADEMIC NOTES ===');
  sections.push(exportNotesToCSV(notes, subjects));

  return sections.join('\n');
};
