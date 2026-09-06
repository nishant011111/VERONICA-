import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Lock,
  GraduationCap,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  BrainCircuit,
  Fingerprint,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { resetPasswordForEmail } from '../../services/firebase';

import { FingerprintAuthModal } from './FingerprintAuthModal';


const parseAuthError = (err: any, fallbackMessage: string) => {
  const msg = err?.message || '';
  if (msg.includes('auth/requests-from-referer') && msg.includes('are-blocked')) {
    return 'Configuration Error: Your Google Cloud API Key is restricting access from this domain. Please go to Google Cloud Console -> APIs & Services -> Credentials -> Edit your Firebase API Key, and add this URL to "Website restrictions" (HTTP referrers), or remove the restriction.';
  }
  if (msg.includes('auth/unauthorized-domain')) {
    return 'Configuration Error: This domain is not authorized for OAuth. Please go to Firebase Console -> Authentication -> Settings -> Authorized domains, and add this URL.';
  }
  return msg || fallbackMessage;
};

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithFingerprintUser, showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [name, setName] = useState('');

  
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    try {
      setAuthLoading(true);
      setError(null);
      await resetPasswordForEmail(email);
      setResetEmailSent(true);
      showToast('Password reset email sent. Check your inbox.', 'success');
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(parseAuthError(err, 'Failed to send password reset email.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setAuthLoading(true);
      setError(null);
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      console.error('Email auth error:', err);
      setError(parseAuthError(err, 'Authentication failed. Please try again.'));
    } finally {
      setAuthLoading(false);
    }
  };
  const [error, setError] = useState<string | null>(null);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [fingerprintMode, setFingerprintMode] = useState<'authenticate' | 'register'>('authenticate');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing authentication. Please try again.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setError('Previous sign-in attempt was cancelled. Please click again.');
      } else {
        setError(parseAuthError(err, 'Failed to sign in with Google. Please check your connection and try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintSuccess = (user: { uid: string; displayName: string; email: string; photoURL?: string }) => {
    signInWithFingerprintUser(user);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Branding */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">
            V
          </div>
          <div>
            <span className="font-extrabold text-base tracking-wider uppercase text-white flex items-center gap-2">
              VERONICA
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Workspace
              </span>
            </span>
            <p className="text-xs text-slate-400">Academic & Study Companion</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/50">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>OAuth SSO Protected</span>
        </div>
      </header>

      {/* Main Authentication Center Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 max-w-7xl w-full mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-center w-full">
          
          {/* Left Column: Product Value Highlights */}
          <div className="lg:col-span-7 space-y-8 pr-0 lg:pr-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart Student Management & AI Assistant</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Your entire academic journey in <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-sky-400 bg-clip-text text-transparent">one secure hub</span>.
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Please sign in with your Google account to unlock your personal timetable, course notes, attendance manager, document vault, and <strong className="text-white">Ask Veronica AI Assistant</strong>.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Ask Veronica AI</h3>
                <p className="text-xs text-slate-400">Contextual academic AI assistant to answer course questions & summarize notes.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Planner & Timetable</h3>
                <p className="text-xs text-slate-400">Smart daily schedule, class timetable, exams, and assignment trackers.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Attendance Analytics</h3>
                <p className="text-xs text-slate-400">Track subject attendance percentages, threshold warnings, and class logs.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">Study Vault & Notes</h3>
                <p className="text-xs text-slate-400">PDF reader, subject notes, syllabus documents, and Google Drive syncing.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Sign In Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
                <p className="text-xs text-slate-400">
                  Authentication is required to open Veronica and protect your academic records.
                </p>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">

              
            {showForgotPassword ? (
              <form onSubmit={handleForgotPassword} className="space-y-4 mb-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-white">Reset Password</h3>
                  <p className="text-sm text-slate-400 mt-2">Enter your email address and we'll send you a link to reset your password.</p>
                </div>
                
                {resetEmailSent ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-200">Email Sent!</h4>
                      <p className="text-xs text-emerald-400/80 mt-1">Check your inbox for the password reset link.</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-300 ml-1">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500" placeholder="student@example.com" />
                  </div>
                )}
                
                {!resetEmailSent && (
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-75"
                  >
                    {authLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <span>Send Reset Link</span>}
                  </button>
                )}
                
                <div className="text-center mt-3">
                  <button type="button" onClick={() => { setShowForgotPassword(false); setResetEmailSent(false); setError(null); }} className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors">
                    Back to Sign In
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEmailLogin} className="space-y-4 mb-4">
                {isSignUp && (
                  <div>
                    <label className="text-xs font-bold text-slate-300 ml-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500" placeholder="John Doe" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-bold text-slate-300 ml-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500" placeholder="student@example.com" />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1 ml-1">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    {!isSignUp && (
                      <button type="button" onClick={() => setShowForgotPassword(true)} className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-indigo-500" placeholder="••••••••" />
                </div>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all disabled:opacity-75"
                >
                  {authLoading ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <span>{isSignUp ? 'Create Account' : 'Sign In with Email'}</span>}
                </button>
              </form>
            )}

              
              {!showForgotPassword && (<div className="text-center mt-3 mb-2"><button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors">
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}</button></div>)}
              
              

                  {!showForgotPassword && (
<>
{/* Divider OR */}
                  <div className="relative flex items-center justify-center my-4">
                    <div className="border-t border-slate-700/80 w-full"></div>
                    <span className="bg-slate-800/90 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                      OR CONTINUE WITH
                    </span>
                    <div className="border-t border-slate-700/80 w-full"></div>
                  </div>

                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        <span>Authenticating with Google...</span>
                      </>
                    ) : (
                      <>
                        {/* Official Google SVG Icon */}
                        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>Sign in with Google</span>
                      </>
                    )}
                  </button>

                  {/* Divider OR */}
                  <div className="relative flex items-center justify-center my-2">
                    <div className="border-t border-slate-700/80 w-full"></div>
                    <span className="bg-slate-800/90 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                      OR BIOMETRICS
                    </span>
                    <div className="border-t border-slate-700/80 w-full"></div>
                  </div>

                  {/* Fingerprint / Touch ID Sign In Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setFingerprintMode('authenticate');
                      setShowFingerprintModal(true);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] cursor-pointer"
                  >
                    <Fingerprint className="w-5 h-5 text-emerald-300" />
                    <span>Sign In with Fingerprint / Touch ID</span>
                  </button>

                  {/* Enroll New Fingerprint Shortcut */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFingerprintMode('register');
                        setShowFingerprintModal(true);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Enroll new Fingerprint key on device</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Single click Google SSO or WebAuthn Fingerprint</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Instant automatic profile synchronization</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Hardware passkey biometric privacy protection</span>
                    </div>
                  </div>
                </>
              )}
              </div>
              <div className="border-t border-slate-700/60 pt-4 text-center mt-4">
                <p className="text-[11px] text-slate-500">
                  By logging in, you unlock access to Veronica's AI features, attendance calculator, and study planner.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-4 text-center text-xs text-slate-500">
        Veronica Academic AI Workspace &copy; {new Date().getFullYear()} — Nishant
      </footer>

      {/* Fingerprint / Biometrics Auth Modal */}
      <FingerprintAuthModal
        isOpen={showFingerprintModal}
        mode={fingerprintMode}
        onClose={() => setShowFingerprintModal(false)}
        onSuccess={handleFingerprintSuccess}
      />
    </div>
  );
};
