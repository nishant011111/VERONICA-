const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

// Add import for resetPasswordForEmail
code = code.replace(
  "import { useApp } from '../../context/AppContext';",
  "import { useApp } from '../../context/AppContext';\nimport { resetPasswordForEmail } from '../../services/supabaseAuth';\nimport { showToast } from '../ui/ToastContainer';"
);

// Add states
code = code.replace(
  "const [password, setPassword] = useState('');",
  "const [password, setPassword] = useState('');\n  const [showForgotPassword, setShowForgotPassword] = useState(false);\n  const [resetEmailSent, setResetEmailSent] = useState(false);"
);

// Add handler
const handlerCode = `
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
      setError(err?.message || 'Failed to send password reset email.');
    } finally {
      setAuthLoading(false);
    }
  };
`;
code = code.replace(
  "const handleEmailLogin = async (e: React.FormEvent) => {",
  handlerCode + "\n  const handleEmailLogin = async (e: React.FormEvent) => {"
);

// Replace the form
const forgotPasswordForm = `
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
`;

const originalFormRegex = /<form onSubmit=\{handleEmailLogin\}[\s\S]*?<\/form>/;
code = code.replace(originalFormRegex, forgotPasswordForm);

// Ensure the "Already have an account?" logic is hidden during password reset
code = code.replace(
  /<div className="text-center mt-3 mb-2">\s*<button type="button" onClick=\{\(\) => setIsSignUp\(!isSignUp\)\}/g,
  '{!showForgotPassword && (<div className="text-center mt-3 mb-2"><button type="button" onClick={() => setIsSignUp(!isSignUp)}'
);
code = code.replace(
  /\{\s*isSignUp \? 'Already have an account\? Sign in' : "Don't have an account\? Sign up"\s*\}\s*<\/button>\s*<\/div>/g,
  '{isSignUp ? \'Already have an account? Sign in\' : "Don\'t have an account? Sign up"}</button></div>)}'
);

fs.writeFileSync('src/components/auth/LoginScreen.tsx', code);
