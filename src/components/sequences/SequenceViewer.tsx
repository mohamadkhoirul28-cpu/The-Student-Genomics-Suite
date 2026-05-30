import { useState, useMemo } from 'react';
import { GeneticSequence } from '../../types';
import { Search, Download, Check, Clipboard, Tag, Calendar, Database, Eye } from 'lucide-react';

interface SequenceViewerProps {
  sequences: GeneticSequence[];
}

export default function SequenceViewer({ sequences }: SequenceViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeq, setSelectedSeq] = useState<GeneticSequence | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-select first sequence if available
  useMemo(() => {
    if (sequences.length > 0 && !selectedSeq) {
      setSelectedSeq(sequences[0]);
    }
  }, [sequences, selectedSeq]);

  // Filter sequences by query
  const filteredSequences = useMemo(() => {
    return sequences.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.species && s.species.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [sequences, searchTerm]);

  // Toggle Clipboard Copy
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Trigger FASTA Downloads
  const downloadFasta = (seq: GeneticSequence) => {
    const text = `>${seq.name} | ${seq.species || 'Unknown Source'}\n${seq.sequence}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${seq.name.toLowerCase().replace(/\s+/g, '_')}.fasta`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-teal-950 dark:text-teal-50">
            Genetic Sequence Explorer ({sequences.length} Samples)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect formatted DNA nucleotide sequence reads ready for alignment and analysis.
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sample, species, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-teal-850 rounded-lg bg-white dark:bg-slate-800 text-teal-950 dark:text-teal-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>

      {sequences.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-teal-900/60">
          <Database className="w-12 h-12 mx-auto text-slate-400 mb-4 animate-pulse" />
          <p className="text-base font-bold text-teal-950 dark:text-teal-50">
            No Sequences Loaded
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Please upload Sanger/FASTA sequence files or select a preloaded demo dataset from the upload section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: List Of Sequences */}
          <div className="lg:col-span-4 space-y-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-teal-900/60 max-h-[600px] overflow-y-auto index-list">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
              Staged Sequences ({filteredSequences.length})
            </h3>
            
            <div className="space-y-2">
              {filteredSequences.map((seq) => {
                const isSelected = selectedSeq?.id === seq.id;
                return (
                  <div
                    key={seq.id}
                    onClick={() => setSelectedSeq(seq)}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all duration-200 text-xs ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-800/40 hover:border-teal-200 dark:hover:border-teal-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-teal-950 dark:text-teal-150 truncate max-w-[170px]">
                        {seq.name}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-teal-600 dark:text-teal-400">
                        {seq.length} bp
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] italic text-slate-550 dark:text-slate-400 truncate max-w-[140px]">
                        {seq.species || 'Species unverified'}
                      </span>
                      <span className="text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                        GC: {seq.gcContent}%
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {filteredSequences.length === 0 && (
                <p className="text-xs text-slate-550 text-center py-4">
                  No samples match your search criteria.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Deep Sequence Visualizer */}
          <div className="lg:col-span-8 space-y-4">
            {selectedSeq ? (
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-teal-900/60 space-y-5">
                
                {/* Meta Header */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-teal-900/40 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-teal-950 dark:text-teal-50">
                      {selectedSeq.name}
                    </h3>
                    <p className="text-xs italic text-teal-600 dark:text-teal-450">
                      {selectedSeq.species || 'Species awaiting alignment'}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => copyToClipboard(selectedSeq.sequence, 'main')}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-0 rounded-md text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-200 transition-all shadow-2xs"
                      title="Copy raw clean sequence"
                    >
                      {copiedId === 'main' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Clipboard className="w-3.5 h-3.5" />
                          <span>Copy Sequence</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => downloadFasta(selectedSeq)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white rounded-md text-xs font-bold shadow-2xs cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export .fasta</span>
                    </button>
                  </div>
                </div>

                {/* Grid Metadata Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-teal-900/40">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                      Sequence Length
                    </span>
                    <span className="text-sm font-bold font-mono text-teal-900 dark:text-teal-100">
                      {selectedSeq.length} bp
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                      GC-Content Ratio
                    </span>
                    <span className="text-sm font-bold font-mono text-teal-900 dark:text-teal-100">
                      {selectedSeq.gcContent}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                      Isolation Location
                    </span>
                    <span className="text-xs font-semibold text-teal-950 dark:text-teal-100 truncate block">
                      {selectedSeq.location || 'N/A'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                      Data Origin Segment
                    </span>
                    <span className="text-xs font-semibold text-teal-950 dark:text-teal-100 truncate block">
                      {selectedSeq.source}
                    </span>
                  </div>
                </div>

                {/* Color-Coded DNA Sequence Visualizer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 dark:text-slate-550">
                    <div className="flex items-center space-x-1.5">
                      <Eye className="w-4 h-4 text-teal-500" />
                      <span className="text-slate-600 dark:text-slate-400">Nucleotide Sequence (Sanger Quality Trimmed)</span>
                    </div>
                    {/* Color Key Indicators */}
                    <div className="flex space-x-3 text-[10px]">
                      <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500" /> <span className="dark:text-slate-350">A</span></span>
                      <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> <span className="dark:text-slate-350">C</span></span>
                      <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> <span className="dark:text-slate-350">G</span></span>
                      <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> <span className="dark:text-slate-350">T</span></span>
                    </div>
                  </div>

                  {/* Character block grid */}
                  <div className="p-4 rounded-lg bg-slate-950 text-white font-mono text-xs leading-relaxed max-h-80 overflow-y-auto select-all break-all tracking-widest uppercase border border-slate-800 scrollbar">
                    {selectedSeq.sequence.split('').map((base, idx) => {
                      let color = 'text-gray-450';
                      if (base === 'A' || base === 'a') color = 'text-green-500';
                      if (base === 'C' || base === 'c') color = 'text-blue-500';
                      if (base === 'G' || base === 'g') color = 'text-amber-500';
                      if (base === 'T' || base === 't') color = 'text-red-500';
                      
                      return (
                        <span key={idx} className={`${color} font-bold transition-all duration-150`}>
                          {base}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Academic Tip alert panel */}
                <div className="p-3.5 bg-teal-50/45 dark:bg-slate-900/40 rounded-lg border border-teal-100 dark:border-teal-900 text-xs text-teal-950 dark:text-teal-300 leading-relaxed flex items-start space-x-2">
                  <span className="px-1.5 py-0.5 rounded-sm bg-teal-200/50 dark:bg-emerald-950/50 text-[10px] font-bold text-teal-800 dark:text-emerald-300 shrink-0 mt-0.5 uppercase tracking-wide">
                    BIOINFORMATICS TIP
                  </span>
                  <p className="text-slate-655 dark:text-slate-350">
                    This sequence contains clean trimmed reads. Go to the <strong>Diversity Metrics</strong> tab to estimate population markers or use the <strong>NCBI BLAST</strong> proxy interface to analyze taxonomy alignment.
                  </p>
                </div>

              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-12 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-teal-900/60">
                <span className="text-xs text-slate-500">Pick a sequence from the left list to inspect detailed nucleotide properties.</span>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
