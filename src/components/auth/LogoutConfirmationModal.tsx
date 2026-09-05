import React, { useState } from 'react';
import { LogOut, AlertTriangle, X, ShieldAlert, Loader2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LogoutConfirmationModal: React.FC = () => {
  const { authUser, profile, isLogoutModalOpen, setIsLogoutModalOpen, logout } = useApp();
  const [loggingOut, setLoggingOut] = useState(false);

  if (!isLogoutModalOpen) return null;

  const handleConfirmLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-6 overflow-hidden">
        {/* Top Decorative Warning Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-red-500" />

        {/* Close Button */}
        <button
          onClick={() => setIsLogoutModalOpen(false)}
          disabled={loggingOut}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Confirm Sign Out</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Log out of Veronica?
            </h3>
          </div>
        </div>

        {/* Description & User Profile Preview */}
        <div className="space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to log out? Veronica workspace, course records, and AI features will be locked until you sign in again.
          </p>

          {/* Account Details Box */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            {authUser?.photoURL ? (
              <img
                src={authUser.photoURL}
                alt={authUser.displayName || 'User Avatar'}
                className="w-10 h-10 rounded-xl object-cover border border-slate-300 dark:border-slate-600"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                {authUser?.displayName ? authUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {authUser?.displayName || profile.name || 'Student Account'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {authUser?.email || profile.email || 'Authenticated user'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Options */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setIsLogoutModalOpen(false)}
            disabled={loggingOut}
            className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleConfirmLogout}
            disabled={loggingOut}
            className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging Out...</span>
              </>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Yes, Log Out</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
