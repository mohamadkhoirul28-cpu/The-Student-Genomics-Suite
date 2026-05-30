import { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, MessageCircleCode } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

interface InsightFormProps {
  onGenerate: (params: {
    focus: string; // 'overview' | 'diversity' | 'tree' | 'blast' | 'custom'
    focusArea: string; // 'biological' | 'methodology' | 'next_steps' | 'comparison'
    detail: string; // 'brief' | 'standard' | 'detailed'
    customQuestion: string;
  }) => void;
  isLoading: boolean;
  initialFocus?: string;
  initialFocusArea?: string;
}

export default function InsightForm({
  onGenerate,
  isLoading,
  initialFocus = 'overview',
  initialFocusArea = 'biological'
}: InsightFormProps) {
  const sequences = useAppStore(state => state.getActiveSequences());
  
  const [focus, setFocus] = useState<string>(initialFocus);
  const [focusArea, setFocusArea] = useState<string>(initialFocusArea);
  const [detailValue, setDetailValue] = useState<number>(1); // 0=brief, 1=standard, 2=detailed
  const [customQuestion, setCustomQuestion] = useState<string>('');

  // Synchronize dynamic updates if opened from other sections (e.g. "Ask AI" in DiversityTab)
  useEffect(() => {
    if (initialFocus) setFocus(initialFocus);
    if (initialFocusArea) setFocusArea(initialFocusArea);
  }, [initialFocus, initialFocusArea]);

  const detailLevels = ['brief', 'standard', 'detailed'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      focus,
      focusArea,
      detail: detailLevels[detailValue],
      customQuestion: focus === 'custom' ? customQuestion : ''
    });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/60 p-5 sm:p-6 shadow-sm space-y-5"
    >
      {/* Target Analysis Type */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-teal-950 dark:text-teal-100 uppercase tracking-wider">
          1. Select analysis target to explain:
        </label>
        <select
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-teal-900/60 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
        >
          <option value="overview">Current Dataset Overview (Total samples, length, GC-ratios)</option>
          <option value="diversity">Population Diversity Indices (Hd, π, Polymorphic Sites)</option>
          <option value="tree">Phylogenetic Tree Topology (Bootstrap Support & Branchings)</option>
          <option value="blast">NCBI BLAST Sequence Identification (Identity & E-Values)</option>
          <option value="custom">Ask Custom Academic/Biological Question...</option>
        </select>
      </div>

      {/* Conditional: Custom Question Textarea */}
      {focus === 'custom' && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
            Write down your specific genomic inquiry:
          </label>
          <div className="relative">
            <textarea
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="e.g., Explain what bootstrap support of 95% means on the tree branches? or How can I explain Hd 0.84 and nucleotide diversity 0.012 in Tajima's expansion theory?"
              required
              rows={3}
              className="w-full pl-3.5 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-teal-900/60 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-slate-400 font-sans"
            />
            <MessageCircleCode className="absolute right-3.5 bottom-3.5 w-4.5 h-4.5 text-slate-350 dark:text-slate-500 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Focus Area Radio Grid */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-teal-950 dark:text-teal-100 uppercase tracking-wider">
          2. Analytical focus category:
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Biological Interpretation */}
          <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/55 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-teal-950/40 rounded-lg cursor-pointer transition-colors relative">
            <input
              type="radio"
              name="focusArea"
              value="biological"
              checked={focusArea === 'biological'}
              onChange={() => setFocusArea('biological')}
              className="mt-0.5 text-teal-600 focus:ring-teal-500 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight">Biological Interpretation</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">What do these measurements mean in a population genetics context?</p>
            </div>
          </label>

          {/* Methodology calculation */}
          <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/55 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-teal-950/40 rounded-lg cursor-pointer transition-colors relative">
            <input
              type="radio"
              name="focusArea"
              value="methodology"
              checked={focusArea === 'methodology'}
              onChange={() => setFocusArea('methodology')}
              className="mt-0.5 text-teal-600 focus:ring-teal-500 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight">Methodology Explanation</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">What mathematical models and parameters formulated these statistics?</p>
            </div>
          </label>

          {/* Next Steps Recommendation */}
          <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/55 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-teal-950/40 rounded-lg cursor-pointer transition-colors relative">
            <input
              type="radio"
              name="focusArea"
              value="next_steps"
              checked={focusArea === 'next_steps'}
              onChange={() => setFocusArea('next_steps')}
              className="mt-0.5 text-teal-600 focus:ring-teal-500 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight">Next-Steps Recommendations</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">What supplementary analysis or neutrality tests should be scheduled next?</p>
            </div>
          </label>

          {/* Comparison contextual context */}
          <label className="flex items-start gap-3 p-3 bg-slate-50 hover:bg-slate-100/55 dark:bg-slate-900/30 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-teal-950/40 rounded-lg cursor-pointer transition-colors relative">
            <input
              type="radio"
              name="focusArea"
              value="comparison"
              checked={focusArea === 'comparison'}
              onChange={() => setFocusArea('comparison')}
              className="mt-0.5 text-teal-600 focus:ring-teal-500 shrink-0"
            />
            <div>
              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-tight">Literature Comparison</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-1">How do these indices compare against benchmark peer-reviewed data?</p>
            </div>
          </label>
        </div>
      </div>

      {/* Detail Level Slider & Help Label */}
      <div className="space-y-2 border-t border-slate-100 dark:border-slate-700/50 pt-5">
        <div className="flex items-center justify-between text-xs font-bold text-teal-950 dark:text-teal-100 uppercase tracking-widest leading-none mb-1">
          <span>3. Narrative Detail Level:</span>
          <span className="font-mono text-teal-600 dark:text-teal-400 font-bold tracking-normal capitalize">{detailLevels[detailValue]}</span>
        </div>

        <div className="relative pt-1.5 pb-2">
          <input
            type="range"
            min="0"
            max="2"
            step="1"
            value={detailValue}
            onChange={(e) => setDetailValue(parseInt(e.target.value))}
            className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-100 dark:bg-slate-900 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-bold px-1 mt-1">
            <span>Brief</span>
            <span>Standard</span>
            <span>Detailed Analysis</span>
          </div>
        </div>
      </div>

      {/* Button Submit Trigger */}
      <button
        type="submit"
        disabled={isLoading || sequences.length === 0}
        className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-200 dark:disabled:bg-slate-900 disabled:text-slate-400 dark:disabled:text-slate-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2.5 cursor-pointer disabled:cursor-not-allowed"
      >
        <Sparkles className="w-4 h-4" />
        <span>{isLoading ? 'Processing Bioinformatics...' : 'Generate New Insight'}</span>
      </button>

      {sequences.length === 0 && (
        <p className="text-[10px] text-red-500 text-center leading-normal">
          ⚠️ <strong>Active Sequences Needed:</strong> Upload a FASTA alignment or choose a Demo Dataset in the Upload section to enable academic insight parameters.
        </p>
      )}
    </form>
  );
}
