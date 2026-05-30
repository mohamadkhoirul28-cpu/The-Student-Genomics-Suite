import { demoDatasets } from '../../data/demoDatasets';
import { DemoDataset } from '../../types';
import { PawPrint, Bug, Microscope, Layers, Database } from 'lucide-react';

interface DemoSelectorProps {
  onSelectDataset: (dataset: DemoDataset) => void;
  selectedId?: string;
}

export default function DemoSelector({
  onSelectDataset,
  selectedId
}: DemoSelectorProps) {
  
  // Dynamic Icon Renderer
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Deer':
        return <PawPrint className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'Bug':
        return <Bug className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      case 'Microscope':
        return <Microscope className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Layers className="w-4 h-4 text-teal-500" />
        <h3 className="text-sm font-bold text-teal-950 dark:text-teal-50">
          Or explore with a curated demo dataset
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {demoDatasets.map((dataset) => {
          const isSelected = selectedId === dataset.id;
          return (
            <div
              key={dataset.id}
              className={`p-5 rounded-xl border transition-all duration-350 flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 shadow-md ring-1 ring-teal-500'
                  : 'border-slate-200 dark:border-teal-900 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-700 shadow-xs hover:shadow-md'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-lg ${
                    dataset.iconName === 'Deer'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30'
                      : dataset.iconName === 'Bug'
                      ? 'bg-amber-50 dark:bg-amber-950/30'
                      : 'bg-blue-50 dark:bg-blue-950/30'
                  }`}>
                    {renderIcon(dataset.iconName)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 dark:text-teal-50 leading-tight">
                      {dataset.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                      {dataset.tagline}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed min-h-[3rem]">
                  {dataset.description}
                </p>

                {/* Details list */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                    {dataset.sampleCount} Samples
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                    Avg Length ~{dataset.avgLength} bp
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-teal-900">
                <button
                  type="button"
                  onClick={() => onSelectDataset(dataset)}
                  className={`w-full text-center py-2 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs animate-pulse'
                      : 'border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-950/20'
                  }`}
                >
                  {isSelected ? 'Dataset Loaded' : 'Load Demo Dataset'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
