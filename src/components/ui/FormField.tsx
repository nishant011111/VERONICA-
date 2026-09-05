import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  className = '',
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300 uppercase">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-rose-500 font-medium">{error}</p>
      )}
    </div>
  );
};
