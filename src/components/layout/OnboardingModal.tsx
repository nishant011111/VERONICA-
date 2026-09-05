import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Sparkles, GraduationCap, BookOpen, Target, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { showOnboarding, setShowOnboarding, completeOnboarding, addSubject, addGoal } = useApp();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [degree, setDegree] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [semester, setSemester] = useState('');

  // Initial Subject entry step
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');

  // Initial Goal entry step
  const [goalTitle, setGoalTitle] = useState('');
  const [goalHours, setGoalHours] = useState('20');

  if (!showOnboarding) return null;

  const handleNextStep = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const finishOnboarding = () => {
    // Save initial subject if filled
    if (subjectName.trim()) {
      addSubject({
        name: subjectName.trim(),
        code: subjectCode.trim() || 'CS101',
        teacher: '',
        credits: 3,
        semester: semester || 'Semester 1',
        color: '#3b82f6',
        icon: 'BookOpen',
        description: 'First subject created during onboarding',
        syllabus: [],
        targetPercentage: 85,
        priority: 'medium',
      });
    }

    // Save initial goal if filled
    if (goalTitle.trim()) {
      addGoal({
        title: goalTitle.trim(),
        type: 'daily_study_hours',
        targetValue: parseInt(goalHours, 10) || 20,
        currentValue: 0,
        unit: 'hours',
        completed: false,
      });
    }

    completeOnboarding(name, university, semester);
  };

  const handleSkip = () => {
    setShowOnboarding(false);
  };

  return (
    <Modal
      isOpen={showOnboarding}
      onClose={handleSkip}
      title="Setup Your Workspace"
      subtitle={`Step ${step} of 6 — Optional setup wizard`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-xl shadow-blue-500/30">
              V
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome to VERONICA
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Your personal AI-powered academic operating system. Designed local-first, privacy-focused, and tailored for focus.
            </p>
          </div>
        )}

        {/* Step 2: Student Name */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              What should we call you?
            </h4>
            <FormField label="Your Preferred Name" hint="How Veronica will greet you">
              <input
                type="text"
                placeholder="e.g., Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>
        )}

        {/* Step 3: University */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              University Information
            </h4>
            <FormField label="University / Institution">
              <input
                type="text"
                placeholder="e.g., Stanford University"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
            <FormField label="Degree / Field of Study">
              <input
                type="text"
                placeholder="e.g., B.S. Computer Science"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>
        )}

        {/* Step 4: Year/Semester */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Academic Year & Semester
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Academic Year">
                <input
                  type="text"
                  placeholder="e.g., 2026-2027"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
              <FormField label="Current Semester">
                <input
                  type="text"
                  placeholder="e.g., Semester 1 / Fall"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 5: Add First Subject */}
        {step === 5 && (
          <div className="space-y-4 py-2">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Add Your First Subject (Optional)
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <FormField label="Subject Name">
                  <input
                    type="text"
                    placeholder="e.g., Data Structures & Algorithms"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </FormField>
              </div>
              <FormField label="Course Code">
                <input
                  type="text"
                  placeholder="e.g., CS201"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>
          </div>
        )}

        {/* Step 6: Study Goal */}
        {step === 6 && (
          <div className="space-y-4 py-2">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Set Initial Study Goal (Optional)
            </h4>
            <FormField label="Goal Description">
              <input
                type="text"
                placeholder="e.g., Weekly Deep Work Focus Target"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
            <FormField label="Target Hours">
              <input
                type="number"
                value={goalHours}
                onChange={(e) => setGoalHours(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </FormField>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Skip setup for now
          </button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="ghost" size="sm" onClick={handlePrevStep} icon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleNextStep}
              icon={step === 6 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            >
              {step === 6 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
