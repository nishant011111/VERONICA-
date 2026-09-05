import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverEffect = false,
  glass = true,
}) => {
  const baseClass = glass
    ? 'glass-panel rounded-2xl p-5 shadow-sm transition-all duration-200'
    : 'bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1A1A1A] rounded-2xl p-5 shadow-sm transition-all duration-200';

  const hoverClass = hoverEffect
    ? 'hover:border-indigo-500/40 hover:shadow-md dark:hover:border-indigo-500/40 hover:-translate-y-0.5 cursor-pointer'
    : '';

  return (
    <div className={`${baseClass} ${hoverClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
};
