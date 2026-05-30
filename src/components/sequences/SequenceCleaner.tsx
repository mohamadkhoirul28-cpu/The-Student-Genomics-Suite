import { useState, useMemo } from 'react';
import { 
  X, 
  Sparkles, 
  Undo2, 
  HelpCircle, 
  Info, 
  AlertTriangle, 
  ArrowRight, 
  Check, 
  Sliders, 
  FolderSync 
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { CleanOptions, GeneticSequence } from '../../types';

interface SequenceCleanerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SequenceCleaner({ isOpen, onClose }: SequenceCleanerProps) {
  const { 
    sequences, 
    originalSequences, 
    cleanSequences, 
    undoCleanSequences,
    isDemoMode,
    showToast
  } = useAppStore();

  // Local cleaning options state
  const [options, setOptions] = useState<CleanOptions>({
    trimNsAndGaps: true,
    removeShortSequences: true,
    minSequenceLength: 300,
    standardizeCase: true,
    removeWhitespace: true,
    removeNonDnaChars: false
  });

  const [lastActionResults, setLastActionResults] = useState<{
    beforeCount: number;
    afterCount: number;
    beforeAvgLen: number;
    afterAvgLen: number;
    totalBasesRemoved: number;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Compute "Simulated/Dry Run" consequences in real-time
  const simulatedStats = useMemo(() => {
    if (sequences.length === 0) return null;

    const beforeCount = sequences.length;
    const totalBasesBefore = sequences.reduce((sum, s) => sum + s.sequence.length, 0);
    const beforeAvgLen = beforeCount > 0 ? parseFloat((totalBasesBefore / beforeCount).toFixed(1)) : 0;

    let testSeqs = sequences.map(seq => {
      let cleaned = seq.sequence;
      if (options.standardizeCase) cleaned = cleaned.toUpperCase();
      if (options.removeWhitespace) cleaned = cleaned.replace(/\s+/g, '');
      if (options.trimNsAndGaps) cleaned = cleaned.replace(/^[Nn-]+|[Nn-]+$/g, '');
      if (options.removeNonDnaChars) cleaned = cleaned.replace(/[^ACGTN-]/gi, '');
      
      return {
        ...seq,
        sequence: cleaned,
        length: cleaned.length
      };
    });

    if (options.removeShortSequences) {
      testSeqs = testSeqs.filter(s => s.length >= options.minSequenceLength);
    }

    const afterCount = testSeqs.length;
    const totalBasesAfter = testSeqs.reduce((sum, s) => sum + s.sequence.length, 0);
    const afterAvgLen = afterCount > 0 ? parseFloat((totalBasesAfter / afterCount).toFixed(1)) : 0;
    const totalBasesRemoved = Math.max(0, totalBasesBefore - totalBasesAfter);

    return {
      beforeCount,
      afterCount,
      beforeAvgLen,
      afterAvgLen,
      totalBasesRemoved,
      previewBefore: sequences.slice(0, 3),
      previewAfter: testSeqs.slice(0, 3)
    };
  }, [sequences, options]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (isDemoMode) {
      showToast('Cannot modify sequence data in read-only Demo Mode.', 'error');
      return;
    }
    if (sequences.length === 0) return;
    const results = cleanSequences(options);
    setLastActionResults(results);
    showNotice(`Applied cleaning! ${results.beforeCount - results.afterCount} sequences pruned, ${results.totalBasesRemoved} bases scrubbed.`);
  };

  const handleUndo = () => {
    if (isDemoMode) {
      showToast('Cannot modify sequence data in read-only Demo Mode.', 'error');
      return;
    }
    undoCleanSequences();
    setLastActionResults(null);
    showNotice('Successfully reverted dataset to previous state!');
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Main Dialog Box */}
        <div 
          className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-xl border border-slate-200 dark:border-teal-950 flex flex-col max-h-[90vh] overflow-hidden text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header section */}
          <div className="p-5 border-b border-slate-150 dark:border-teal-950/65 bg-slate-50 dark:bg-slate-950/45 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-650 dark:text-teal-300">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-teal-950 dark:text-teal-50">
                  Genetic Sequence Sensi-Cleaner / Trimmer
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Groom raw base reads, trim low-confidence flanking residues, and filter out short fragments.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dialog Container body */}
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left side panel: Toggle Options */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Grooming Procedures
              </h4>

              <div className="space-y-3.5 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-teal-950/40">
                
                {/* 1. Trim Ns and Gaps */}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.trimNsAndGaps}
                    onChange={(e) => setOptions(prev => ({ ...prev, trimNsAndGaps: e.target.checked }))}
                    className="w-4 h-4 text-teal-500 focus:ring-teal-500 border-slate-300 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-semibold text-teal-950 dark:text-teal-50 block">
                      Trim Flanking N's and Gaps
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block mt-0.5">
                      Removes raw sequence margin noise (trailing/leading Ns and -) commonly seen in weak Sanger reads.
                    </span>
                  </div>
                </label>

                {/* 2. Standardize Case */}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.standardizeCase}
                    onChange={(e) => setOptions(prev => ({ ...prev, standardizeCase: e.target.checked }))}
                    className="w-4 h-4 text-teal-500 focus:ring-teal-500 border-slate-300 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-semibold text-teal-950 dark:text-teal-50 block">
                      Standardize Case (UPPERCASE)
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block mt-0.5">
                      Ensures absolute alphabet consistency by converting low-integrity lowercase letters to capital letters.
                    </span>
                  </div>
                </label>

                {/* 3. Strip Whitespaces */}
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.removeWhitespace}
                    onChange={(e) => setOptions(prev => ({ ...prev, removeWhitespace: e.target.checked }))}
                    className="w-4 h-4 text-teal-500 focus:ring-teal-500 border-slate-300 rounded mt-0.5"
                  />
                  <div>
                    <span className="text-xs font-semibold text-teal-950 dark:text-teal-50 block">
                      Strip Whitesspace & Linebreaks
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block mt-0.5">
                      Erases formatting noise or line separators that sneak in during manual clipboard pasting.
                    </span>
                  </div>
                </label>

                {/* 4. Filter short length */}
                <div className="space-y-2 border-t border-slate-200 dark:border-teal-950 pt-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.removeShortSequences}
                      onChange={(e) => setOptions(prev => ({ ...prev, removeShortSequences: e.target.checked }))}
                      className="w-4 h-4 text-teal-500 focus:ring-teal-500 border-slate-300 rounded mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-semibold text-teal-950 dark:text-teal-50 block">
                        Exclude Low-Length Reads
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block mt-0.5">
                        Filters out truncated sequence files below a configurable basepair cutoff threshold.
                      </span>
                    </div>
                  </label>

                  {options.removeShortSequences && (
                    <div className="pl-7 pr-1 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-500 dark:text-slate-400">Min Sequence Length:</span>
                        <strong className="text-teal-700 dark:text-teal-300">{options.minSequenceLength} bp</strong>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="800"
                        step="10"
                        value={options.minSequenceLength}
                        onChange={(e) => setOptions(prev => ({ ...prev, minSequenceLength: parseInt(e.target.value) }))}
                        className="w-full accent-teal-500 bg-slate-250 dark:bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
                      />
                    </div>
                  )}
                </div>

                {/* 5. Warning Non-ACGTN */}
                <div className="space-y-2 border-t border-slate-200 dark:border-teal-950 pt-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.removeNonDnaChars}
                      onChange={(e) => setOptions(prev => ({ ...prev, removeNonDnaChars: e.target.checked }))}
                      className="w-4 h-4 text-teal-500 focus:ring-teal-500 border-slate-300 rounded mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-semibold text-teal-950 dark:text-teal-50 block">
                        Remove Non-Nucleotide Characters
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal block mt-0.5">
                        Scrubs out elements other than standard IUPAC base codes [ACGTN-].
                      </span>
                    </div>
                  </label>

                  {options.removeNonDnaChars && (
                    <div className="p-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-950 rounded-lg flex items-start space-x-1.5 text-[9.5px] leading-relaxed text-amber-800 dark:text-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        <strong>Warning:</strong> Selecting this will scrub unrecognized alignment digits. Ensure your files do not rely on custom numbering characters.
                      </span>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Right side panel: Dynamic Live dry-run preview comparing Before/After */}
            <div className="lg:col-span-7 flex flex-col space-y-4">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Live Simulator Dry-Run Preview
              </h4>

              {simulatedStats ? (
                <div className="flex-1 flex flex-col space-y-4 bg-slate-50 dark:bg-slate-950/10 p-4 border border-slate-150 dark:border-teal-950/40 rounded-xl">
                  
                  {/* Before/After stats bar */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-teal-950/40 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Active Samples</span>
                      <div className="flex items-center justify-center space-x-1.5 mt-1">
                        <span className="font-bold text-xs text-slate-500 font-mono">{simulatedStats.beforeCount}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className={`font-bold text-sm font-mono ${simulatedStats.afterCount < simulatedStats.beforeCount ? 'text-rose-500' : 'text-emerald-600'}`}>
                          {simulatedStats.afterCount}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-teal-950/40 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Average Length</span>
                      <div className="flex items-center justify-center space-x-1.5 mt-1 font-mono text-xs">
                        <span className="text-slate-500">{simulatedStats.beforeAvgLen} bp</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span className="text-teal-600 font-bold">{simulatedStats.afterAvgLen} bp</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-teal-950/40 p-2.5 rounded-lg">
                      <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold block">Bases Removed</span>
                      <div className="mt-1">
                        <span className={`font-bold text-sm font-mono ${simulatedStats.totalBasesRemoved > 0 ? 'text-teal-600' : 'text-slate-400'}`}>
                          -{simulatedStats.totalBasesRemoved}
                        </span>
                        <span className="text-[9px] text-slate-400 block">bases scrubbed</span>
                      </div>
                    </div>
                  </div>

                  {/* Sample comparison lists */}
                  <div className="flex-1 space-y-3.5 overflow-y-auto max-h-72 pr-1 scrollbar">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                      Sequence comparative snapshot (First 3 samples)
                    </span>

                    {simulatedStats.previewBefore.map((bSeq, idx) => {
                      const aSeq = simulatedStats.previewAfter[idx];
                      const trimmedBeforeStr = bSeq.sequence.length > 55 ? bSeq.sequence.slice(0, 50) + '...' : bSeq.sequence;
                      const trimmedAfterStr = aSeq ? (aSeq.sequence.length > 55 ? aSeq.sequence.slice(0, 50) + '...' : aSeq.sequence) : 'Pruned / Excluded';

                      return (
                        <div key={bSeq.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-teal-950/30 rounded-lg space-y-2">
                          <div className="flex items-center justify-between text-[11px] border-b border-slate-100 dark:border-teal-950/20 pb-1">
                            <span className="font-bold text-teal-900 dark:text-teal-200 truncate max-w-[200px]">{bSeq.name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Sample {idx + 1}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]/normal leading-normal font-mono">
                            <div className="p-1.5 rounded bg-amber-50/20 text-slate-600 dark:text-slate-400 border border-amber-100/30">
                              <span className="text-[8px] font-bold text-amber-600 uppercase block">Before: {bSeq.length} bp</span>
                              <span className="break-all block">{trimmedBeforeStr}</span>
                            </div>
                            
                            {aSeq ? (
                              <div className="p-1.5 rounded bg-emerald-50/20 text-slate-700 dark:text-slate-300 border border-emerald-100/30">
                                <span className="text-[8px] font-bold text-emerald-600 block uppercase">After: {aSeq.length} bp</span>
                                <span className="break-all block font-semibold">{trimmedAfterStr}</span>
                              </div>
                            ) : (
                              <div className="p-1.5 rounded bg-rose-50/30 text-rose-500 border border-rose-100/45 dark:bg-rose-950/5 flex items-center justify-center">
                                <span className="font-bold uppercase tracking-wider text-[8px]">Frag too short - Excluded</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center border border-dashed border-slate-250 dark:border-teal-900 rounded-xl p-10 text-center">
                  <span className="text-slate-400 text-xs">Load/Add sequence items to compare before-after states.</span>
                </div>
              )}
            </div>
          </div>

          {/* Active notification indicator */}
          {notification && (
            <div className="mx-6 mb-3 p-3 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-900 rounded-lg text-teal-800 dark:text-teal-250 text-xs text-center font-semibold animate-bounce shadow-2xs">
              {notification}
            </div>
          )}

          {/* Footer Controls: Trim execution, Revert, and Exit */}
          <div className="p-4 border-t border-slate-150 dark:border-teal-950 bg-slate-50 dark:bg-slate-950/50 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              {originalSequences ? (
                <button
                  onClick={handleUndo}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-teal-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:border-teal-950/80 dark:text-teal-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-3xs"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Undo Last Action (Revert)</span>
                </button>
              ) : (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  *Last action clean history empty. Trim operations are fully undoable within session.
                </span>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-250 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-0 rounded-lg text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-200 transition-colors"
              >
                Exit / Go Back
              </button>

              <button
                disabled={sequences.length === 0}
                onClick={handleApply}
                className="py-2.5 px-6 bg-teal-500 hover:bg-teal-650 active:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-2xs disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"
              >
                Apply Cleaning (Dry-Run)
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
