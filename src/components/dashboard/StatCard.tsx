import { ElementType } from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  percentage?: string;
  isPositive?: boolean;
  icon: ElementType;
  colorClass?: string;
}

export default function StatCard({
  title,
  value,
  percentage,
  isPositive = true,
  icon: Icon,
  colorClass = 'text-teal-500 bg-teal-50 dark:bg-teal-950/40'
}: StatCardProps) {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-teal-100 dark:border-teal-900 shadow-xs hover:shadow-md transition-all duration-300 flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700/80 dark:text-teal-300/80">
          {title}
        </p>
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold font-sans tracking-tight text-teal-900 dark:text-teal-50">
            {value}
          </span>
          {percentage && (
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-sm ${
              isPositive 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
            }`}>
              {percentage}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
          Terbaru sesi ini
        </p>
      </div>
      
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
