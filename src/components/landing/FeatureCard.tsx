import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export default function FeatureCard({ title, description, icon: Icon }: FeatureCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-teal-900/60 shadow-sm transition-all hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700/80 group">
      <div className="p-3 w-12 h-12 bg-teal-50 dark:bg-teal-950/50 rounded-lg text-teal-600 dark:text-teal-400 mb-4 transition-colors group-hover:bg-teal-500 group-hover:text-white flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-teal-950 dark:text-teal-50 mb-2">
        {title}
      </h3>
      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
