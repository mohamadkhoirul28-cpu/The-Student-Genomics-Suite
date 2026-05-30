import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Copy, Check, Download, Calendar, MapPin, Award, Activity, Edit3 } from 'lucide-react';
import { GeneticSequence } from '../../types';
import { useAppStore } from '../../stores/appStore';

interface SequenceDetailProps {
  sequenceId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SequenceDetail({ sequenceId, isOpen, onClose }: SequenceDetailProps) {
  const { updateSequence, isDemoMode } = useAppStore();
  const sequences = useAppStore(state => state.getActiveSequences());
  const sequence = sequences.find(s => s.id === sequenceId) || null;
  
  const [copied, setCopied] = useState(false);
  const [location, setLocation] = useState('');
  const [species, setSpecies] = useState('');
  const [collDate, setCollDate] = useState('');

  // Sync state when sequence changes
  useEffect(() => {
    if (sequence) {
      setLocation(sequence.metadata?.location || sequence.location || '');
      setSpecies(sequence.metadata?.species || sequence.species || '');
      setCollDate(sequence.metadata?.collectionDate || '');
    }
  }, [sequence, sequenceId]);

  if (!isOpen || !sequence) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sequence.sequence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `>${sequence.name} | ${species || 'Unidentified'} | ${location || 'N/A'}\n${sequence.sequence}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sequence.name.toLowerCase().replace(/\s+/g, '_')}.fasta`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFieldChange = (field: 'location' | 'species' | 'collectionDate', val: string) => {
    if (field === 'location') {
      setLocation(val);
      updateSequence(sequence.id, { metadata: { location: val, species, collectionDate: collDate } });
    } else if (field === 'species') {
      setSpecies(val);
      updateSequence(sequence.id, { metadata: { location, species: val, collectionDate: collDate } });
    } else if (field === 'collectionDate') {
      setCollDate(val);
      updateSequence(sequence.id, { metadata: { location, species, collectionDate: val } });
    }
  };

  // Calculations
  const seqLength = sequence.sequence.length;
  const gcPct = sequence.gcContent;
  const atPct = parseFloat((100 - gcPct).toFixed(2));
  const nCnt = sequence.nCount ?? (sequence.sequence.match(/[Nn]/g) || []).length;
  const nPct = seqLength > 0 ? parseFloat(((nCnt / seqLength) * 100).toFixed(2)) : 0;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Slide-out Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-teal-950 z-50 flex flex-col overflow-hidden text-slate-800 dark:text-slate-100"
      >
        {/* Header section */}
        <div className="p-5 border-b border-slate-150 dark:border-teal-950/60 bg-slate-50 dark:bg-slate-950/40 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-sm bg-teal-100 dark:bg-teal-950 text-[10px] uppercase font-bold tracking-wider text-teal-850 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
                {sequence.format?.toUpperCase() || 'FASTA'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                ID: {sequence.id}
              </span>
            </div>
            <h3 className="text-base font-bold text-teal-950 dark:text-teal-50 truncate max-w-[280px] mt-1" title={sequence.name}>
              {sequence.name}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Section 1: Core Molecular Statistics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Molecular Profiling Stats
            </h4>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 rounded-lg bg-teal-50/30 dark:bg-slate-950/30 border border-teal-100/40 dark:border-teal-950/40">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Sequence Length</span>
                <span className="text-lg font-bold font-mono text-teal-900 dark:text-teal-300">{seqLength}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">bp</span>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/30 dark:bg-slate-950/30 border border-teal-100/40 dark:border-teal-950/40">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">GC Content</span>
                <span className="text-lg font-bold font-mono text-emerald-600 dark:text-teal-300">{gcPct}%</span>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/30 dark:bg-slate-950/30 border border-teal-100/40 dark:border-teal-950/40">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">AT Content</span>
                <span className="text-lg font-bold font-mono text-amber-600 dark:text-teal-300">{atPct}%</span>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/30 dark:bg-slate-950/30 border border-teal-100/40 dark:border-teal-950/40">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Ambiguity (N Count)</span>
                <span className="text-lg font-bold font-mono text-slate-600 dark:text-teal-300">{nCnt}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1">({nPct}%)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Metadata Editable Fields */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Biosample Metadata {isDemoMode ? '(Demo Locked)' : '(Editable)'}
              </h4>
              <Edit3 className="w-3.5 h-3.5 text-teal-500" />
            </div>

            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-150 dark:border-teal-950/40">
              
              {/* Species Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Taxonomic Species Designation</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rusa timorensis (Javan Rusa)"
                  value={species}
                  onChange={(e) => handleFieldChange('species', e.target.value)}
                  disabled={isDemoMode}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-teal-900 rounded-lg bg-white dark:bg-slate-800 text-teal-950 dark:text-teal-50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-850"
                />
              </div>

              {/* Location Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Geographic Isolation site</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Taman Nasional Baluran, Jawa Timur"
                  value={location}
                  onChange={(e) => handleFieldChange('location', e.target.value)}
                  disabled={isDemoMode}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-teal-900 rounded-lg bg-white dark:bg-slate-800 text-teal-950 dark:text-teal-50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-850"
                />
              </div>

              {/* Collection Date Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  <span>Collection Date</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-07-24"
                  value={collDate}
                  onChange={(e) => handleFieldChange('collectionDate', e.target.value)}
                  disabled={isDemoMode}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-teal-900 rounded-lg bg-white dark:bg-slate-800 text-teal-950 dark:text-teal-50 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-850"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Nucleotide Base Visualizer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Colored Nucleotide Reads
              </h4>
              
              {/* Color legends */}
              <div className="flex items-center space-x-2 text-[9px] font-bold">
                <span className="flex items-center space-x-0.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> <span>A</span></span>
                <span className="flex items-center space-x-0.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> <span>C</span></span>
                <span className="flex items-center space-x-0.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> <span>G</span></span>
                <span className="flex items-center space-x-0.5"><span className="w-2 h-2 rounded-full bg-red-500" /> <span>T</span></span>
                <span className="flex items-center space-x-0.5"><span className="w-2 h-2 rounded-full bg-slate-400" /> <span>N / -</span></span>
              </div>
            </div>

            {/* Custom Grid visualizer to prevent massive single text layout crashes */}
            <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] leading-relaxed max-h-72 overflow-y-auto select-all break-all tracking-widest border border-slate-850 shadow-inner scrollbar">
              {sequence.sequence.split('').map((base, idx) => {
                let colorClass = 'text-slate-400';
                if (base === 'A' || base === 'a') colorClass = 'text-emerald-400';
                else if (base === 'C' || base === 'c') colorClass = 'text-blue-400';
                else if (base === 'G' || base === 'g') colorClass = 'text-amber-400';
                else if (base === 'T' || base === 't') colorClass = 'text-red-400';

                return (
                  <span key={idx} className={`${colorClass} font-bold transition-all`}>
                    {base}
                  </span>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-150 dark:border-teal-950 bg-slate-50 dark:bg-slate-950/50 flex space-x-3">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-teal-900/60 rounded-lg text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-150 transition-all flex items-center justify-center space-x-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy DNA</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-2.5 px-4 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Download FASTA</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
