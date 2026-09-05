import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  GraduationCap,
  Award,
  BookOpen,
  Sparkles,
  UserCheck,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Edit3,
  Camera,
  Building2,
  Calendar,
  Hash,
  Mail,
  Share2,
  Check,
  User,
  Star,
  CheckSquare,
  Maximize2,
  Download,
  KeyRound,
  ExternalLink,
  Layers,
  Phone
} from 'lucide-react';
import { UserQrModal } from './UserQrModal';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

interface StudentProfileCardProps {
  compact?: boolean;
  onSaved?: () => void;
  startInEditMode?: boolean;
}

export const StudentProfileCard: React.FC<StudentProfileCardProps> = ({ compact = false, onSaved, startInEditMode = false }) => {
  const { profile, updateProfile, authUser, subjects, tasks, studySessions, attendance, showToast } = useApp();

  const [isEditing, setIsEditing] = useState(startInEditMode);
  
  useEffect(() => {
    setIsEditing(startInEditMode);
  }, [startInEditMode]);
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedQrPayload, setCopiedQrPayload] = useState(false);

  // Form State
  const [name, setName] = useState(profile.name || authUser?.displayName || '');
  const [email, setEmail] = useState(profile.email || authUser?.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [university, setUniversity] = useState(profile.university || '');
  const [degree, setDegree] = useState(profile.degree || '');
  const [major, setMajor] = useState(profile.major || '');
  const [semester, setSemester] = useState(profile.semester || '');
  const [academicYear, setAcademicYear] = useState(profile.academicYear || '');
  const [studentIdNumber, setStudentIdNumber] = useState(profile.studentIdNumber || 'STD-2026-8891');
  const [currentGpa, setCurrentGpa] = useState(profile.currentGpa || '3.85');
  const [targetGpa, setTargetGpa] = useState(profile.targetGpa || '4.00');
  const [bio, setBio] = useState(profile.bio || 'Computer Science Enthusiast & Academic Researcher');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || authUser?.photoURL || '');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Calculate live academic telemetry
  const totalSubjects = subjects.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attendancePct = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

  // Structured payload encoded in user's unique QR Code
  const qrPayload = JSON.stringify({
    v: '1.0',
    type: 'veronica_student_pass',
    id: profile.id || authUser?.uid || 'std_veronica_2026',
    name: name || 'Academic Student',
    email: email || authUser?.email || '',
    studentId: studentIdNumber,
    university: university || 'Veronica Institute',
    degree: degree || 'Computer Science',
    verified: true,
  });

  const handleCopyStudentId = () => {
    navigator.clipboard.writeText(studentIdNumber);
    setCopiedId(true);
    showToast('Student ID copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyQrPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopiedQrPayload(true);
    showToast('QR Verification Payload copied!', 'success');
    setTimeout(() => setCopiedQrPayload(false), 2000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        showToast('Avatar updated successfully!', 'success');
        setShowAvatarPicker(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      university,
      degree,
      major,
      semester,
      academicYear,
      studentIdNumber,
      currentGpa,
      targetGpa,
      bio,
      avatarUrl,
    });
    setIsEditing(false);
    showToast('Student profile updated successfully!', 'success');
    if (onSaved) onSaved();
  };

  return (
    <div className="space-y-6">
      {/* 1. HOLOGRAPHIC DIGITAL ID PASS WITH PROMINENT QR CODE */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-3xl blur-md opacity-25 group-hover:opacity-50 transition duration-500"></div>

        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Card Ambient Glow Highlights */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Top Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/90 pb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-[11px] font-mono font-bold text-indigo-400 tracking-widest uppercase">
                  {university || 'VERONICA ACADEMIC INSTITUTE'}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-white">
                    Digital Student Pass & ID
                  </span>
                  <Badge variant="emerald" size="sm" className="font-semibold shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Verified Student
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Enlarge QR Badge</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
            </div>
          </div>

          {/* Main ID Body: Left Info + Right Prominent QR Display */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            {/* Student Info & Avatar (Lg: 8 cols) */}
            <div className="lg:col-span-8 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar Section */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-indigo-500/30 bg-slate-800 shadow-xl flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name || 'Student Avatar'}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-3xl font-black">
                      {name ? name.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform hover:scale-110 cursor-pointer"
                  title="Change Avatar Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Details Column */}
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {name || 'Student Name'}
                    </h1>
                    {degree && (
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                        {degree}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg leading-relaxed italic">
                    "{bio}"
                  </p>
                </div>

                {/* Info Chips */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{university || 'University Not Set'}</span>
                  </div>

                  <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" />
                    <span>{semester || 'Current Term'} {academicYear ? `(${academicYear})` : ''}</span>
                  </div>
                  
                  {email && (
                    <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>{email}</span>
                    </div>
                  )}

                  {phone && (
                    <div className="px-3 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{phone}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleCopyStudentId}
                    className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Click to copy Student ID"
                  >
                    <Hash className="w-3.5 h-3.5 text-amber-400" />
                    <span>ID: {studentIdNumber}</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Prominently Embedded Unique QR Code Display (Lg: 4 cols) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div
                onClick={() => setShowQrModal(true)}
                className="group/qr relative p-3.5 bg-white rounded-3xl shadow-2xl border-4 border-indigo-500/30 transition-all duration-300 hover:scale-105 cursor-pointer flex flex-col items-center justify-center"
                title="Click to view full-screen digital QR badge"
              >
                {/* QR Hover Backdrop Overlay */}
                <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover/qr:opacity-100 flex flex-col items-center justify-center gap-1 text-white transition-opacity z-10 backdrop-blur-xs">
                  <Maximize2 className="w-6 h-6 text-indigo-400 animate-bounce" />
                  <span className="text-[10px] font-bold tracking-wider uppercase">Expand QR Pass</span>
                </div>

                <QRCodeSVG
                  value={qrPayload}
                  size={120}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#0f172a"
                />

                <div className="mt-2 text-[10px] font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-indigo-600" />
                  <span>Verified QR ID</span>
                </div>
              </div>

              {/* Quick Actions under QR */}
              <div className="flex items-center gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={handleCopyQrPayload}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                >
                  {copiedQrPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{copiedQrPayload ? 'Copied QR Payload' : 'Copy Payload'}</span>
                </button>

                <span className="text-slate-600">•</span>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Badge</span>
                </button>
              </div>
            </div>
          </div>

          {/* Avatar Picker Dropdown */}
          {showAvatarPicker && (
            <div className="p-4 rounded-2xl bg-slate-800/95 border border-slate-700 relative z-20 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Choose Preset Avatar
                </span>
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(url);
                      setShowAvatarPicker(false);
                      showToast('Avatar selected!', 'info');
                    }}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                      avatarUrl === url ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-slate-700'
                    }`}
                  >
                    <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-700/80">
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Or upload image from device:</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-1.5 px-3 text-xs flex items-center justify-center gap-2"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Upload Photo
                  </Button>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-700/80">
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Or enter custom Image URL:</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowAvatarPicker(false);
                      showToast('Custom Avatar URL applied', 'success');
                    }}
                    className="py-1 px-3 text-xs"
                  >
                    Set URL
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. ACADEMIC PERFORMANCE & TELEMETRY COUNTERS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card glass className="p-4 space-y-1 hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Enrolled Courses</span>
            <BookOpen className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {totalSubjects}
          </div>
          <p className="text-[11px] text-slate-500">Active Coursework</p>
        </Card>

        <Card glass className="p-4 space-y-1 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Attendance Rate</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {attendancePct}%
          </div>
          <p className="text-[11px] text-slate-500">{presentClasses} of {totalClasses} classes</p>
        </Card>

        <Card glass className="p-4 space-y-1 hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Tasks Done</span>
            <CheckSquare className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {completedTasks} <span className="text-xs font-normal text-slate-500">/ {totalTasks}</span>
          </div>
          <p className="text-[11px] text-slate-500">Assignments finished</p>
        </Card>

        <Card glass className="p-4 space-y-1 hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Target GPA</span>
            <Star className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {currentGpa} <span className="text-xs font-normal text-slate-500">/ {targetGpa}</span>
          </div>
          <p className="text-[11px] text-slate-500">Academic Target Score</p>
        </Card>
      </div>

      {/* 3. EDIT PROFILE FORM (Shown when editing) */}
      {isEditing && (
        <Card glass className="p-6 border-2 border-indigo-500/30 animate-fadeIn space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Edit Student Details
              </h3>
            </div>
            <span className="text-xs text-slate-500">Changes save instantly to workspace</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Student Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@veronica.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 012-3456"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">University / Institute</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Degree / Course</label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="B.S. Computer Science"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Semester / Term</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Fall 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="Year 3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Student ID Number</label>
                <input
                  type="text"
                  value={studentIdNumber}
                  onChange={(e) => setStudentIdNumber(e.target.value)}
                  placeholder="STD-2026-8891"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Current GPA / CGPA</label>
                <input
                  type="text"
                  value={currentGpa}
                  onChange={(e) => setCurrentGpa(e.target.value)}
                  placeholder="3.85"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Target GPA Goal</label>
                <input
                  type="text"
                  value={targetGpa}
                  onChange={(e) => setTargetGpa(e.target.value)}
                  placeholder="4.00"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Academic Bio / Mission</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief academic goals or specialization..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="py-2 px-4 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="py-2 px-5 text-xs font-bold"
              >
                Save Profile Changes
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Full-Screen Zoom Digital QR Badge Modal */}
      <UserQrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        profile={{
          ...profile,
          name: name || profile.name,
          email: email || profile.email,
          studentIdNumber: studentIdNumber || profile.studentIdNumber,
          university: university || profile.university,
        }}
      />
    </div>
  );
};

export default StudentProfileCard;

