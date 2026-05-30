import { Upload, BarChart3, Eye, FileText, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      step: '1',
      title: 'Upload',
      description: 'Drag & drop your sequence files',
      icon: Upload,
    },
    {
      step: '2',
      title: 'Analyze',
      description: 'Run diversity and alignment analysis',
      icon: BarChart3,
    },
    {
      step: '3',
      title: 'Visualize',
      description: 'Explore interactive trees and charts',
      icon: Eye,
    },
    {
      step: '4',
      title: 'Report',
      description: 'Export results and insights',
      icon: FileText,
    },
  ];

  return (
    <div className="py-12 border-t border-slate-200 dark:border-teal-900/40">
      <h3 className="text-lg md:text-xl font-bold text-center text-teal-950 dark:text-teal-50 mb-10 leading-snug">
        How It Works
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={item.step} className="flex flex-col items-center text-center relative group">
              {/* Connector line on desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] h-0.5 bg-slate-200 dark:bg-teal-900/40" />
              )}
              
              <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-900 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold mb-4 relative z-10 transition-colors group-hover:border-teal-500 duration-300">
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-1">
                Step {item.step}
              </span>
              <h4 className="text-sm font-bold text-teal-950 dark:text-teal-50 mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
