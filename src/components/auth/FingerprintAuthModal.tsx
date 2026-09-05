import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, AlertCircle, Loader2, X, CheckCircle2, Sparkles, KeyRound } from 'lucide-react';
import { authenticateWithFingerprint, registerFingerprintCredential, isWebAuthnSupported } from '../../services/webAuthnService';

interface FingerprintAuthModalProps {
  isOpen: boolean;
  mode: 'authenticate' | 'register';
  onClose: () => void;
  onSuccess: (user: { uid: string; displayName: string; email: string; photoURL?: string }) => void;
}

export const FingerprintAuthModal: React.FC<FingerprintAuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSuccess,
}) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [registerName, setRegisterName] = useState('Academic Student');
  const [registerEmail, setRegisterEmail] = useState('student@veronica.edu');

  if (!isOpen) return null;

  const handleStartScan = async () => {
    setStatus('scanning');
    setErrorMessage(null);

    try {
      if (mode === 'register') {
        const cred = await registerFingerprintCredential(registerName, registerEmail);
        setStatus('success');
        setTimeout(() => {
          onSuccess({
            uid: cred.id,
            displayName: cred.userName,
            email: cred.email,
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          });
          onClose();
        }, 1200);
      } else {
        const cred = await authenticateWithFingerprint();
        setStatus('success');
        setTimeout(() => {
          onSuccess({
            uid: cred.id,
            displayName: cred.userName,
            email: cred.email,
            photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          });
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      console.error('Biometric Auth Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Fingerprint authorization failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                {mode === 'register' ? 'Enroll Fingerprint' : 'Fingerprint Auth'}
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'register' ? 'Register biometric key on this device' : 'Touch sensor to sign in'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Biometric Scanner Visualizer */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Glowing Aura Rings */}
            <div
              className={`absolute -inset-4 rounded-full blur-xl transition-all duration-700 ${
                status === 'scanning'
                  ? 'bg-emerald-500/40 animate-pulse scale-110'
                  : status === 'success'
                  ? 'bg-indigo-500/50 scale-125'
                  : status === 'error'
                  ? 'bg-rose-500/40'
                  : 'bg-emerald-500/20'
              }`}
            ></div>

            {/* Sensor Circle */}
            <button
              type="button"
              onClick={handleStartScan}
              disabled={status === 'scanning'}
              className={`relative w-28 h-28 rounded-3xl flex items-center justify-center border-2 transition-all cursor-pointer transform active:scale-95 ${
                status === 'scanning'
                  ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-2xl shadow-emerald-500/50'
                  : status === 'success'
                  ? 'bg-indigo-900/80 border-indigo-400 text-indigo-300'
                  : status === 'error'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-slate-800/90 border-emerald-500/50 text-emerald-400 hover:border-emerald-400 hover:bg-slate-800'
              }`}
            >
              {status === 'scanning' ? (
                <div className="relative flex flex-col items-center gap-1">
                  <Loader2 className="w-12 h-12 animate-spin text-emerald-400" />
                  <span className="text-[10px] font-mono font-bold text-emerald-300 tracking-wider">SCANNING</span>
                </div>
              ) : status === 'success' ? (
                <CheckCircle2 className="w-14 h-14 text-indigo-400 animate-bounce" />
              ) : status === 'error' ? (
                <AlertCircle className="w-14 h-14 text-rose-400" />
              ) : (
                <Fingerprint className="w-16 h-16 text-emerald-400 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-sm font-bold text-white">
              {status === 'scanning'
                ? 'Touch fingerprint sensor on device...'
                : status === 'success'
                ? 'Biometric Verification Passed!'
                : status === 'error'
                ? 'Authentication Failed'
                : 'Click sensor to scan fingerprint'}
            </h4>
            <p className="text-xs text-slate-400 max-w-xs">
              {status === 'scanning'
                ? 'Verifying hardware passkey with Touch ID / Fingerprint reader.'
                : status === 'success'
                ? 'Access granted to Veronica Academic OS.'
                : status === 'error'
                ? errorMessage
                : 'Uses WebAuthn hardware security to sign in instantly.'}
            </p>
          </div>
        </div>

        {/* Inputs for registration mode */}
        {mode === 'register' && status === 'idle' && (
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Student Name</label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Student Email</label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {status === 'idle' && (
            <button
              type="button"
              onClick={handleStartScan}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Fingerprint className="w-5 h-5" />
              <span>{mode === 'register' ? 'Register Fingerprint Key' : 'Scan Fingerprint Now'}</span>
            </button>
          )}

          {status === 'error' && (
            <button
              type="button"
              onClick={handleStartScan}
              className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Try Scanning Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FingerprintAuthModal;
