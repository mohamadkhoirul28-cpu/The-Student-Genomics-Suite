import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import OverviewTab from './OverviewTab';
import AlignmentTab from './AlignmentTab';
import DiversityTab from './DiversityTab';
import PhylogenyTab from './PhylogenyTab';
import EmptyState from '../shared/EmptyState';
import { simpleMSA, calculateConservationAndConsensus } from '../../utils/msa';
import { calculateDiversity } from '../../utils/diversity';
import { buildNJTree } from '../../utils/treeBuilder';
import { AnalysisResult } from '../../types';
import { Network, Activity, BarChart2, Info, RefreshCw, Cpu, Dna } from 'lucide-react';

export default function AnalysisDashboard() {
  const { getActiveSequences, analysisResults, setAnalysisResults, isDemoMode, showToast, setViewRedirect } = useAppStore();
  const sequences = getActiveSequences();
  const [activeTab, setActiveTab] = useState<'overview' | 'alignment' | 'diversity' | 'phylogeny'>('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [staleState, setStaleState] = useState(false);

  // Detect if sequences changed relative to compiled analysis results
  useEffect(() => {
    if (analysisResults && sequences.length > 0) {
      // If of different size, or names don't match, flag as stale
      if (analysisResults.alignedSequences.length !== sequences.length) {
        setStaleState(true);
      } else {
        const resultNames = new Set(analysisResults.alignedSequences.map(s => s.name));
        const currentNames = sequences.map(s => s.name);
        const allMatch = currentNames.every(name => resultNames.has(name));
        setStaleState(!allMatch);
      }
    } else {
      setStaleState(false);
    }
  }, [sequences, analysisResults]);

  // If sequences count goes to 0, reset results
  useEffect(() => {
    if (sequences.length === 0) {
      setAnalysisResults(null);
    }
  }, [sequences, setAnalysisResults]);

  const handleRunAnalysis = () => {
    if (sequences.length === 0) return;
    setIsAnalyzing(true);
    
    // Simulate pipeline loading state sequence for premium educational feel
    setTimeout(() => {
      try {
        // 1. Perform Multiple Sequence Alignment
        const alignedList = simpleMSA(sequences);
        
        // 2. Compute Consensus and Column Conservation
        const { consensus, conservationScores } = calculateConservationAndConsensus(alignedList);
        
        // 3. Detect Demo Dataset matching for specified PopGen indices
        let matchedDatasetId = '';
        if (isDemoMode) {
          if (sequences.length === 20 && sequences[0].name.toLowerCase().includes('rusa')) {
            matchedDatasetId = 'rusa-timorensis';
          } else if (sequences.length === 30 && sequences[0].name.toLowerCase().includes('coi')) {
            matchedDatasetId = 'coi-barcode';
          } else if (sequences.length === 15 && sequences[0].name.toLowerCase().includes('bacterial')) {
            matchedDatasetId = 'bacterial-16s';
          }
        }

        // 4. Calculate Genetic Diversity Metrics
        const divMetrics = calculateDiversity(alignedList, matchedDatasetId);
        
        // 5. Construct Neighbor-Joining Cluster Tree
        // Map sequences metadata for coordinate properties (e.g. location coloring)
        const metadataMap = new Map();
        sequences.forEach(s => {
          metadataMap.set(s.id, {
            location: s.metadata?.location || s.location,
            species: s.metadata?.species || s.species
          });
        });
        const tree = buildNJTree(alignedList, metadataMap);

        // Calculate helper numeric ranges
        const gcs = sequences.map(s => s.gcContent);
        const gcContentMin = gcs.length > 0 ? Math.min(...gcs) : 0;
        const gcContentMax = gcs.length > 0 ? Math.max(...gcs) : 0;
        const totalBases = sequences.reduce((sum, s) => sum + s.sequence.length, 0);
        const avgLength = sequences.length > 0 ? Math.round(totalBases / sequences.length) : 0;

        const results: AnalysisResult = {
          alignedSequences: alignedList,
          diversity: divMetrics,
          tree,
          gcContentMin,
          gcContentMax,
          avgLength,
          totalLength: totalBases,
          consensus,
          conservationScores
        };

        setAnalysisResults(results);
        setStaleState(false);
        showToast('Successfully compiled sanger sequences bioinformatics pipeline!', 'success');
      } catch (err: any) {
        setAnalysisResults(null);
        showToast(`Alignment pipeline issue: ${err.message || 'Verification failed'}`, 'error');
      } finally {
        setIsAnalyzing(false);
      }
    }, 4000); // 4 seconds delay allows full progress logs checklist of steps
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* 1. Header block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-teal-900 dark:text-teal-50 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-teal-500" />
            Genetic Analysis
          </h2>
          <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
            Calculate locus alignment columns, polymorphism demographics, and Neighbor-Joining phylogenetic clades.
          </p>
        </div>

        {staleState && (
          <div className="flex items-center space-x-2 bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-teal-900/40 p-2.5 rounded-lg text-xs text-amber-800 dark:text-amber-450">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="font-semibold">Workspace sequences updated!</span>
            <button
              onClick={handleRunAnalysis}
              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded transition-all cursor-pointer"
            >
              Sync Re-Run
            </button>
          </div>
        )}
      </div>

      {sequences.length === 0 ? (
        <EmptyState
          title="No analysis data"
          description="We found no genetic data in your active workspace memory. Run alignment analysis on your sequence cohort first by adding some sequence files."
          actionLabel="Return Home to Upload"
          onAction={() => setViewRedirect('home')}
          icon={<Dna className="w-8 h-8 text-teal-400" />}
        />
      ) : (
        <>
          {/* 2. Horizontal Navigation Tabs */}
          <div className="border-b border-slate-200 dark:border-teal-950/40 flex flex-wrap gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'overview'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-teal-300/60 dark:hover:text-teal-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              Overview Portal
            </button>
            <button
              onClick={() => setActiveTab('alignment')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'alignment'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-teal-300/60 dark:hover:text-teal-100'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Multiple Alignment (MSA)
            </button>
            <button
              onClick={() => setActiveTab('diversity')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'diversity'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-teal-300/60 dark:hover:text-teal-100'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              PopGen Diversity
            </button>
            <button
              onClick={() => setActiveTab('phylogeny')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'phylogeny'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-teal-300/60 dark:hover:text-teal-100'
              }`}
            >
              <Network className="w-4 h-4" />
              NJ Phylogeny Tree
            </button>
          </div>

          {/* 3. Panel Switcher container */}
          <div className="transition-all duration-300">
            {activeTab === 'overview' && (
              <OverviewTab 
                sequences={sequences}
                isAnalyzing={isAnalyzing}
                onRunAnalysis={handleRunAnalysis}
                results={analysisResults}
              />
            )}
            {activeTab === 'alignment' && (
              <AlignmentTab 
                aligned={analysisResults?.alignedSequences || []}
                results={analysisResults}
                onRunAnalysis={handleRunAnalysis}
              />
            )}
            {activeTab === 'diversity' && (
              <DiversityTab 
                aligned={analysisResults?.alignedSequences || []}
                results={analysisResults}
                onRunAnalysis={handleRunAnalysis}
                isProcessing={isAnalyzing}
              />
            )}
            {activeTab === 'phylogeny' && (
              <PhylogenyTab 
                aligned={analysisResults?.alignedSequences || []}
                results={analysisResults}
                onRunAnalysis={handleRunAnalysis}
              />
            )}
          </div>
        </>
      )}

    </div>
  );
}
