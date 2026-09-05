import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIProviderType } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FormField } from '../ui/FormField';
import { StudentProfileCard } from '../profile/StudentProfileCard';
import { vaultIndexedDB } from '../../services/vaultIndexedDB';
import { GEMINI_PRIMARY_MODEL } from '../../services/ai/config';
import {
  downloadFile,
  exportTasksToCSV,
  exportAttendanceToCSV,
  exportNotesToCSV,
  exportAllAcademicToCSV,
} from '../../utils/exportHelper';
import {
  User,
  Sun,
  Moon,
  Laptop,
  Bell,
  Shield,
  HardDrive,
  Cloud,
  FolderLock,
  Sparkles,
  Database,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Lock,
  FileJson,
  FileSpreadsheet,
  CheckSquare,
  CalendarCheck,
  BookOpen,
  Layers,
  Fingerprint,
  ShieldAlert,
} from 'lucide-react';
import { FingerprintAuthModal } from '../auth/FingerprintAuthModal';
import { DeleteAccountModal } from '../profile/DeleteAccountModal';
import { SystemHealthCenter } from './settings/SystemHealthCenter';
import { PrivacyCenter } from './settings/PrivacyCenter';


export const SettingsScreen: React.FC = () => {
  const {
    profile,
    updateProfile,
    settings,
    updateSettings,
    exportData,
    importData,
    resetAllData,
    showToast,
    vaultFiles,
    googleDriveToken,
    connectGoogleDrive,
    disconnectGoogleDrive,
    authUser,
    requestLogout,
    deleteUserAccountAndData,
    tasks,
    attendance,
    notes,
    subjects,
  } = useApp();

  const [name, setName] = useState(profile.name || '');
  const [university, setUniversity] = useState(profile.university || '');
  const [degree, setDegree] = useState(profile.degree || '');
  const [semester, setSemester] = useState(profile.semester || '');
  const [academicYear, setAcademicYear] = useState(profile.academicYear || '');

  // Biometrics Modal State
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [fingerprintMode, setFingerprintMode] = useState<'authenticate' | 'register'>('register');
  const [hasFingerprintCred, setHasFingerprintCred] = useState(() => !!localStorage.getItem('veronica_fingerprint_cred'));

  // Delete Account Modal State
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  // Export State
  const [exportCategory, setExportCategory] = useState<'all' | 'tasks' | 'attendance' | 'notes'>('all');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');

  // Storage Stats
  const [localStorageBytes, setLocalStorageBytes] = useState(0);

  useEffect(() => {
    async function calcStorage() {
      const bytes = await vaultIndexedDB.getTotalStorageUsage();
      setLocalStorageBytes(bytes);
    }
    calcStorage();
  }, [vaultFiles]);

  const localFilesCount = vaultFiles.filter((f) => f.storageSource === 'local').length;
  const cloudFilesCount = vaultFiles.filter((f) => f.storageSource === 'cloud').length;
  const driveFilesCount = vaultFiles.filter((f) => f.storageSource === 'drive').length;
  const offlineFilesCount = vaultFiles.filter((f) => f.isOfflineAvailable).length;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Notifications state
  const [notifyStudy, setNotifyStudy] = useState(true);
  const [notifyAssignment, setNotifyAssignment] = useState(true);
  const [notifyExam, setNotifyExam] = useState(true);
  const [notifyAttendance, setNotifyAttendance] = useState(true);

  // AI Provider state
  const [activeProvider, setActiveProvider] = useState<AIProviderType>(settings.ai?.activeProvider || 'gemini');
  const [activeModel, setActiveModel] = useState(settings.ai?.activeModel || GEMINI_PRIMARY_MODEL);
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    async function loadModels() {
        const { AIProviderManager } = await import('../../services/ai/AIProviderManager');
        const models = await AIProviderManager.getAvailableModels(activeProvider, settings.ai);
        setAvailableModels(models);
        if (!models.includes(activeModel)) {
            setActiveModel(models[0] || '');
        }
    }
    loadModels();
  }, [activeProvider]);

  const handleUpdateAI = () => {
    updateSettings({
        ai: {
            ...settings.ai,
            activeProvider: activeProvider as any,
            activeModel: activeModel
        }
    });
    showToast('AI Settings updated!', 'success');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: name.trim(),
      university: university.trim(),
      degree: degree.trim(),
      semester: semester.trim(),
      academicYear: academicYear.trim(),
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          showToast('Database imported successfully!', 'success');
        } else {
          showToast('Invalid backup JSON format.', 'error');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExportData = () => {
    const dateStr = new Date().toISOString().split('T')[0];

    if (exportFormat === 'json') {
      if (exportCategory === 'all') {
        const fullJson = exportData();
        downloadFile(fullJson, `veronica_academic_backup_${dateStr}.json`, 'application/json');
        showToast('Complete academic backup downloaded as JSON', 'success');
      } else if (exportCategory === 'tasks') {
        const content = JSON.stringify({ tasks, exportedAt: new Date().toISOString() }, null, 2);
        downloadFile(content, `veronica_tasks_${dateStr}.json`, 'application/json');
        showToast('Tasks downloaded as JSON file', 'success');
      } else if (exportCategory === 'attendance') {
        const content = JSON.stringify({ attendance, exportedAt: new Date().toISOString() }, null, 2);
        downloadFile(content, `veronica_attendance_${dateStr}.json`, 'application/json');
        showToast('Attendance records downloaded as JSON file', 'success');
      } else if (exportCategory === 'notes') {
        const content = JSON.stringify({ notes, exportedAt: new Date().toISOString() }, null, 2);
        downloadFile(content, `veronica_notes_${dateStr}.json`, 'application/json');
        showToast('Notes downloaded as JSON file', 'success');
      }
    } else {
      // CSV Export
      if (exportCategory === 'tasks') {
        const csv = exportTasksToCSV(tasks, subjects);
        downloadFile(csv, `veronica_tasks_${dateStr}.csv`, 'text/csv');
        showToast(`Exported ${tasks.length} tasks to CSV file`, 'success');
      } else if (exportCategory === 'attendance') {
        const csv = exportAttendanceToCSV(attendance, subjects);
        downloadFile(csv, `veronica_attendance_${dateStr}.csv`, 'text/csv');
        showToast(`Exported ${attendance.length} attendance records to CSV file`, 'success');
      } else if (exportCategory === 'notes') {
        const csv = exportNotesToCSV(notes, subjects);
        downloadFile(csv, `veronica_notes_${dateStr}.csv`, 'text/csv');
        showToast(`Exported ${notes.length} notes to CSV file`, 'success');
      } else if (exportCategory === 'all') {
        const csv = exportAllAcademicToCSV(tasks, attendance, notes, subjects);
        downloadFile(csv, `veronica_academic_master_${dateStr}.csv`, 'text/csv');
        showToast('Master academic dataset exported as CSV file', 'success');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            System Settings & Preferences
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Local data control, themes, notifications, and AI configuration
          </p>
        </div>
        <Badge variant="blue">VERONICA OS v1.0</Badge>
      </div>

      {/* 0. Student Profile & Account Info */}
      <Card glass className="space-y-4 border-indigo-500/30 dark:border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Student Account & Security Profile
            </h3>
          </div>
          <Badge variant="emerald" size="sm">Active Student Workspace</Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {authUser?.photoURL ? (
              <img
                src={authUser.photoURL}
                alt={authUser.displayName || 'User Avatar'}
                className="w-12 h-12 rounded-2xl border-2 border-indigo-500/40 object-cover shadow-md"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                {authUser?.displayName ? authUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {authUser?.displayName || profile.name || 'Academic Student'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {authUser?.email || profile.email || 'student@veronica.edu'}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Veronica local & cloud workspace ready
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="danger"
              onClick={() => setShowDeleteAccountModal(true)}
              className="flex items-center gap-2 text-xs py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white shadow-sm font-bold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account & Data</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* 0.5. Biometric Fingerprint / Touch ID Passkey Section */}
      <Card glass className="space-y-4 border-emerald-500/30 dark:border-emerald-500/20 bg-emerald-500/5">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Biometric Fingerprint & Touch ID Passkey
            </h3>
          </div>
          <Badge variant={hasFingerprintCred ? 'emerald' : 'amber'} size="sm">
            {hasFingerprintCred ? 'Fingerprint Registered' : 'Not Configured'}
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              WebAuthn Hardware Passkey Security
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
              Sign in instantly using your laptop or smartphone's built-in fingerprint reader, Touch ID, or Face ID without typing passwords or relying solely on Google SSO.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setFingerprintMode('register');
                setShowFingerprintModal(true);
              }}
              className="flex items-center gap-2 text-xs py-2 px-3 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{hasFingerprintCred ? 'Re-enroll Fingerprint' : 'Configure Fingerprint'}</span>
            </Button>

            {hasFingerprintCred && (
              <Button
                variant="ghost"
                onClick={() => {
                  setFingerprintMode('authenticate');
                  setShowFingerprintModal(true);
                }}
                className="flex items-center gap-1.5 text-xs py-2 px-3 text-indigo-600 dark:text-indigo-400"
              >
                <span>Test Biometrics</span>
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 1. Account & Academic Profile Section */}
      <div className="space-y-4">
        <StudentProfileCard />
      </div>

      {/* 2. Appearance & Theme Switcher */}
      <Card glass className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Palette className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Accent Color
          </h3>
        </div>
        <div className="flex gap-4">
          {['indigo', 'emerald', 'rose', 'amber', 'blue'].map(color => (
            <button
              key={color}
              onClick={() => updateSettings({ accentColor: color })}
              className={`w-10 h-10 rounded-full border-2 transition-transform ${
                (settings.accentColor || 'indigo') === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'
              }`}
              style={{
                backgroundColor: color === 'indigo' ? '#4f46e5' :
                                 color === 'emerald' ? '#059669' :
                                 color === 'rose' ? '#e11d48' :
                                 color === 'amber' ? '#d97706' :
                                 '#2563eb'
              }}
              title={color.charAt(0).toUpperCase() + color.slice(1)}
            />
          ))}
        </div>
      </Card>

      {/* 2.5 Theme Mode Switcher */}
      <Card glass className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Appearance & Theme
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all ${
              settings.theme === 'dark'
                ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span>Dark Theme (Default)</span>
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all ${
              settings.theme === 'light'
                ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5" />
            <span>Light Theme</span>
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ theme: 'system' })}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 text-xs font-bold transition-all ${
              settings.theme === 'system'
                ? 'bg-blue-600/10 border-blue-500 text-blue-500 shadow-md'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Laptop className="w-5 h-5" />
            <span>System Default</span>
          </button>
        </div>
      </Card>

      {/* 3. Notifications Controls */}
      <Card glass className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Bell className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Academic Notifications & Alerts
          </h3>
        </div>

        <div className="space-y-3">
          {[
            { id: 'study', label: 'Study Timer & Break Reminders', state: notifyStudy, set: setNotifyStudy },
            { id: 'assign', label: 'Assignment Deadline Alerts', state: notifyAssignment, set: setNotifyAssignment },
            { id: 'exam', label: 'Exam Countdown & Revision Reminders', state: notifyExam, set: setNotifyExam },
            { id: 'attend', label: 'Attendance Minimum Threshold Alerts', state: notifyAttendance, set: setNotifyAttendance },
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
              <input
                type="checkbox"
                checked={item.state}
                onChange={(e) => item.set(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* 4. AI Engine & Real Provider Status Panel */}
      <Card glass className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              AI Router & Intelligence Settings
            </h3>
          </div>
          <Badge variant={(settings.ai?.aiMode || 'automatic') === 'offline' ? 'amber' : 'purple'}>
            {(settings.ai?.aiMode || 'automatic').toUpperCase()} MODE
          </Badge>
        </div>

        {/* AI Router Mode Select */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FormField label="Active AI Provider">
            <select
              value={activeProvider}
              onChange={(e) => setActiveProvider(e.target.value as AIProviderType)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value="gemini">Gemini</option>
              <option value="groq">Groq</option>
              <option value="ollama">Ollama</option>
            </select>
          </FormField>
          
          <FormField label="Active Model">
            <select
              value={activeModel}
              onChange={(e) => setActiveModel(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {availableModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </FormField>
        </div>
        
        <div className="flex flex-wrap justify-end gap-3 pt-2">
           <Button onClick={() => window.location.reload()} variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
             Refresh Configuration
           </Button>
           <Button 
             onClick={async () => {
               try {
                 const res = await fetch('/api/ai/health/groq', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ apiKey: settings.ai?.groqApiKey })
                 });
                 const data = await res.json();
                 if (data.available) {
                   showToast('✓ Groq connected', 'success');
                 } else {
                   showToast(`✗ Groq connection failed: ${data.message || data.reason}`, 'error');
                 }
               } catch (e) {
                 showToast('✗ Groq connection failed', 'error');
               }
             }}
             variant="outline"
           >
             Test Groq Connection
           </Button>
           <Button onClick={handleUpdateAI} variant="primary">
             Save AI Settings
           </Button>
        </div>

        {/* Cloud AI Keys & Local Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <FormField label="Groq API Key">
            <input
              type="password"
              value={settings.ai?.groqApiKey || ''}
              onChange={(e) => updateSettings({ ai: { ...settings.ai, groqApiKey: e.target.value } })}
              placeholder="gsk_..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
            />
          </FormField>

          <FormField label="Gemini User Key (Optional)">
            <input
              type="password"
              value={settings.ai?.geminiApiKey || ''}
              onChange={(e) => updateSettings({ ai: { ...settings.ai, geminiApiKey: e.target.value } })}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
            />
          </FormField>

          <FormField label="Local Ollama Endpoint">
            <input
              type="text"
              value={settings.ai?.ollamaHost || ''}
              onChange={(e) => updateSettings({ ai: { ...settings.ai, ollamaHost: e.target.value } })}
              placeholder="http://localhost:11434"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-mono focus:outline-none"
            />
          </FormField>
        </div>

        {/* Real Provider Status Grid */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
            Real AI Provider Connection Status
          </span>
          <AiProviderStatusGrid settings={settings} />
        </div>

        {/* Privacy Banner */}
        <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-500" /> Privacy & Training Guarantee
          </p>
          <p className="opacity-90 leading-relaxed">
            Your personal study notes, documents, and chat messages are not used by Veronica for AI model training. Requests contain only minimal required query context.
          </p>
        </div>
      </Card>

      {/* 5. Storage Provider & Offline Cache Management */}
      <Card glass className="space-y-4 border border-neutral-800">
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
          <HardDrive className="w-5 h-5 text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Storage Management & Provider Metrics
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Local Storage */}
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <HardDrive className="w-4 h-4 text-sky-400" /> 💻 Local Device
              </span>
              <Badge variant="indigo">{localFilesCount} Files</Badge>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              IndexedDB Bytes: <span className="text-sky-300 font-bold">{formatBytes(localStorageBytes)}</span>
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full transition-all"
                style={{ width: `${Math.min((localStorageBytes / (1024 * 1024 * 50)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-500">Fast, local offline storage on device.</p>
          </div>

          {/* Veronica Cloud */}
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <Cloud className="w-4 h-4 text-indigo-400" /> ☁ Veronica Cloud
              </span>
              <Badge variant="indigo">{cloudFilesCount} Files</Badge>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              Encrypted User Isolation Vault
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-400 h-full transition-all"
                style={{ width: `${Math.min((cloudFilesCount / 20) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-neutral-500">Secure cloud database sync.</p>
          </div>

          {/* Google Drive */}
          <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <FolderLock className="w-4 h-4 text-emerald-400" /> Google Drive
              </span>
              <Badge variant={googleDriveToken ? 'emerald' : 'blue'}>
                {googleDriveToken ? 'Connected' : 'OAuth Ready'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>{driveFilesCount} Drive files linked</span>
              {googleDriveToken ? (
                <button
                  type="button"
                  onClick={disconnectGoogleDrive}
                  className="text-red-400 hover:text-red-300 hover:underline font-sans text-[11px]"
                >
                  Disconnect
                </button>
              ) : (
                <button
                  type="button"
                  onClick={connectGoogleDrive}
                  className="text-emerald-400 hover:text-emerald-300 hover:underline font-sans text-[11px] font-bold"
                >
                  Connect Drive
                </button>
              )}
            </div>
            <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-400 h-full transition-all"
                style={{ width: googleDriveToken ? '100%' : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Management Actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-neutral-800/80">
          <button
            onClick={async () => {
              await vaultIndexedDB.clearAllBlobs();
              setLocalStorageBytes(0);
              showToast('Offline cache cleared successfully', 'info');
            }}
            className="px-3.5 py-2 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-400" /> Clear Local Blob Cache
          </button>

          <span className="text-xs text-neutral-500 font-mono">
            {offlineFilesCount} items saved offline
          </span>
        </div>
      </Card>

      {/* 6. Data Controls & Backup / Restore */}
      <Card glass className="space-y-5 border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Academic Data Export & Backup
            </h3>
          </div>
          <Badge variant="emerald">CSV & JSON Ready</Badge>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          VERONICA stores your academic records locally on your device. Easily export your tasks, attendance history, notes, or full backup file into JSON or CSV format for spreadsheet analysis or backup.
        </p>

        {/* Data Summary Quick Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">{tasks.length}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Tasks Recorded</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">{attendance.length}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Attendance Logs</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">{notes.length}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Saved Notes</p>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 dark:text-slate-100">{subjects.length}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Enrolled Subjects</p>
            </div>
          </div>
        </div>

        {/* Category & Format Selectors */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Academic Category:</label>
              <select
                value={exportCategory}
                onChange={(e) => setExportCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              >
                <option value="all">📦 All Academic Data (Combined Dataset)</option>
                <option value="tasks">✅ Tasks & Action Items ({tasks.length})</option>
                <option value="attendance">📊 Attendance Records ({attendance.length})</option>
                <option value="notes">📝 Course Notes ({notes.length})</option>
              </select>
            </div>

            {/* Format Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Export Format:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    exportFormat === 'json'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-indigo-500'
                  }`}
                >
                  <FileJson className="w-4 h-4" />
                  <span>JSON File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExportFormat('csv')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    exportFormat === 'csv'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>CSV File</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="primary"
              onClick={handleExportData}
              icon={<Download className="w-4 h-4" />}
              className="py-2.5 px-5 font-bold text-xs"
            >
              Export {exportCategory === 'all' ? 'All Data' : exportCategory.toUpperCase()} as {exportFormat.toUpperCase()}
            </Button>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-blue-500 cursor-pointer shadow-sm">
                <Upload className="w-4 h-4 text-blue-500" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <Button
                variant="danger"
                onClick={() => setShowDeleteAccountModal(true)}
                icon={<Trash2 className="w-4 h-4" />}
                className="py-2.5 px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
              >
                Delete Account & Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone: Permanent Account & Data Destruction */}
      <Card glass className="space-y-4 border-rose-500/40 dark:border-rose-500/30 bg-rose-500/5">
        <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Danger Zone: Delete User Account
            </h3>
          </div>
          <Badge variant="rose" size="sm">Irreversible Action</Badge>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Permanently Purge Account & All Associated Data
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deletes your Firebase Auth account, Firestore user documents, local data storage, IndexedDB vault files, and biometrics everywhere.
            </p>
          </div>

          <Button
            variant="danger"
            onClick={() => setShowDeleteAccountModal(true)}
            icon={<Trash2 className="w-4 h-4" />}
            className="py-2.5 px-5 font-extrabold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 shrink-0"
          >
            Delete Account & Purge Data
          </Button>
        </div>
      </Card>

      {/* Biometric Fingerprint Auth Modal */}
      <FingerprintAuthModal
        isOpen={showFingerprintModal}
        mode={fingerprintMode}
        onClose={() => {
          setShowFingerprintModal(false);
          setHasFingerprintCred(!!localStorage.getItem('veronica_fingerprint_cred'));
        }}
        onSuccess={(user) => {
          setHasFingerprintCred(true);
          showToast(`Fingerprint Key active for ${user.displayName}!`, 'success');
        }}
      />

      {/* Delete User Account & Data Modal */}
      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        userEmail={authUser?.email || profile.email}
        onConfirmDelete={deleteUserAccountAndData}
      />
    </div>
  );
};

// Component: AiProviderStatusGrid (Real Status Pings)
const AiProviderStatusGrid: React.FC<{ settings: any }> = ({ settings }) => {
  const [statuses, setStatuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const { AIRouter } = await import('../../services/ai/AIRouter');
      const res = await AIRouter.getAllProviderStatuses(settings.ai);
      setStatuses(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, [settings.ai]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
      case 'connected':
      case 'available':
        return {
          label: '● Operational',
          badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
          dotClass: 'bg-emerald-500 animate-pulse'
        };
      case 'auth_failed':
        return {
          label: '○ Authentication failed',
          badgeClass: 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400',
          dotClass: 'bg-rose-500'
        };
      case 'service_unavailable':
      case 'unavailable':
      case 'error':
        return {
          label: '○ Service unavailable',
          badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
          dotClass: 'bg-amber-500'
        };
      case 'offline':
        return {
          label: '○ Offline',
          badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
          dotClass: 'bg-amber-500'
        };
      case 'not_configured':
      case 'key_missing':
      default:
        return {
          label: '○ API key missing',
          badgeClass: 'bg-slate-500/10 border-slate-500/20 text-slate-600 dark:text-slate-400',
          dotClass: 'bg-slate-400'
        };
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statuses.map((item) => {
          const statusInfo = getStatusBadge(item.status);
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border text-xs space-y-2 transition-all bg-slate-100/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900 dark:text-slate-100 truncate">{item.name}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${statusInfo.dotClass}`} />
              </div>

              <div className="space-y-1">
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>

                {item.model && (
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono truncate">
                    Model: <span className="font-semibold">{item.model}</span>
                  </p>
                )}

                {item.latencyMs !== undefined && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Latency: <span className="font-semibold">{item.latencyMs} ms</span>
                  </p>
                )}

                {item.reason && (
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 leading-tight">
                    Reason: {item.reason}
                  </p>
                )}

                {!item.reason && item.message && item.status !== 'operational' && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {item.message}
                  </p>
                )}

                <p className="text-[9px] text-slate-400 dark:text-slate-500 pt-1 font-mono">
                  Checked: {item.lastChecked || 'Just now'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-1">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Sequential verification: Internet → Gemini → Groq → Ollama → Android
        </span>
        <Button
          size="sm"
          variant="primary"
          onClick={fetchStatuses}
          disabled={loading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
        >
          {loading ? 'Testing AI Providers...' : 'Test AI Providers'}
        </Button>
      </div>
    </div>
  );
};

