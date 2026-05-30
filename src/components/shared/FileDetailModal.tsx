import React, { useEffect } from 'react';
import { X, Download, MapPin, BarChart2, Hash, Percent, FileText } from 'lucide-react';
import { UploadedFile } from '../../types';

interface FileDetailModalProps {
  file: UploadedFile;
  isOpen: boolean;
  onClose: () => void;
}

export function FileDetailModal({ file, isOpen, onClose }: FileDetailModalProps) {
  // ESC key listener for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Aggregate stats from parsed sequences if available
  const sequences = file.parsedSequences || [];
  const seqCount = sequences.length;

  const totalLength = sequences.reduce((sum, s) => sum + (s.sequence?.length || 0), 0);
  const totalNs = sequences.reduce((sum, s) => sum + (s.nCount || (s.sequence?.match(/N/gi)?.length || 0)), 0);
  const nPercent = totalLength > 0 ? ((totalNs / totalLength) * 100).toFixed(1) : '0';

  const computeGC = (seqStr: string) => {
    if (!seqStr) return 0;
    const cleanSeq = seqStr.toUpperCase().replace(/[^ATCG]/g, '');
    if (cleanSeq.length === 0) return 0;
    const gcCount = (cleanSeq.match(/[GC]/g) || []).length;
    return (gcCount / cleanSeq.length) * 100;
  };

  const totalGC = sequences.reduce((sum, s) => sum + (s.gcContent ?? computeGC(s.sequence || '')), 0);
  const avgGC = seqCount > 0 ? (totalGC / seqCount).toFixed(1) : '0';
  const avgAT = (100 - parseFloat(avgGC)).toFixed(1);

  // Collect locations
  const locations = Array.from(
    new Set(
      sequences
        .map(s => s.metadata?.location || s.location)
        .filter((loc): loc is string => typeof loc === 'string' && loc.trim().length > 0)
    )
  );

  const primarySequence = sequences[0]?.sequence || '';
  const previewBases = primarySequence.substring(0, 200);

  const colorBase = (char: string, index: number) => {
    const c = char.toUpperCase();
    if (c === 'A') return <span key={index} className="text-emerald-700 font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-0.5 rounded-xs" title="Adenine">A</span>;
    if (c === 'C') return <span key={index} className="text-blue-700 font-mono font-bold bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 px-0.5 rounded-xs" title="Cytosine">C</span>;
    if (c === 'G') return <span key={index} className="text-amber-700 font-mono font-bold bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-0.5 rounded-xs" title="Guanine">G</span>;
    if (c === 'T') return <span key={index} className="text-rose-700 font-mono font-bold bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 px-0.5 rounded-xs" title="Thymine">T</span>;
    if (c === 'N') return <span key={index} className="text-slate-500 font-mono font-bold bg-slate-100 dark:bg-slate-900/80 dark:text-slate-400 px-0.5 rounded-xs" title="Unknown / Ambiguity">N</span>;
    return <span key={index} className="text-purple-700 font-mono font-bold bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 px-0.5 rounded-xs" title={`Ambiguity Code: ${c}`}>{c}</span>;
  };

  const exportFile = () => {
    if (sequences.length === 0) return;
    let content = '';
    sequences.forEach(seq => {
      const loc = seq.metadata?.location || seq.location;
      const header = `>${seq.name}${loc ? `|${loc}` : ''}${seq.species ? `|${seq.species}` : ''}`;
      content += `${header}\n${seq.sequence}\n`;
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name.endsWith('.fasta') || file.name.endsWith('.fa') ? file.name : `${file.name}.fasta`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-teal-900">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-teal-950">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-teal-950 dark:text-teal-50 text-sm sm:text-base truncate max-w-[400px]">
                {file.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Staged file insights & nucleotide visualization
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm text-slate-700 dark:text-slate-300">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-1 border border-slate-100 dark:border-teal-950/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">General Information</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{file.type || 'FASTA'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Format Structure Type</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-1 border border-slate-100 dark:border-teal-950/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">File Size</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{(file.size / 1024).toFixed(1)} KB</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Disk Storage Size</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-1 border border-slate-100 dark:border-teal-950/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Total Sequences</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{seqCount} record{seqCount !== 1 ? 's' : ''}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extracted Headers count</p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-1 border border-slate-100 dark:border-teal-950/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Ambiguous bases (N)</span>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{totalNs} bp <span className="text-xs font-normal text-slate-500">({nPercent}%)</span></p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sub-standard trace reads</p>
            </div>
          </div>

          {/* Stats Bar Chart info */}
          <div className="border border-slate-100 dark:border-teal-950/30 rounded-lg p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Base Composition Fractions</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>GC Content Percentage</span>
                  <span className="font-bold text-teal-600">{avgGC}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full" style={{ width: `${avgGC}%` }} />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>AT Content Percentage</span>
                  <span className="font-bold text-amber-600">{avgAT}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${avgAT}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Location row */}
          <div className="flex items-start space-x-2.5 p-3 rounded-lg border border-slate-100 dark:border-teal-950/30 bg-white dark:bg-slate-800">
            <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Geographic Information</span>
              {locations.length > 0 ? (
                <p className="font-semibold text-slate-900 dark:text-slate-100">{locations.join(', ')}</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 italic">No geographic location specified in sequence file headers</p>
              )}
            </div>
          </div>

          {/* Sequence Preview Box */}
          {previewBases.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block">Sequence Preview (First 200 bases)</label>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-teal-950/40 text-xs font-mono select-all leading-relaxed tracking-wider break-all max-h-[120px] overflow-y-auto">
                {previewBases.split('').map((char, idx) => colorBase(char, idx))}
                {primarySequence.length > 200 && <span className="text-slate-400 font-bold"> ...</span>}
              </div>
              <p className="text-[10px] text-slate-400 italic">
                *Hover nucleotides to view base identity. Total active sequence spans {totalLength} bp.
              </p>
            </div>
          )}
        </div>
        
        {/* Footer actions */}
        <div className="p-4 border-t border-slate-100 dark:border-teal-950 bg-slate-50/50 dark:bg-slate-900/60 flex justify-end gap-2 shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-slate-205 dark:border-teal-950 rounded-lg hover:bg-slate-105 active:bg-slate-150 text-slate-650 dark:text-slate-300 font-medium text-xs dark:hover:bg-slate-900 cursor-pointer transition-all"
          >
            Close Window
          </button>
          
          {seqCount > 0 && (
            <button 
              onClick={exportFile} 
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg cursor-pointer transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export FASTA</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
