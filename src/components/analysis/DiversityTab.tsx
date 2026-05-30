import React, { useState, useMemo } from 'react';
import { AlignedSequence, AnalysisResult } from '../../types';
import BaseCompositionChart from './BaseCompositionChart';
import { calculateBaseComposition } from '../../utils/diversity';
import { HelpCircle, Info, ChevronDown, ChevronUp, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { MethodsBadge } from '../shared/MethodsBadge';
import { Tooltip } from '../shared/Tooltip';

interface DiversityTabProps {
  aligned: AlignedSequence[];
  results: AnalysisResult | null;
  onRunAnalysis: () => void;
  isProcessing?: boolean;
}

export default function DiversityTab({ aligned, results, onRunAnalysis, isProcessing }: DiversityTabProps) {
  const [activeExplainConcept, setActiveExplainConcept] = useState<string | null>(null);
  const { setActiveReportFocus, setViewRedirect, activeView, getActiveSequences } = useAppStore();

  const sequences = getActiveSequences();

  const locations = useMemo(() => {
    if (activeView === 'demo') {
      return ['Alas Purwo', 'Baluran', 'Meru Betiri'];
    }
    const locs = sequences.map(s => s.metadata?.location || s.location).filter(Boolean);
    return [...new Set(locs)];
  }, [sequences, activeView]);

  if (!aligned || aligned.length === 0 || !results) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/40">
        <p className="text-sm font-semibold text-teal-950 dark:text-teal-400 mb-2">
          Diversity metrics are pending alignment mapping.
        </p>
        <button
          onClick={onRunAnalysis}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
        >
          ⚡ Run Diversity Analyzer
        </button>
      </div>
    );
  }

  // Calculate base composition
  const composition = calculateBaseComposition(aligned);

  const concepts: { [key: string]: { title: string; symbol: string; explanation: string; academicTip: string } } = {
    hd: {
      title: 'Haplotype Diversity',
      symbol: 'Hd',
      explanation: 'Measures the probability that two randomly chosen individuals from the sample have different haplotypes (genetic variants). Value ranges from 0 to 1. Higher Hd (>0.5) indicates a healthy, highly diverse genetic pool with active variation in the d-loop region.',
      academicTip: 'The population parameter analysis revealed a Haplotype Diversity (Hd) value of '
    },
    pi: {
      title: 'Nucleotide Diversity',
      symbol: 'π',
      explanation: 'Represents the average number of nucleotide differences per site between any two compared sequences. Low values (<0.01) suggest very high similarity and a potentially bottlenecked or geolocally isolated population.',
      academicTip: 'The average nucleotide variation per site (Nucleotide Diversity, π) was calculated to be '
    },
    s: {
      title: 'Polymorphic Sites',
      symbol: 'S',
      explanation: 'Positions in the aligned locus that contain two or more distinct nucleotides among compared individuals, identifying mutational hotspots or segregating markers in the Sanger read locus.',
      academicTip: 'An estimation of the segregating mutational markers identified a total of Polymorphic Sites (S) = '
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Display */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-teal-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider">
            Genetic Diversity Indicators
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Diversity parameters estimated across aligned loci, critical for population genetics thesis chapters.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveReportFocus({ focus: 'diversity', focusArea: 'biological' });
              setViewRedirect('report');
            }}
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-3xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explain these metrics</span>
          </button>
          <div className="text-xs text-emerald-500 font-bold bg-emerald-50 dark:bg-slate-900/40 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-teal-900/40">
            Calculations Compiled
          </div>
        </div>
      </div>

      {/* Sample Locations Section if exists */}
      {locations.length > 0 && (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/25">
          <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider mb-2">Sample Locations</h4>
          <div className="flex flex-wrap gap-2">
            {locations.map(loc => (
              <span key={loc} className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 rounded-full text-xs font-medium border border-teal-200/40">
                {loc}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 2. Population Genetics Indices */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Hd */}
        <div 
          className={`p-4 bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer relative group ${
            activeExplainConcept === 'hd' ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200 dark:border-teal-800/10 hover:border-slate-350'
          }`}
          onClick={() => setActiveExplainConcept(activeExplainConcept === 'hd' ? null : 'hd')}
        >
          <div className="flex items-center justify-between">
            <Tooltip text="Haplotype diversity (Hd) - probability that two random samples are different">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Haplotype Diversity</span>
            </Tooltip>
            <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-teal-950 dark:text-teal-50 mt-1 font-mono">
            {results.diversity.hd.toFixed(3)}
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5 flex items-center gap-1">
            Symbol: <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">Hd</span>
          </p>
          <div className="absolute right-3 bottom-3 text-[9px] font-bold text-teal-500 group-hover:underline">Teach Me</div>
        </div>

        {/* Pi */}
        <div 
          className={`p-4 bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer relative group ${
            activeExplainConcept === 'pi' ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200 dark:border-teal-800/10 hover:border-slate-350'
          }`}
          onClick={() => setActiveExplainConcept(activeExplainConcept === 'pi' ? null : 'pi')}
        >
          <div className="flex items-center justify-between">
            <Tooltip text="Nucleotide diversity (π) - average pairwise differences per site">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nucleotide Diversity</span>
            </Tooltip>
            <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-teal-950 dark:text-teal-50 mt-1 font-mono">
            {results.diversity.pi.toFixed(4)}
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5 flex items-center gap-1">
            Symbol: <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">π</span>
          </p>
          <div className="absolute right-3 bottom-3 text-[9px] font-bold text-teal-500 group-hover:underline">Teach Me</div>
        </div>

        {/* Polymorphic sites */}
        <div 
          className={`p-4 bg-white dark:bg-slate-800 rounded-xl border transition-all cursor-pointer relative group ${
            activeExplainConcept === 's' ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200 dark:border-teal-800/10 hover:border-slate-350'
          }`}
          onClick={() => setActiveExplainConcept(activeExplainConcept === 's' ? null : 's')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Segregating Sites</span>
            <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-teal-500 transition-colors" />
          </div>
          <p className="text-3xl font-bold text-teal-950 dark:text-teal-50 mt-1 font-mono">
            {results.diversity.s}
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5 flex items-center gap-1">
            Symbol: <span className="text-teal-600 dark:text-teal-400 font-mono font-bold">S</span>
          </p>
          <div className="absolute right-3 bottom-3 text-[9px] font-bold text-teal-500 group-hover:underline">Teach Me</div>
        </div>

        {/* Haplotypes Count */}
        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique Haplotypes</span>
          </div>
          <p className="text-3xl font-bold text-teal-950 dark:text-teal-50 mt-1 font-mono">
            {results.diversity.numHaplotypes}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold mt-1.5 flex items-center gap-1">
            Genotypic variants counted
          </p>
        </div>

      </div>

      {/* 3. Academic Mentor Explanation Box */}
      {activeExplainConcept && (
        <div className="p-5 bg-teal-50/50 dark:bg-slate-900 border border-teal-200 dark:border-teal-900/60 rounded-xl transition-all duration-300 animate-fadeIn">
          <div className="flex items-start space-x-3">
            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h5 className="text-xs font-bold text-teal-950 dark:text-teal-200">
                Academic Education Assistant — Understanding {concepts[activeExplainConcept].title} ({concepts[activeExplainConcept].symbol})
              </h5>
              
              <div className="space-y-2">
                <p className="text-xs text-slate-700 dark:text-slate-350 leading-relaxed font-sans">
                  {concepts[activeExplainConcept].explanation}
                </p>
              </div>

              <div className="text-[10px] bg-white dark:bg-slate-850 p-2.5 rounded border border-teal-100 dark:border-teal-900/20 font-mono text-slate-500 dark:text-slate-400">
                💡 <strong>Thesis Formulation Tip:</strong> In your results and discussion chapter, you can write:<br />
                <span className="italic select-all text-slate-700 dark:text-slate-200 block mt-1">
                  &quot;{concepts[activeExplainConcept].academicTip}{activeExplainConcept === 'hd' ? results.diversity.hd.toFixed(3) : (activeExplainConcept === 'pi' ? results.diversity.pi.toFixed(4) : results.diversity.s)} for the analyzed sequence group.&quot;
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Base Composition Charts (Recharts Bar & Pie) */}
      <BaseCompositionChart composition={composition} />

      {/* 5. Aligned Sequence Parameter Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-800/40 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-teal-900/20 bg-slate-50/50 dark:bg-slate-900/20">
          <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider">
            Per-Sequence Base Composition
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-teal-900/20 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
                <th className="px-4 py-3">Sequence Sample Name</th>
                <th className="px-4 py-3 text-center">Aligned Length</th>
                <th className="px-4 py-3 text-center">GC Content</th>
                <th className="px-4 py-3 text-center">N Count</th>
                <th className="px-4 py-3">Inferred Geography</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-teal-950/40">
              {aligned.map((seq) => {
                // Determine GC count on aligned sequence
                const matchGc = (seq.sequence.match(/[GC]/g) || []).length;
                const matchLen = seq.sequence.replace(/-/g, '').length;
                const calculatedGc = matchLen > 0 ? parseFloat(((matchGc / matchLen) * 100).toFixed(1)) : 0;
                const calculatedN = (seq.sequence.match(/[Nn]/g) || []).length;

                const originalSeq = getActiveSequences().find(s => s.id === seq.id);
                const location = originalSeq?.metadata?.location || originalSeq?.location || 'Baluran/Alas Purwo';

                return (
                  <tr key={seq.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30 transition-all">
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100 truncate max-w-xs">{seq.name}</td>
                    <td className="px-4 py-3 text-center font-mono">{matchLen} pb</td>
                    <td className="px-4 py-3 text-center font-mono text-teal-600 dark:text-teal-300 font-bold">{calculatedGc}%</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-400">{calculatedN}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {activeView === 'demo' ? location : 'No geographic information in uploaded file'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <MethodsBadge 
        method="Population Genetic Diversity"
        algorithm="Nei's haplotype diversity & nucleotide diversity models (standard sequence segregation equations)"
        reference="Nei, M., 1987. Molecular evolutionary genetics. Columbia University Press; Tajima, F., 1983. Evolutionary relationship of DNA sequences in finite populations. Genetics, 105(2), pp.437-460."
      />
    </div>
  );
}
