const fs = require('fs');
let code = fs.readFileSync('src/components/auth/LoginScreen.tsx', 'utf8');

const splitPoint = "              {/* Divider OR */}";
const splitIdx = code.indexOf(splitPoint);

if (splitIdx !== -1) {
  const topCode = code.substring(0, splitIdx);
  
  const bottomCode = `              {!showForgotPassword && (
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
`;

  // We need to clean up the bad code that was generated before the splitPoint 
  // Let's just fix the orphaned tags manually below or directly overwrite it.
  fs.writeFileSync('src/components/auth/LoginScreen.tsx', topCode + bottomCode);
  console.log('Rebuilt LoginScreen bottom half');
} else {
  console.log('Split point not found');
}
