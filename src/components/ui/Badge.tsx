import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold rounded-md',
    md: 'px-2.5 py-1 text-xs font-bold rounded-lg',
  };

  const variantStyles = {
    default:
      'bg-slate-100 dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2A2A2A]',
    blue:
      'bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20',
    indigo:
      'bg-indigo-600/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20',
    emerald:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
    amber:
      'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
    rose:
      'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
    purple:
      'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
    slate:
      'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
  };

  return (
    <span className={`inline-flex items-center gap-1 leading-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
