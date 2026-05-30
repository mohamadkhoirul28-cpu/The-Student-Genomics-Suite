import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../stores/appStore';
import { apiService } from '../../services/apiService';
import BlastResults from './BlastResults';
import SpeciesCard from './SpeciesCard';
import { NCBIStatusBadge } from './NCBIStatusBadge';
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Download, 
  ExternalLink,
  Database, 
  Radio, 
  Trash2, 
  Clock, 
  Sparkles, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';
import { Tooltip } from '../shared/Tooltip';

interface BlastResult {
  accession: string;
  description: string;
  score: number;
  evalue: number;
  identity: number;
  identity_str?: string;
}

interface BlastResponse {
  rid: string;
  results_count: number;
  results: BlastResult[];
  source: string;
  note?: string;
  error?: string;
}

export default function BlastSearch() {
  const { 
    blastSearch, 
    setBlastSearch, 
    setActiveReportFocus, 
    setViewRedirect,
    useRealAPIs,
    ncbiBackendAvailable,
    blastHistory: globalBlastHistory,
    addBlastResult,
    clearBlastResults,
    deleteBlastResult
  } = useAppStore();
  
  const sequences = useAppStore(state => state.getActiveSequences());
  
  const [querySequence, setQuerySequence] = useState('');
  const [selectedSequenceId, setSelectedSequenceId] = useState<string>('');
  const [program, setProgram] = useState('blastn');
  const [database, setDatabase] = useState('nt');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [resultsCount, setResultsCount] = useState(0);
  const [rid, setRid] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  // Clear history function using the global store and local reset
  const clearHistory = () => {
    clearBlastResults();
    setResults([]);
    setResultsCount(0);
    setRid(null);
    setError(null);
    setIsSearching(false);
    setQuerySequence('');
    setSelectedSequenceId('');
    setBlastSearch({
      results: null,
      selectedHit: null,
      querySequence: ''
    });
  };

  // Derived state for the UI template compatibility
  const useRealNCBI = useRealAPIs && ncbiBackendAvailable;

  // Get backend URL from environment
  const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8080';

  // Restore previous results on mount/tab switch
  useEffect(() => {
    if (blastSearch.results) {
      setResults(blastSearch.results);
      setResultsCount(blastSearch.results.length);
      if (blastSearch.querySequence) {
        setQuerySequence(blastSearch.querySequence);
      }
    }
  }, [blastSearch.results, blastSearch.querySequence]);

  // Load sequence from selected file
  useEffect(() => {
    if (selectedSequenceId && sequences.length > 0) {
      const selected = sequences.find(s => s.id === selectedSequenceId);
      if (selected) {
        setQuerySequence(`>${selected.name}\n${selected.sequence}`);
      }
    }
  }, [selectedSequenceId, sequences]);

  const performBlast = async () => {
    // Extract raw bases (excluding FASTA header line)
    const rawSequence = querySequence.includes('\n')
      ? querySequence.split('\n').slice(1).join('')
      : querySequence;

    if (!rawSequence.trim() || rawSequence.replace(/[-\s]/g, '').length < 50) {
      setError('Sequence too short. Minimum 50 bases required for BLAST.');
      useAppStore.getState().showToast('Sequence is too short. Minimum 50 bases required.', 'error');
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults([]);
    setRid(null);
    const startTime = Date.now();

    // Set searching status in global store
    setBlastSearch({
      isSearching: true,
      progressStep: 'Connecting to NCBI servers...',
      querySequence: querySequence,
      results: null,
      selectedHit: null
    });

    try {
      let computedResults: any[] = [];
      let resolvedRid = `blast_rid_${startTime}`;

      if (useRealAPIs && ncbiBackendAvailable) {
        // Real Live Mode
        setBlastSearch({ progressStep: 'Submitting query sequence to backend proxy gateway...' });
        
        const response = await fetch(`${BACKEND_URL}/api/ncbi/blast`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sequence: rawSequence.trim(),
            program: program,
            database: database
          })
        });

        if (!response.ok) {
          throw new Error(`Proxy backend responded with error status ${response.status}`);
        }

        const data: BlastResponse = await response.json();
        const elapsed = (Date.now() - startTime) / 1000;
        setSearchTime(elapsed);

        if (data.error) {
          throw new Error(data.error);
        } else if (!data.results || data.results_count === 0) {
          setError('No significant matches found. Try a longer sequence or different database.');
          setBlastSearch({
            isSearching: false,
            progressStep: 'Alignments search completed with empty results.',
            querySequence: ''
          });
          setIsSearching(false);
          setQuerySequence('');
          setSelectedSequenceId('');
          return;
        }

        resolvedRid = data.rid || `rid_${Date.now()}`;
        setRid(resolvedRid);

        // Map backend results to BlastHit frontend structure
        computedResults = data.results.map((r, idx) => ({
          rank: idx + 1,
          accession: r.accession,
          species: r.description,
          score: r.score,
          cover: 100, // standard complete coverage fallback
          evalue: typeof r.evalue === 'number' && r.evalue === 0 ? '0.0' : String(r.evalue),
          identity: parseFloat(r.identity.toFixed(1))
        }));

      } else {
        // Offline / Simulation Mock Mode
        setBlastSearch({ progressStep: 'Initializing local mock DB genome alignments...' });
        await new Promise(r => setTimeout(r, 600));
        setBlastSearch({ progressStep: 'Computing sequence matrix similarity...' });
        await new Promise(r => setTimeout(r, 800));

        const mockHits = await apiService.blastSearch(rawSequence, program, database);
        computedResults = mockHits;
        const elapsed = (Date.now() - startTime) / 1000;
        setSearchTime(elapsed);
        setRid(`simulated_rid_${startTime}`);
      }

      // Save to React Local state
      setResults(computedResults);
      setResultsCount(computedResults.length);

      // Hydrate Global Store
      setBlastSearch({
        isSearching: false,
        progressStep: '',
        results: computedResults,
        selectedHit: computedResults[0] || null,
        querySequence: ''
      });

      // Add to persistent BLAST History
      const firstLine = querySequence.trim().split('\n')[0];
      const selectedSequenceName = firstLine.startsWith('>') 
        ? firstLine.replace('>', '').replace(/_/g, ' ') 
        : 'Manual query entry';

      addBlastResult({
        id: `blast_${startTime}`,
        querySequence: rawSequence,
        queryName: selectedSequenceName,
        timestamp: startTime,
        results: computedResults,
        source: useRealAPIs && ncbiBackendAvailable ? 'real' : 'mock'
      });

      useAppStore.getState().showToast('BLAST matches processed successfully.', 'success');
      
      // Clear manual text and selection after completion
      setQuerySequence('');
      setSelectedSequenceId('');

    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'Unknown communication failure';
      setError(`Failed to connect to BLAST server: ${msg}`);
      setBlastSearch({
        isSearching: false,
        progressStep: `Error details: ${msg}`,
        querySequence: ''
      });
      // Clear manual text and selection on error too
      setQuerySequence('');
      setSelectedSequenceId('');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectHit = (hit: any) => {
    setBlastSearch({ selectedHit: hit });
  };

  const handleRestoreHistoryItem = (blast: any) => {
    setBlastSearch({
      results: blast.results,
      selectedHit: blast.results[0] || null,
      querySequence: blast.querySequence
    });
    setQuerySequence(`>${blast.queryName}\n${blast.querySequence}`);
    setResults(blast.results);
    setResultsCount(blast.results.length);
    useAppStore.getState().showToast('Restored BLAST query and results from history.', 'success');
  };

  const exportResultsCSV = () => {
    if (results.length === 0) return;
    
    const headers = ['Accession', 'Description/Species', 'Score', 'E-value', 'Identity (%)'];
    const rows = results.map(r => [
      r.accession,
      (r.species || r.description || '').replace(/,/g, ';'),
      r.score,
      r.evalue,
      r.identity
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blast_results_${rid || 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    useAppStore.getState().showToast('Results spreadsheet.csv downloaded.', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Status Badge */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/40 p-5 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-sm md:text-[15px] font-bold text-teal-950 dark:text-teal-200 uppercase tracking-widest flex items-center gap-1.5">
              <Search className="w-5 h-5 text-teal-500" />
              NCBI BLAST Search portal
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Identify species lineages by aligning Sanger DNA sequences against remote NCBI database repositories.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NCBIStatusBadge 
              status={useRealAPIs ? (ncbiBackendAvailable ? 'real' : 'error') : 'mock'} 
              message={
                useRealAPIs 
                  ? (ncbiBackendAvailable ? 'Connected to live remote Web APIs' : 'Backend proxy not configured / unreachable status') 
                  : 'Using pre-loaded offline mock DB'
              }
            />
          </div>
        </div>
      </div>

      {/* Input Form Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Controls */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-teal-900/40 space-y-4 shadow-2xs">
          
          {/* File select dropdown */}
          {sequences.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Quick Select Workspace Sequence
              </label>
              <select
                value={selectedSequenceId}
                onChange={(e) => setSelectedSequenceId(e.target.value)}
                className="w-full text-xs font-sans p-2.5 rounded-lg border border-slate-200 dark:border-teal-900/50 bg-slate-50/50 dark:bg-slate-900 focus:outline-hidden focus:border-teal-400 dark:text-teal-50"
              >
                <option value="">Paste sequence manually or select an uploaded strand...</option>
                {sequences.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.sequence.length} bp, GC: {s.gcContent}%)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Paste textarea */}
          <div className="space-y-1.5">
            <Tooltip text="Minimum 50 bases recommended. For 16S rRNA, use full length (~1500bp)">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Paste Strand Sequence (Fasta or raw)
              </label>
            </Tooltip>
            <textarea
              value={querySequence}
              onChange={(e) => {
                setQuerySequence(e.target.value);
                if (selectedSequenceId) setSelectedSequenceId('');
              }}
              placeholder=">Sample_Strand_Title&#10;TTACATAGCACATTACAGTCACATTACATAGCACACAAACACACACATAC..."
              className="w-full h-32 p-3 font-mono text-xs border border-slate-200 dark:border-teal-900/50 bg-slate-50/20 dark:bg-slate-900 rounded-lg focus:outline-hidden focus:border-teal-400 focus:ring-1 focus:ring-teal-400 dark:text-teal-100 placeholder-slate-400"
            />
            <p className="text-[10px] text-slate-450 dark:text-slate-400 flex justify-between items-center mt-1">
              <span>Bases count: {querySequence.replace(/[-\s>a-zA-Z0-9_\n]/g, '').length} characters</span>
              {querySequence.length > 0 && querySequence.length < 50 && (
                <span className="text-amber-600 font-bold animate-pulse">⚠️ Minimum 50 bases required</span>
              )}
            </p>
          </div>

          {/* Configuration Parameters row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* BLAST Program */}
            <div className="space-y-1.5">
              <Tooltip text="blastn = DNA vs DNA (for Sanger). blastx = DNA vs Protein">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 text-teal-500" />
                  BLAST Program
                </label>
              </Tooltip>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <button
                  type="button"
                  onClick={() => setProgram('blastn')}
                  className={`p-2 border rounded-lg font-bold transition-all cursor-pointer ${
                    program === 'blastn' 
                      ? 'border-teal-500 bg-teal-500/10 text-teal-805 dark:text-teal-400' 
                      : 'border-slate-200 dark:border-teal-900/20 text-slate-500'
                  }`}
                >
                  blastn <span className="font-semibold text-[9px] block text-slate-400">DNA vs DNA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProgram('blastx')}
                  className={`p-2 border rounded-lg font-bold transition-all cursor-pointer ${
                    program === 'blastx' 
                      ? 'border-teal-500 bg-teal-500/10 text-teal-805 dark:text-teal-400' 
                      : 'border-slate-200 dark:border-teal-900/20 text-slate-500'
                  }`}
                >
                  blastx <span className="font-semibold text-[9px] block text-slate-400">Translated Protein</span>
                </button>
              </div>
            </div>

            {/* Target Database Selection */}
            <div className="space-y-1.5">
              <Tooltip text="nt = comprehensive database. refseq_rna = curated RNA sequences">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-teal-500" />
                  Target Genome Database
                </label>
              </Tooltip>
              <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDatabase('nt')}
                  className={`p-2 border rounded-lg text-center transition-all cursor-pointer text-xs ${
                    database === 'nt' 
                      ? 'border-teal-500 bg-teal-500/10 text-teal-805 dark:text-teal-400' 
                      : 'border-slate-200 dark:border-teal-900/20 text-slate-500'
                  }`}
                  title="Nucleotide collection db (nt - most comprehensive)"
                >
                  nt
                </button>
                <button
                  type="button"
                  onClick={() => setDatabase('refseq_rna')}
                  className={`p-2 border rounded-lg text-center transition-all cursor-pointer text-xs ${
                    database === 'refseq_rna' 
                      ? 'border-teal-500 bg-teal-500/10 text-teal-850 dark:text-teal-400' 
                      : 'border-slate-200 dark:border-teal-900/20 text-slate-500'
                  }`}
                  title="Reference RNA sequences collection"
                >
                  refseq
                </button>
                <button
                  type="button"
                  onClick={() => setDatabase('est')}
                  className={`p-2 border rounded-lg text-center transition-all cursor-pointer text-xs ${
                    database === 'est' 
                      ? 'border-teal-500 bg-teal-500/10 text-teal-850 dark:text-teal-400' 
                      : 'border-slate-200 dark:border-teal-900/20 text-slate-500'
                  }`}
                  title="Expressed Sequence Tags subset"
                >
                  est
                </button>
              </div>
            </div>

          </div>

          {/* Submission button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={performBlast}
              disabled={isSearching || querySequence.length < 50}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center space-x-2 w-full sm:w-auto"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Searching NCBI... Please wait 20-30s</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search NCBI</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Guidelines Side panel */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-teal-900/40 space-y-4 shadow-2xs text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          <h4 className="text-[10px] font-bold text-teal-950 dark:text-teal-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-150 pb-2">
            <FileText className="w-4 h-4 text-teal-500" />
            BLAST Submission Guidelines
          </h4>
          <p>
            NCBI BLAST aligns your query nucleotide sequence to a comprehensive collection of annotated reference sequences, calculating the probability of a random similarity occurrence.
          </p>
          
          <div className="p-3 bg-teal-500/5 dark:bg-teal-950/25 border border-teal-200/20 rounded-lg space-y-1.5 text-[11px]">
            <p className="font-bold text-teal-950 dark:text-teal-205">Confidence parameters overview:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Max Score:</strong> The alignment quality score of the match. Higher is localized alignment.</li>
              <li><strong>Identity %:</strong> Percentage of exact base matches. Values &gt;98% provide reliable species identifiers.</li>
              <li><strong>Expect (E-Value):</strong> Probability of random similarity. Values near 0.0 indicate high significance.</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Educational Info Box - Posisi Tetap, Compact */}
      <div className="mt-4">
        {!isSearching && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
            <div className="flex items-start gap-2">
              <span className="text-sm">🔍</span>
              <div className="flex-1">
                <h4 className="font-medium text-teal-800 text-xs mb-1">Understanding BLAST Results</h4>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-teal-700">
                  <div><span className="font-medium">Identity ≥ 98%</span> = Very confident (green)</div>
                  <div><span className="font-medium">Identity 95-98%</span> = Likely same genus (yellow)</div>
                  <div><span className="font-medium">Identity &lt; 95%</span> = Different species (red)</div>
                  <div><span className="font-medium">E-value near 0</span> = Highly significant</div>
                </div>
                <p className="text-xs text-teal-600 mt-1 italic">Tip: For bacterial 16S rRNA, expect &gt;99% identity.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Output */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/25 border border-red-200/50 dark:border-red-900/45 rounded-xl p-4 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-700 dark:text-red-400 text-xs">BLAST API Search Error</p>
              <p className="text-xs text-red-650 dark:text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Persistent History Drawer */}
      {globalBlastHistory.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-teal-900/40 rounded-xl shadow-2xs overflow-hidden">
          <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 px-4 py-3 border-b border-slate-200 dark:border-teal-900/40">
            <h4 className="font-bold text-[11px] text-teal-955 dark:text-teal-205 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-500" />
              BLAST Run History ({globalBlastHistory.length})
            </h4>
            <button 
              onClick={clearBlastResults} 
              className="text-red-500 hover:text-red-650 cursor-pointer text-xs font-semibold hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-teal-900/20 max-h-80 overflow-y-auto scrollbar">
            {globalBlastHistory.map((blast) => (
              <div 
                key={blast.id} 
                className="p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleRestoreHistoryItem(blast)}
                  title="Click to restore these search results"
                >
                  <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate pr-4">
                    {blast.queryName}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                    <span className="font-mono text-[9px] text-slate-450 dark:text-slate-400">
                      {new Date(blast.timestamp).toLocaleTimeString()} ({new Date(blast.timestamp).toLocaleDateString()})
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      blast.source === 'real' 
                        ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                        : 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400'
                    }`}>
                      {blast.source === 'real' ? 'Live NCBI' : 'Simulated'}
                    </span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400 truncate max-w-xs font-mono">
                      Query preview: {blast.querySequence.substring(0, 30)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {blast.results && blast.results[0] && (
                    <div className="text-[11px] bg-slate-100/60 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-205/40 dark:border-teal-950 shrink-0">
                      <span className="font-bold text-slate-705 dark:text-slate-350">Top hit:</span>{' '}
                      <span className="font-semibold text-teal-700 dark:text-teal-400 italic">
                        {blast.results[0].species}
                      </span>{' '}
                      ({blast.results[0].identity}% id, {blast.results[0].evalue} E)
                    </div>
                  )}
                  <button 
                    onClick={() => deleteBlastResult(blast.id)} 
                    className="p-1 px-2 text-red-400 hover:text-red-650 hover:bg-red-54 dark:hover:bg-red-950/20 rounded-lg shrink-0 cursor-pointer text-xs"
                    title="Delete run from history"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Queue status indicator when submitting query */}
      {isSearching && (
        <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-teal-900/45 rounded-xl flex items-center space-x-4 animate-pulse">
          <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
          <div className="space-y-1 font-sans">
            <h5 className="text-xs font-bold text-teal-955 dark:text-teal-200 uppercase tracking-widest">
              NCBI Gateway Query Queue Status
            </h5>
            <p className="text-[11px] text-teal-700 dark:text-teal-350 italic">
              {blastSearch.progressStep}
            </p>
          </div>
        </div>
      )}

      {/* Results details block */}
      {results.length > 0 && !isSearching && (
        <div className="space-y-4 pt-2">
          
          {/* Action Interpretation banner */}
          <div className="p-4 bg-teal-500/5 dark:bg-slate-900 border border-teal-200/50 dark:border-teal-900/40 rounded-xl flex flex-col gap-3 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-teal-955 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-500 animate-pulse" />
                  <span>Alignment Matches Retrieved Successfully</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {resultsCount} hits resolved | {rid ? `RID: ${rid}` : ''} {searchTime ? `| Completed in ${searchTime.toFixed(1)}s` : ''}.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <button
                  onClick={exportResultsCSV}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-250 dark:border-teal-900/40 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                {(globalBlastHistory.length > 0 || results.length > 0) && (
                  <button 
                    onClick={clearHistory} 
                    className="flex items-center gap-1 text-xs bg-white dark:bg-slate-850 px-3 py-1.5 rounded-lg border border-red-350 dark:border-red-900/40 text-red-650 dark:text-red-405 hover:bg-red-50 dark:hover:bg-red-950/25 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear History
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveReportFocus({ focus: 'blast', focusArea: 'biological' });
                    setViewRedirect('report');
                  }}
                  className="px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer whitespace-nowrap justify-center"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>What do these results mean?</span>
                </button>
              </div>
            </div>

            {/* Optional: Show history list below current results */}
            {globalBlastHistory.length > 1 && (
              <div className="mt-4 border-t border-slate-200 dark:border-teal-900/30 pt-4">
                <h5 className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Previous Searches
                </h5>
                <div className="flex flex-wrap gap-2 text-slate-705 dark:text-slate-300">
                  {globalBlastHistory.slice(1).map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRestoreHistoryItem(item)}
                      className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg text-slate-750 dark:text-slate-350 cursor-pointer border border-transparent hover:border-slate-300 dark:hover:border-teal-900/45 transition-colors"
                    >
                      {item.queryName} ({item.results.length} hits)
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fadeIn">
            {/* Left table result */}
            <div className="xl:col-span-2">
              <BlastResults 
                results={results} 
                onSelectHit={handleSelectHit} 
              />
            </div>

            {/* Right Species detail drawer info */}
            <div>
              {blastSearch.selectedHit ? (
                <SpeciesCard 
                  hit={blastSearch.selectedHit} 
                  allHits={results} 
                />
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-teal-950 flex flex-col justify-center items-center h-full">
                  <AlertTriangle className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-xs text-slate-450 font-bold">No specimen target selected</p>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1">
                    Click on the visual detail eyeball action button in the results grid to examine taxonomy clades and confidence stats.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
