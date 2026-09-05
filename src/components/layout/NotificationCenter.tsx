import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, X, Check, Trash2, Calendar, Clock, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { AppNotification } from '../../types';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationRead, deleteNotification, clearAllNotifications } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const getIcon = (type: AppNotification['type']) => {
    switch(type) {
      case 'task': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'deadline': return <Calendar className="w-4 h-4 text-rose-500" />;
      case 'reminder': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'sync': return <Check className="w-4 h-4 text-blue-500" />;
      case 'security': return <Shield className="w-4 h-4 text-indigo-500" />;
      case 'system': return <AlertTriangle className="w-4 h-4 text-slate-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] transition-colors relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 items-center justify-center text-[8px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-[#1A1A1A] bg-slate-50 dark:bg-[#111111]">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearAllNotifications}
                className="text-xs text-slate-500 hover:text-rose-500 transition-colors font-medium"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center">
                <Bell className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm text-slate-500 font-medium">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-[#1A1A1A]">
                {notifications.map(n => (
                  <div key={n.id} className={`p-3 transition-colors ${n.isRead ? 'opacity-70' : 'bg-indigo-50/50 dark:bg-indigo-900/10'}`}>
                    <div className="flex gap-3">
                      <div className="pt-0.5">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {!n.isRead && (
                          <button onClick={() => markNotificationRead(n.id)} className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-1.5 py-0.5 rounded font-medium text-slate-600 dark:text-slate-300 transition-colors">
                            Mark read
                          </button>
                        )}
                        <button onClick={() => deleteNotification(n.id)} className="p-1 text-slate-400 hover:text-rose-500 transition-colors mt-auto">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
