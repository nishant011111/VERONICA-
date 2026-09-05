import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 \${
            variant === 'danger' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500' :
            variant === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500' :
            'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500'
          }`}>
            {variant === 'danger' ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            {message}
          </div>
          
          <div className="flex gap-3 w-full">
            <Button variant="ghost" onClick={onCancel} className="flex-1 font-semibold">
              {cancelText}
            </Button>
            <Button 
              variant={variant === 'danger' ? 'danger' : 'primary'} 
              onClick={onConfirm} 
              className="flex-1 font-semibold"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
