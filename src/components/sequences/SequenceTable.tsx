import { useState, useMemo } from 'react';
import { 
  Eye, 
  Download, 
  Trash2, 
  Search, 
  ArrowUpDown, 
  Database, 
  CheckSquare, 
  Square, 
  Trash, 
  FileDown,
  Info,
  AlertCircle
} from 'lucide-react';
import { GeneticSequence } from '../../types';
import { useAppStore } from '../../stores/appStore';
import SequenceDetail from './SequenceDetail';
import { WelcomeInsight } from './WelcomeInsight';

interface SequenceTableProps {
  onOpenCleaner?: () => void;
}

export default function SequenceTable({ onOpenCleaner }: SequenceTableProps) {
  const { 
    sequences, 
    removeSequence,
    activeSequenceId, 
    setActiveSequence,
    isDemoMode,
    showToast
  } = useAppStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<'name' | 'length' | 'gcContent' | 'nCount' | 'format'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Slide drawer controller
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  // Filter sequences
  const filteredSequences = useMemo(() => {
    if (!Array.isArray(sequences)) return [];
    return sequences.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.metadata?.species || s.species || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.metadata?.location || s.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sequences, searchTerm]);

  // Sort sequences
  const sortedSequences = useMemo(() => {
    if (!Array.isArray(filteredSequences)) return [];
    const sorted = [...filteredSequences];
    sorted.sort((a, b) => {
      let valA: any = a[sortField] ?? '';
      let valB: any = b[sortField] ?? '';

      if (sortField === 'nCount') {
        valA = a.nCount ?? 0;
        valB = b.nCount ?? 0;
      } else if (sortField === 'format') {
        valA = a.format ?? 'fasta';
        valB = b.format ?? 'fasta';
      }

      if (typeof valA === 'string') {
        const strA = valA.toLowerCase();
        const strB = valB.toLowerCase();
        return sortDirection === 'asc' 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      } else {
        return sortDirection === 'asc' 
          ? (valA - valB) 
          : (valB - valA);
      }
    });
    return sorted;
  }, [filteredSequences, sortField, sortDirection]);

  // Validate sequences is array before rendering (Error Boundary)
  if (!Array.isArray(sequences)) {
    console.error('SequenceTable: sequences is not an array', sequences);
    return (
      <div className="text-center py-12 bg-red-50 rounded-xl">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800">Data Error</h3>
        <p className="text-red-600 mt-1">Sequence data is corrupted. Please reset or re-upload.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
        >
          Reset Page
        </button>
      </div>
    );
  }

  // Handle sort triggering
  const handleSort = (field: 'name' | 'length' | 'gcContent' | 'nCount' | 'format') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Bulk Selection functions
  const handleSelectAll = () => {
    if (selectedIds.length === sortedSequences.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedSequences.map(s => s.id));
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  };

  // Actions
  const handleView = (id: string) => {
    setSelectedDetailId(id);
    setActiveSequence(id);
    setDetailOpen(true);
  };

  const handleDownloadSingle = (seq: GeneticSequence) => {
    const headerSpecies = seq.metadata?.species || seq.species || 'Unknown species';
    const headerLoc = seq.metadata?.location || seq.location || 'N/A';
    const text = `>${seq.name} | ${headerSpecies} | ${headerLoc}\n${seq.sequence}`;
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

  const handleBulkDelete = () => {
    if (isDemoMode) {
      showToast('Cannot delete or modify sequences in read-only Demo Mode.', 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected sequences?`)) {
      selectedIds.forEach(id => removeSequence(id));
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    const selectedSeqs = sequences.filter(s => selectedIds.includes(s.id));
    if (selectedSeqs.length === 0) return;

    let content = '';
    selectedSeqs.forEach(seq => {
      const headerSpecies = seq.metadata?.species || seq.species || 'Unknown species';
      const headerLoc = seq.metadata?.location || seq.location || 'N/A';
      content += `>${seq.name} | ${headerSpecies} | ${headerLoc}\n${seq.sequence}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `multi_fasta_export_${selectedSeqs.length}_reads.fasta`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Stats
  const displayLength = sortedSequences.length;

  return (
    <div className="space-y-4">
      {/* Search and control strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-teal-900/60 shadow-xs">
        
        {/* Left Side: Search Form Input */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search sample name, species, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-teal-900 rounded-lg bg-white dark:bg-slate-900 text-teal-950 dark:text-teal-50 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Right Side Actions: Trimmer launcher */}
        {onOpenCleaner && sequences.length > 0 && (
          <button
            onClick={onOpenCleaner}
            className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-900/60 rounded-lg cursor-pointer transition-colors shrink-0 inline-flex items-center space-x-1.5"
          >
            <span>🧹 Open Sensi-Cleaner / Trimmer</span>
          </button>
        )}
      </div>

      {sequences.length === 0 ? (
        <div className="p-16 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-teal-900 shadow-xs">
          <Database className="w-12 h-12 mx-auto text-slate-400 mb-4 animate-pulse" />
          <h3 className="text-base font-bold text-teal-950 dark:text-teal-50">
            No active sequences loaded
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
            Please navigate to the <strong>DASHBOARD / UPLOAD</strong> module to parse sequence trace readouts, or load curated demo datasets for Javan Rusa, COI Barcodes, or 16S Bacteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <WelcomeInsight sequences={sequences} />
          
          {/* Bulk actions status panel */}
          {selectedIds.length > 0 && (
            <div className="p-3 bg-teal-50/50 dark:bg-slate-900 border border-teal-100 dark:border-teal-950 rounded-lg flex items-center justify-between text-xs animate-fade-in animate-duration-150">
              <div className="flex items-center space-x-2 text-teal-950 dark:text-teal-200 font-medium">
                <Info className="w-4 h-4 text-teal-500 shrink-0" />
                <span>Selected <strong>{selectedIds.length}</strong> of {displayLength} sequences</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkExport}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-teal-900 text-teal-700 dark:text-teal-300 rounded-md font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer shadow-3xs"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export Selection as multi-FASTA</span>
                </button>

                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900 rounded-md font-bold transition-all inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash className="w-3.5 h-3.5" />
                  <span>Delete Selected</span>
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-hidden bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/60 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-150 dark:border-teal-950/50">
                    {/* Selector check */}
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        onClick={handleSelectAll}
                        className="text-slate-400 hover:text-teal-500 transition-colors inline-block cursor-pointer align-middle"
                        title={selectedIds.length === sortedSequences.length ? 'Deselect all' : 'Select all'}
                      >
                        {selectedIds.length === sortedSequences.length && sortedSequences.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-teal-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>

                    <th 
                      onClick={() => handleSort('name')} 
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-teal-950/20 transition-all font-bold uppercase tracking-wider text-[10px]"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Sequence Sample Identifier</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('length')} 
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-teal-950/20 transition-all font-bold uppercase tracking-wider text-[10px]/[12px]"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Length (bp)</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('gcContent')} 
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-teal-950/20 transition-all font-bold uppercase tracking-wider text-[10px]"
                    >
                      <div className="flex items-center space-x-1">
                        <span>GC % Ratio</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('nCount')} 
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-teal-950/20 transition-all font-bold uppercase tracking-wider text-[10px]"
                    >
                      <div className="flex items-center space-x-1">
                        <span>N Count</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>

                    <th 
                      onClick={() => handleSort('format')} 
                      className="py-3 px-4 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-teal-950/20 transition-all font-bold uppercase tracking-wider text-[10px] text-center"
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span>Format</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>

                    <th className="py-3 px-4 text-right font-bold uppercase tracking-wider text-[10px]">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-teal-950/30">
                  {sortedSequences.map((seq) => {
                    const isSelected = selectedIds.includes(seq.id);
                    const isTableActive = activeSequenceId === seq.id;

                    const speciesLabel = seq.metadata?.species || seq.species || 'Species unverified';
                    const locLabel = seq.metadata?.location || seq.location || 'Location unrecorded';

                    return (
                      <tr 
                        key={seq.id} 
                        className={`hover:bg-teal-50/25 dark:hover:bg-slate-800/10 transition-colors ${
                          isTableActive ? 'bg-teal-50/15 dark:bg-teal-950/10' : ''
                        }`}
                      >
                        {/* Check selector */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleSelectRow(seq.id)}
                            className="text-slate-400 hover:text-teal-500 transition-colors inline-block cursor-pointer align-middle"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-teal-500" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* Name and metadata labels */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5 max-w-[280px]">
                            <span 
                              onClick={() => handleView(seq.id)}
                              className="font-bold text-teal-950 dark:text-teal-50 hover:text-teal-650 dark:hover:text-teal-300 transition-all block cursor-pointer truncate"
                            >
                              {seq.name}
                            </span>
                            <span className="text-[10px] italic text-slate-500 dark:text-slate-400 block truncate" title={`${speciesLabel} • ${locLabel}`}>
                              {speciesLabel} • {locLabel}
                            </span>
                          </div>
                        </td>

                        {/* Length */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {seq.length}
                        </td>

                        {/* GC content */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {seq.gcContent}%
                        </td>

                        {/* N Count */}
                        <td className="py-3 px-4 font-mono font-medium">
                          {seq.nCount ?? 0 > 0 ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                              {seq.nCount}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">0</span>
                          )}
                        </td>

                        {/* Format */}
                        <td className="py-3 px-4 text-center">
                          <span className="px-1.5 py-0.5 rounded-sm font-mono text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-teal-950 text-teal-900 dark:text-teal-300">
                            {seq.format || 'fasta'}
                          </span>
                        </td>

                        {/* Operational elements */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              onClick={() => handleView(seq.id)}
                              className="p-1.5 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-md transition-all cursor-pointer"
                              title="View full sequence detail panel"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDownloadSingle(seq)}
                              className="p-1.5 text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700 rounded-md transition-all cursor-pointer"
                              title="Download FASTA file"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (isDemoMode) {
                                  showToast('Cannot delete or modify sequences in read-only Demo Mode.', 'error');
                                } else {
                                  removeSequence(seq.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-md transition-all cursor-pointer"
                              title="Delete from active session"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination / Total info strip */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-150 dark:border-teal-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Showing <strong>{sortedSequences.length}</strong> of <strong>{sequences.length}</strong> loaded sequences.
              </span>
              <span>
                Use checkboxes on the left to perform batch operations on your dataset files.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Slide Drawer component mount */}
      <SequenceDetail
        sequenceId={selectedDetailId}
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}
