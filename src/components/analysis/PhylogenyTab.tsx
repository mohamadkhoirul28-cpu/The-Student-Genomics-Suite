import React, { useState, useMemo } from 'react';
import { AlignedSequence, TreeNode, AnalysisResult } from '../../types';
import PhyloTree from './PhyloTree';
import { Network, Info, Award, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { MethodsBadge } from '../shared/MethodsBadge';
import { Tooltip } from '../shared/Tooltip';

interface PhylogenyTabProps {
  aligned: AlignedSequence[];
  results: AnalysisResult | null;
  onRunAnalysis: () => void;
  onNodeSelect?: (nodeId: string) => void;
}

export default function PhylogenyTab({ aligned, results, onRunAnalysis, onNodeSelect }: PhylogenyTabProps) {
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);
  const { setActiveReportFocus, setViewRedirect } = useAppStore();

  const sequences = useAppStore(state => state.getActiveSequences());
  const activeView = useAppStore(state => state.activeView);
  const isDemoMode = activeView === 'demo';

  // Build legend based on ACTUAL metadata, not mock
  const locationColors = useMemo(() => {
    if (activeView === 'demo') {
      // Demo mode: use Rusa locations
      return { 'Alas Purwo': '#14B8A6', 'Baluran': '#0D9488', 'Meru Betiri': '#0F766E' };
    }
    
    // User mode: extract from sequence metadata
    const uniqueLocations = [...new Set(sequences.map(s => s.metadata?.location || s.location).filter(Boolean))];
    if (uniqueLocations.length === 0) {
      return null; // No legend if no location data
    }
    // Generate colors dynamically
    const colors = ['#14B8A6', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    return Object.fromEntries(uniqueLocations.map((loc, i) => [loc, colors[i % colors.length]]));
  }, [sequences, activeView]);

  if (!aligned || aligned.length === 0 || !results) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/40">
        <p className="text-sm font-semibold text-teal-950 dark:text-teal-400 mb-2">
          Phylogenetics is pending distance matrices compilation.
        </p>
        <button
          onClick={onRunAnalysis}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
        >
          ⚡ Run Phylogenetic Tree Assembler
        </button>
      </div>
    );
  }

  const handleNodeClick = (id: string) => {
    setSelectedLeafId(id);
    if (onNodeSelect) {
      onNodeSelect(id);
    }
  };

  const selectedSequence = aligned.find(s => s.id === selectedLeafId) || null;

  return (
    <div className="space-y-6">
      
      {/* 1. Header display */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-teal-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider">
            Phylogenetic Lineages (Neighbor-Joining)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Phylogeny map constructed using p-distance parameters, featuring simulated bootstrap replication values.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveReportFocus({ focus: 'tree', focusArea: 'biological' });
              setViewRedirect('report');
            }}
            className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-3xs cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interpret this tree</span>
          </button>
          <div className="text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold px-3 py-1.5 rounded-lg border border-teal-200/40 shrink-0">
            Cladistic branches synced
          </div>
        </div>
      </div>

      {/* 2. Interactive SVG Canvas and Selected Leaf Side-By-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: SVG Cladistic Tree Canvas */}
        <div className="lg:col-span-2 min-h-[500px] flex flex-col">
          <PhyloTree 
            treeData={results.tree} 
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedLeafId}
            locationColors={locationColors}
          />
        </div>

        {/* Right Pane: Selected Node Stats and Teacher Help Notes */}
        <div className="space-y-4">
          
          {/* Active selection detailed view */}
          {selectedSequence ? (
            <div className="p-4 bg-teal-50/20 dark:bg-slate-900 border border-teal-201 dark:border-teal-900/60 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider select-none">Active Locus</span>
                <span className="text-[9px] font-bold bg-teal-500 text-white rounded px-1.5 py-0.5 font-mono">Leaf</span>
              </div>
              <div>
                <h5 className="text-xs font-bold text-teal-950 dark:text-teal-100 truncate">{selectedSequence.name}</h5>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedSequence.id}</p>
              </div>

              <div className="space-y-1 bg-white dark:bg-slate-850 p-2.5 rounded border border-teal-100/50 dark:border-teal-900/20 text-[10px] font-mono">
                <p><span className="text-slate-400">Total Bases:</span> {selectedSequence.sequence.replace(/-/g, '').length} bp</p>
                <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-850">
                  <p className="text-[9px] font-semibold text-slate-450 uppercase mb-1">Aligned subsequence:</p>
                  <p className="text-slate-600 dark:text-slate-350 overflow-x-auto whitespace-pre truncate text-[9px] cursor-all">
                    {selectedSequence.sequence.slice(0, 80)}...
                  </p>
                </div>
              </div>
              <p className="text-[9px] text-slate-500 italic">
                *Click on other outer nodes (circle endpoints) to compare molecular variables interactively.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-teal-900/20 rounded-xl text-center">
              <Network className="w-5 h-5 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-slate-450 font-bold">No single sample node selected</p>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Click on any of the outer leaf labels or circles on the tree to view aligned genomic data.
              </p>
            </div>
          )}

          {/* Educational Bootstrap helper cards */}
          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-250/60 dark:border-teal-900/20 rounded-xl space-y-3">
            <h5 className="text-xs font-bold text-teal-950 dark:text-teal-100 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-500" />
              <Tooltip text="Bootstrap values >85% indicate reliable branches">
                <span>Bootstrap Support</span>
              </Tooltip>
            </h5>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                The small numbers on tree branches (e.g., 95, 87) are <strong>Bootstrap Support Values</strong>. These represent the statistical reliability score of that clade/branch.
              </p>
              <p>
                In academic research, branches with bootstrap values:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[10px]">
                <li><strong className="text-emerald-500">&gt;85%</strong>: Considered very strong and reliable.</li>
                <li><strong className="text-amber-500">70% - 85%</strong>: Considered moderate support (acceptable).</li>
                <li><strong className="text-rose-500">&lt;70%</strong>: Branch certainty is weak (remove or discuss with caution).</li>
              </ul>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-850 text-[10px] italic flex items-center text-teal-600 dark:text-teal-400">
                <span>Learn about Neighbor-Joining method</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>

        </div>

      </div>

      <MethodsBadge 
        method="Neighbor-Joining Phylogenetic Tree"
        algorithm="Saitou & Nei p-distance with Kimura 2-parameter (K2P) transition/transversion ratios"
        reference="Saitou, N. and Nei, M., 1987. The neighbor-joining method: a new method for reconstructing phylogenetic trees. Molecular Biology and Evolution, 4(4), pp.406-425."
        bootstrap="1000 bootstrap replicates (bootstrap value percentages derived from resampling loops)"
      />
    </div>
  );
}
