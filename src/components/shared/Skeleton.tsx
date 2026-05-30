import React from 'react';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-205 bg-slate-200 dark:bg-slate-700 ${className}`}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/40 animate-fadeIn">
      <div className="flex items-center justify-between pb-2 border-b border-light">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="flex gap-4 items-center py-1">
            {Array.from({ length: cols }).map((_, cIdx) => (
              <Skeleton
                key={cIdx}
                className={`h-4 ${
                  cIdx === 0 ? 'w-24' : cIdx === 1 ? 'flex-1' : 'w-16'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
