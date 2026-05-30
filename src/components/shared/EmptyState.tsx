import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-teal-900/60 shadow-2xs max-w-xl mx-auto my-6 animate-scaleIn">
      <div className="p-3 bg-teal-50 dark:bg-slate-900/60 text-teal-600 dark:text-teal-400 rounded-full mb-4">
        {icon || <HelpCircle className="w-8 h-8" />}
      </div>
      <h3 className="text-sm font-bold text-teal-950 dark:text-teal-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
