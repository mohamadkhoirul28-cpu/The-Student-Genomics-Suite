import React, { useState, useEffect, useMemo } from 'react';
import { GeneticSequence, AnalysisResult } from '../../types';
import { Play, CheckCircle, Database, Cpu, ChevronRight, AlertTriangle, Lightbulb } from 'lucide-react';
import { generateRecommendations, Recommendation } from '../../utils/recommendations';
import { useAppStore } from '../../stores/appStore';

interface OverviewTabProps {
  sequences: GeneticSequence[];
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
  results: AnalysisResult | null;
}

export function RecommendationsPanel({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-900/60 rounded-xl p-4 mt-4 animate-fadeIn">
      <h4 className="font-semibold text-teal-900 dark:text-teal-250 flex items-center gap-2 text-sm">
        <Lightbulb className="w-5 h-5 text-amber-500 animate-pulse" />
        Recommended Next Steps for Your Dry-Lab Thesis
      </h4>
      <div className="space-y-3 mt-3">
        {recommendations.map((rec, i) => (
          <div key={i} className={`p-3 rounded-lg border text-xs leading-relaxed ${
            rec.priority === 'high' 
              ? 'bg-red-50/40 dark:bg-red-950/20 border-red-205 dark:border-red-900/50' 
              : rec.priority === 'medium' 
                ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' 
                : 'bg-zinc-50/40 dark:bg-slate-900 border-zinc-200 dark:border-teal-950'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/60 text-red-750 dark:text-red-350' :
                rec.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-755 dark:text-amber-305' :
                'bg-slate-200 dark:bg-slate-700 text-slate-750 dark:text-slate-350'
              }`}>
                {rec.priority.toUpperCase()}
              </span>
              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-[13px]">{rec.title}</h5>
            </div>
            <p className="text-slate-600 dark:text-slate-355 mt-1">{rec.description}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic font-medium">➔ Reasoned Metric: {rec.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewTab({ sequences, isAnalyzing, onRunAnalysis, results }: OverviewTabProps) {
  const [loadStep, setLoadStep] = useState<number>(0);
  const steps = [
    'Parsing input FASTA format schema...',
    'Performing pairwise global aligner iterations (progressive)...',
    'Identifying polymorphic sites and filtering conserved columns...',
    'Grouping distinct sequence haplotypes...',
    'Computing nucleotide diversity index (π) and haplotype diversity (Hd)...',
    'Generating p-distance distance matrix...',
    'Constructing Neighbor-Joining phylogenetic cluster branches...',
    'Perfecting tree radial coordinates and bootstrap simulations...'
  ];

  useEffect(() => {
    let interval: any;
    if (isAnalyzing) {
      setLoadStep(0);
      interval = setInterval(() => {
        setLoadStep(prev => {
          if (prev < steps.length - 1) return prev + 1;
          return prev;
        });
      }, 500);
    } else {
      setLoadStep(0);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (sequences.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/40">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-teal-950 dark:text-teal-550 mb-1">
          No sequences uploaded in active workspace.
        </p>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Please upload some Sanger/FASTA reads first or load the Javan Rusa mtDNA demo dataset to begin analyzing.
        </p>
      </div>
    );
  }

  // Calculate quick stats on inputs
  const count = sequences.length;
  const totalBases = sequences.reduce((sum, s) => sum + s.sequence.length, 0);
  const avgLength = count > 0 ? Math.round(totalBases / count) : 0;

  // Generate recommendations if results exist
  const recommendations = useMemo(() => {
    if (!results) return [];
    return generateRecommendations({
      hd: results.diversity.hd,
      pi: results.diversity.pi,
      s: results.diversity.s,
      numHaplotypes: results.diversity.numHaplotypes,
      sequences: sequences.map(s => ({ sequence: s.sequence, name: s.name }))
    }, useAppStore.getState().activeDatasetId || 'custom');
  }, [results, sequences]);
  
  const gcs = sequences.map(s => s.gcContent);
  const minGC = gcs.length > 0 ? Math.min(...gcs) : 0;
  const maxGC = gcs.length > 0 ? Math.max(...gcs) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total sequences card */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/20 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Total Sequences
          </p>
          <p className="text-2xl font-bold font-sans text-teal-950 dark:text-teal-50 mt-1">
            {count}
          </p>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
            Samples ready for alignment
          </p>
        </div>

        {/* Avg Length card */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/20 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Average Length
          </p>
          <p className="text-2xl font-bold font-mono text-teal-950 dark:text-teal-50 mt-1">
            {avgLength} <span className="text-xs font-semibold text-slate-400">bp</span>
          </p>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
            Sanger range (200-1200bp)
          </p>
        </div>

        {/* GC Range card */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/20 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            GC Content Range
          </p>
          <p className="text-2xl font-bold font-sans text-teal-950 dark:text-teal-50 mt-1">
            {minGC.toFixed(1)}% - {maxGC.toFixed(1)}%
          </p>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
            Nucleic composition variation
          </p>
        </div>

        {/* Haplotypes summary card */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/20 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Polymorphic Sites (S)
          </p>
          <p className="text-2xl font-bold font-sans text-teal-950 dark:text-teal-50 mt-1">
            {results ? results.diversity.s : 'Pending'}
          </p>
          <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
            {results ? 'Aligned nucleotide variation' : 'Click Run to calculate'}
          </p>
        </div>
      </div>

      {/* Launcher Area */}
      <div className="p-6 bg-slate-900 text-white rounded-xl relative overflow-hidden shadow-md">
        
        {/* Background circuit-like patterns */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-1">
            <h3 className="text-base font-bold text-teal-300 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400" />
              Sanger Bioinformatics Engine
            </h3>
            <p className="text-xs text-slate-350 max-w-xl leading-relaxed">
              Run dynamic progressive Multiple Sequence Alignment (MSA), calculate nucleotide & haplotype polymorphism indices, and reconstruct Neighbor-Joining trees instantly.
            </p>
          </div>

          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className={`w-full md:w-auto px-6 py-3 rounded-lg text-xs font-bold transition-all shadow-md inline-flex items-center justify-center space-x-2 border shrink-0 cursor-pointer ${
              isAnalyzing 
                ? 'bg-slate-850 border-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-teal-500 border-teal-400 hover:bg-teal-600 text-white hover:scale-102 active:scale-98'
            }`}
          >
            <Play className={`w-4 h-4 fill-current ${isAnalyzing ? 'animate-pulse' : ''}`} />
            <span>{results ? 'Re-run Analysis Core' : 'Run Full Analysis'}</span>
          </button>
        </div>

        {/* Progress Display */}
        {isAnalyzing && (
          <div className="mt-6 pt-4 border-t border-slate-800 transition-all">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-teal-400 font-bold">Processing step {loadStep + 1} of {steps.length}...</span>
              <span className="text-slate-400 font-semibold">{Math.round(((loadStep + 1) / steps.length) * 100)}%</span>
            </div>
            
            {/* Animated progress bar slider */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-3">
              <div 
                className="bg-teal-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((loadStep + 1) / steps.length) * 100}%` }}
              />
            </div>

            <p className="text-[11px] font-mono text-slate-300 italic animate-pulse">
              ➔ {steps[loadStep]}
            </p>
          </div>
        )}
      </div>

      {/* Completion checklist badge summary if results exist */}
      {results && !isAnalyzing && (
        <div className="p-6 bg-emerald-50/50 dark:bg-slate-900 border border-emerald-200 dark:border-teal-900/60 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-450 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Biological Compilation Completed
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-white dark:bg-slate-850 rounded-lg border border-emerald-100 dark:border-teal-900/20">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Grid alignment Matrix</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Completed alignment spanning {results.alignedSequences[0]?.sequence.length || 0} columns. Gaps synced.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-850 rounded-lg border border-emerald-100 dark:border-teal-900/20">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Pop-Gen diversity metrics</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Haplotypes parsed ({results.diversity.numHaplotypes} unique groups). Hd and π values computed.
              </p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-850 rounded-lg border border-emerald-100 dark:border-teal-900/20">
              <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Neighbor-Joining Clades</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Dendrogram node tree generated with bootstrap values ranging up to 100%.
              </p>
            </div>
          </div>
        </div>
      )}

      {results && !isAnalyzing && recommendations.length > 0 && (
        <RecommendationsPanel recommendations={recommendations} />
      )}
    </div>
  );
}
