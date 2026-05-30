import React from 'react';

export interface MethodsBadgeProps {
  method: string;
  algorithm: string;
  reference: string;
  bootstrap?: string;
}

export function MethodsBadge({ method, algorithm, reference, bootstrap }: MethodsBadgeProps) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-teal-950 p-3 rounded-lg text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-sans mt-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
        <span className="font-bold text-slate-700 dark:text-slate-200">{method}</span>
      </div>
      <p className="mt-0.5">
        <strong className="text-slate-500">Algorithm/Framework:</strong> {algorithm}
      </p>
      <p className="mt-0.5">
        <strong className="text-slate-500">Academic Citation:</strong> <span className="italic">{reference}</span>
      </p>
      {bootstrap && (
        <p className="mt-0.5">
          <strong className="text-slate-500">Simulations:</strong> {bootstrap}
        </p>
      )}
    </div>
  );
}
