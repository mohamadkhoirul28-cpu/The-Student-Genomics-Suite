import React, { useState, useRef } from 'react';
import { AlignedSequence, AnalysisResult } from '../../types';
import ConservationBar from './ConservationBar';
import { Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { MethodsBadge } from '../shared/MethodsBadge';
import { Tooltip } from '../shared/Tooltip';

interface AlignmentTabProps {
  aligned: AlignedSequence[];
  results: AnalysisResult | null;
  onRunAnalysis: () => void;
}

export default function AlignmentTab({ aligned, results, onRunAnalysis }: AlignmentTabProps) {
  const [zoomLevel, setZoomLevel] = useState<'fit' | 'locus' | 'medium'>('medium');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!aligned || aligned.length === 0 || !results) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/40">
        <p className="text-sm font-semibold text-teal-950 dark:text-teal-400 mb-2">
          Alignment dataset is not compiled.
        </p>
        <button
          onClick={onRunAnalysis}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
        >
          ⚡ Run Alignment Engine
        </button>
      </div>
    );
  }

  // Column cell sizing parameter mapping based on zoom
  let cellWidth = 20; // in px
  let fontSizeClass = 'text-[11px] font-bold';
  
  if (zoomLevel === 'fit') {
    cellWidth = 4;
    fontSizeClass = 'text-[0px]'; // hide characters entirely, show just color blocks!
  } else if (zoomLevel === 'medium') {
    cellWidth = 14;
    fontSizeClass = 'text-[9px] font-bold';
  } else if (zoomLevel === 'locus') {
    cellWidth = 22;
    fontSizeClass = 'text-xs font-black';
  }

  // Get color for base
  function getBaseBgColor(base: string): string {
    switch (base.toUpperCase()) {
      case 'A': return 'bg-emerald-500 text-white';
      case 'C': return 'bg-blue-500 text-white';
      case 'G': return 'bg-amber-500 text-slate-900';
      case 'T': return 'bg-rose-500 text-white';
      case '-': return 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600';
      default: return 'bg-slate-400 text-white';
    }
  }

  // Exporter
  const downloadFasta = () => {
    let content = '';
    aligned.forEach(s => {
      content += `>${s.name} [Aligned sanger read]\n${s.sequence}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_genomics_alignment.fasta`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const alignmentLength = aligned[0]?.sequence.length || 0;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-teal-900/40 gap-4">
        <div>
          <Tooltip text="ClustalW-style progressive pairwise Multiple Sequence Alignment (MSA) aligning 3+ biological sequences">
            <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider">
              Multiple Sequence Alignment (MSA)
            </h4>
          </Tooltip>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Progressive alignment grid of {aligned.length} Sanger reads ({alignmentLength} bp aligned locus).
          </p>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex bg-white dark:bg-slate-850 p-1 border border-slate-200 dark:border-teal-900/40 rounded-lg">
            <button
              onClick={() => setZoomLevel('fit')}
              className={`p-1.5 rounded text-xs px-2.5 font-semibold transition-all cursor-pointer ${
                zoomLevel === 'fit' 
                  ? 'bg-teal-500 text-white font-bold shadow-2xs' 
                  : 'text-slate-500 hover:bg-slate-50 dark:text-teal-200 dark:hover:bg-slate-800'
              }`}
              title="Compact block view"
            >
              Overview Map
            </button>
            <button
              onClick={() => setZoomLevel('medium')}
              className={`p-1.5 rounded text-xs px-2.5 font-semibold transition-all cursor-pointer ${
                zoomLevel === 'medium' 
                  ? 'bg-teal-500 text-white font-bold shadow-2xs' 
                  : 'text-slate-500 hover:bg-slate-50 dark:text-teal-200 dark:hover:bg-slate-800'
              }`}
            >
              Std
            </button>
            <button
              onClick={() => setZoomLevel('locus')}
              className={`p-1.5 rounded text-xs px-2.5 font-semibold transition-all cursor-pointer ${
                zoomLevel === 'locus' 
                  ? 'bg-teal-500 text-white font-bold shadow-2xs' 
                  : 'text-slate-500 hover:bg-slate-50 dark:text-teal-200 dark:hover:bg-slate-800'
              }`}
              title="Large locus zoomed bases"
            >
              Zoom Nucleotide
            </button>
          </div>

          <button
            onClick={downloadFasta}
            className="flex items-center space-x-1.5 px-3 py-2 bg-teal-550 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download FASTA</span>
          </button>
        </div>
      </div>

      {/* 2. Synchronized Conservation Map */}
      <ConservationBar scores={results.conservationScores} charWidth={cellWidth} visibleRange={[0, alignmentLength]} />

      {/* 3. Outer Grid View */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/40 overflow-hidden shadow-xs relative">
        
        {/* Color Legend overlay if std or zoomed */}
        {zoomLevel !== 'fit' && (
          <div className="p-3 border-b border-light border-slate-100 dark:border-teal-900/20 bg-slate-50/50 dark:bg-slate-900/20 flex flex-wrap gap-3 text-[10px]">
            <div className="flex items-center space-x-1 font-semibold dark:text-slate-300">
              <span className="w-3 h-3 bg-emerald-500 rounded flex items-center justify-center text-[8px] text-white">A</span>
              <span>Adenine</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold dark:text-slate-300">
              <span className="w-3 h-3 bg-blue-500 rounded flex items-center justify-center text-[8px] text-white">C</span>
              <span>Cytosine</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold dark:text-slate-300">
              <span className="w-3 h-3 bg-amber-500 rounded flex items-center justify-center text-[8px] text-slate-850">G</span>
              <span>Guanine</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold dark:text-slate-300">
              <span className="w-3 h-3 bg-rose-500 rounded flex items-center justify-center text-[8px] text-white">T</span>
              <span>Thymine</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold dark:text-slate-300">
              <span className="w-3 h-3 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-teal-950 rounded flex items-center justify-center text-[8px] text-slate-400">-</span>
              <span>Gap Insertion</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto" ref={scrollContainerRef}>
          <div className="min-w-fit select-none font-mono">
            
            {/* Grid aligned titles + characters split */}
            <div className="space-y-1.5 py-4">
              {aligned.map((seq, seqIdx) => (
                <div key={seq.id} className="flex items-center">
                  
                  {/* Sticky row sequence metadata label */}
                  <div className="w-44 md:w-56 px-4 py-1 shrink-0 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans text-[11px] truncate font-bold border-r border-slate-150 sticky left-0 z-10 flex items-center justify-between">
                    <span className="truncate">{seq.name}</span>
                    <span className="text-[9px] font-mono font-medium text-slate-400 dark:text-slate-500 ml-1.5 shrink-0">
                      {seq.sequence.replace(/-/g, '').length}bp
                    </span>
                  </div>

                  {/* Character blocks row */}
                  <div className="flex items-center pl-2">
                    {Array.from(seq.sequence).map((base, baseIdx) => {
                      const bgClass = getBaseBgColor(base);
                      return (
                        <div
                          key={baseIdx}
                          className={`flex items-center justify-center h-5 transition-all text-center rounded-xs ${bgClass} ${fontSizeClass} shrink-0`}
                          style={{ 
                            width: `${cellWidth}px`,
                            marginRight: zoomLevel === 'locus' ? '1px' : '0px'
                          }}
                        >
                          {base}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Consensus line separator */}
              <div className="h-px bg-slate-200 dark:bg-teal-900/40 my-3 pl-2" />

              {/* Consensus row */}
              <div className="flex items-center bg-teal-500/5 dark:bg-teal-950/20 py-2">
                <div className="w-44 md:w-56 px-4 shrink-0 bg-transparent text-teal-800 dark:text-teal-400 font-sans text-[11px] font-bold sticky left-0 z-10 flex items-center">
                  ★ CONSENSUS
                </div>
                <div className="flex items-center pl-2">
                  {Array.from(results.consensus).map((base, baseIdx) => {
                    const bgClass = getBaseBgColor(base);
                    return (
                      <div
                        key={`consensus-${baseIdx}`}
                        className={`flex items-center justify-center h-5 text-center ${bgClass} opacity-80 ${fontSizeClass} shrink-0 rounded-xs`}
                        style={{ 
                          width: `${cellWidth}px`,
                          marginRight: zoomLevel === 'locus' ? '1px' : '0px'
                        }}
                      >
                        {base}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      <MethodsBadge 
        method="Progressive Multiple Sequence Alignment"
        algorithm="ClustalW-inspired progressive pairwise alignment (hierarchical guide tree clustering)"
        reference="Thompson, J.D., Higgins, D.G. and Gibson, T.J., 1994. CLUSTAL W: improving the sensitivity of progressive multiple sequence alignment through sequence weighting, position-specific gap penalties and weight matrix choice. Nucleic Acids Research, 22(22), pp.4673-4680."
      />
    </div>
  );
}
