import { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Download, Loader2, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { Tooltip } from '../shared/Tooltip';

interface FetchedSequence {
  accession: string;
  sequence: string;
  name: string;
  length: number;
  gcContent: number;
  valid: boolean;
  error?: string;
  addedToWorkspace?: boolean;
}

export default function ReferenceFetcher() {
  const { addUserSequences, useRealAPIs, ncbiBackendAvailable, sequences } = useAppStore();
  const [accessionInput, setAccessionInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedSequences, setFetchedSequences] = useState<FetchedSequence[]>([]);
  const [error, setError] = useState<string | null>(null);

  const useRealNCBI = useRealAPIs && ncbiBackendAvailable;
  const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:8080';

  const calculateGCContent = (seq: string): number => {
    const gcCount = (seq.match(/[CG]/gi) || []).length;
    return seq.length > 0 ? (gcCount / seq.length) * 100 : 0;
  };

  const parseFetchedSequence = (accession: string, data: any): FetchedSequence => {
    // Case 1: Backend returned error (too large, invalid, etc.)
    if (data?.error) {
      return {
        accession,
        sequence: '',
        name: accession,
        length: 0,
        gcContent: 0,
        valid: false,
        error: data.error
      };
    }

    // Case 2: No sequence data
    if (!data || !data.sequence || typeof data.sequence !== 'string') {
      return {
        accession,
        sequence: '',
        name: accession,
        length: 0,
        gcContent: 0,
        valid: false,
        error: 'No sequence data received from NCBI'
      };
    }

    const rawSequence = data.sequence;
    
    // Parse FASTA format
    let sequence = '';
    let name = accession;
    
    if (rawSequence.startsWith('>')) {
      const lines = rawSequence.split('\n');
      const header = lines[0].substring(1);
      name = header;
      sequence = lines.slice(1).join('').replace(/\s/g, '');
    } else {
      sequence = rawSequence.replace(/\s/g, '');
    }

    // Clean sequence: uppercase, keep A/C/G/T/N only
    const cleanedSequence = sequence.toUpperCase().replace(/[^ACGTN]/g, '');
    
    if (cleanedSequence.length === 0) {
      return {
        accession,
        sequence: '',
        name,
        length: 0,
        gcContent: 0,
        valid: false,
        error: 'No valid DNA bases found in sequence'
      };
    }

    return {
      accession,
      sequence: cleanedSequence,
      name,
      length: cleanedSequence.length,
      gcContent: calculateGCContent(cleanedSequence),
      valid: true
    };
  };

  const handleFetch = async () => {
    if (!accessionInput.trim()) {
      setError('Please enter an accession number');
      return;
    }

    const accessions = accessionInput.split(/\n|,|\s/).filter(a => a.trim());
    if (accessions.length === 0) return;

    setIsFetching(true);
    setError(null);
    const results: FetchedSequence[] = [];

    for (const acc of accessions.slice(0, 5)) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/ncbi/fetch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accession: acc.trim() })
        });

        const data = await response.json();
        const parsed = parseFetchedSequence(acc.trim(), data);
        results.push(parsed);
        
      } catch (err) {
        results.push({
          accession: acc.trim(),
          sequence: '',
          name: acc.trim(),
          length: 0,
          gcContent: 0,
          valid: false,
          error: `Network error: ${err instanceof Error ? err.message : 'Unknown'}`
        });
      }
    }

    setFetchedSequences(results);
    setIsFetching(false);
  };

  const addToWorkspace = (seq: FetchedSequence) => {
    if (!seq.valid) return;

    const newSequence = {
      id: `ncbi_${seq.accession}_${Date.now()}`,
      name: seq.name,
      source: 'ncbi' as const,
      format: 'fasta' as const,
      sequence: seq.sequence,
      length: seq.length,
      gcContent: seq.gcContent,
      nCount: (seq.sequence.match(/N/g) || []).length,
      metadata: {
        accession: seq.accession,
        fetchedFrom: 'NCBI',
        fetchedAt: new Date().toISOString()
      },
      sourceType: 'ncbi' as const
    };

    addUserSequences([newSequence as any]);
    
    setFetchedSequences(prev => 
      prev.map(s => s.accession === seq.accession 
        ? { ...s, addedToWorkspace: true }
        : s
      )
    );
  };

  const addAllToWorkspace = () => {
    const validSequences = fetchedSequences.filter(s => s.valid && !s.addedToWorkspace);
    const newSequences = validSequences.map(seq => ({
      id: `ncbi_${seq.accession}_${Date.now()}_${Math.random()}`,
      name: seq.name,
      source: 'ncbi' as const,
      format: 'fasta' as const,
      sequence: seq.sequence,
      length: seq.length,
      gcContent: seq.gcContent,
      nCount: (seq.sequence.match(/N/g) || []).length,
      metadata: {
        accession: seq.accession,
        fetchedFrom: 'NCBI'
      },
      sourceType: 'ncbi' as const
    }));
    
    if (newSequences.length > 0) {
      addUserSequences(newSequences as any[]);
    }
    
    setFetchedSequences(prev => 
      prev.map(s => s.valid && !s.addedToWorkspace ? { ...s, addedToWorkspace: true } : s)
    );
  };

  const clearAll = () => {
    setFetchedSequences([]);
    setAccessionInput('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Status Indicator */}
      <div className={`p-3 rounded-lg ${useRealNCBI ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
        <div className="flex items-center gap-2">
          {useRealNCBI ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm font-medium">
            {useRealNCBI ? 'Live NCBI Connection' : 'Demo Mode — Simulated sequences'}
          </span>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/30 p-4">
        <Tooltip text="Example: LC535007.1 (Bacillus), JF895181.1 (E. coli)">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-350 mb-1">
            NCBI Accession Number(s)
          </label>
        </Tooltip>
        <textarea
          value={accessionInput}
          onChange={(e) => setAccessionInput(e.target.value)}
          placeholder="Enter one or more accession numbers (e.g., LC535007.1, NR_074540.1)&#10;One per line, or comma-separated"
          className="w-full h-24 p-3 border border-slate-300 dark:border-teal-900/50 rounded-lg font-mono text-sm dark:bg-slate-900 dark:text-white"
        />
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-slate-400">
            Example: LC535007.1 (Bacillus subtilis), JF895181.1 (E. coli)
          </p>
          <div className="flex gap-2">
            <button
              onClick={clearAll}
              disabled={!accessionInput && fetchedSequences.length === 0}
              className="px-3 py-2 border border-slate-300 dark:border-teal-900/40 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 dark:text-white cursor-pointer"
            >
              Clear
            </button>
            <Tooltip text="Fetches real sequences from NCBI GenBank (max 5000bp)">
              <button
                onClick={handleFetch}
                disabled={isFetching || !accessionInput.trim()}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 flex items-center gap-2 cursor-pointer text-sm"
              >
                {isFetching ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                {isFetching ? 'Fetching...' : 'Fetch from NCBI'}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Fetched Results */}
      {fetchedSequences.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/40 overflow-hidden">
          <div className="bg-teal-50 dark:bg-slate-900/40 px-4 py-3 border-b border-teal-200 dark:border-teal-900/40 flex justify-between items-center flex-wrap gap-2">
            <h4 className="font-semibold text-teal-900 dark:text-teal-200 text-sm">Fetched Sequences</h4>
            <div className="flex gap-2">
              <button
                onClick={addAllToWorkspace}
                disabled={!fetchedSequences.some(s => s.valid && !s.addedToWorkspace)}
                className="text-sm bg-teal-500 text-white px-3 py-1 rounded-lg hover:bg-teal-600 disabled:opacity-50 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus size={14} /> Add All to Workspace
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-teal-900/25">
            {fetchedSequences.map((seq, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/10">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-medium dark:text-white">{seq.accession}</span>
                      {seq.valid ? (
                        <span className="text-xs bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300 px-2 py-0.5 rounded-full">
                          ✓ Valid
                        </span>
                      ) : (
                        <span className="text-xs bg-red-105 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 px-2 py-0.5 rounded-full">
                          ✗ Invalid
                        </span>
                      )}
                      {seq.addedToWorkspace && (
                        <span className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 px-2 py-0.5 rounded-full">
                          Added to Workspace
                        </span>
                      )}
                    </div>
                    
                    {seq.valid && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {seq.name.length > 80 ? seq.name.substring(0, 77) + '...' : seq.name} • {seq.length.toLocaleString()} bp • GC: {seq.gcContent.toFixed(1)}%
                      </div>
                    )}
                    
                    {seq.error && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1 font-semibold">
                        Error: {seq.error}
                      </div>
                    )}
                    
                    {seq.valid && seq.sequence && (
                      <div className="font-mono text-xs text-slate-400 dark:text-slate-500 mt-2 truncate max-w-lg select-all bg-slate-50 dark:bg-slate-900 p-1 rounded-sm">
                        {seq.sequence.substring(0, 120)}...
                      </div>
                    )}
                  </div>
                  
                  {seq.valid && !seq.addedToWorkspace && (
                    <button
                      onClick={() => addToWorkspace(seq)}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-sm flex items-center gap-1 ml-4 cursor-pointer font-medium shrink-0"
                    >
                      <Plus size={14} /> Add to Workspace
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
        <h4 className="font-medium text-slate-700 dark:text-slate-350 text-sm">📘 How to use Reference Fetcher</h4>
        <ul className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1 list-disc list-inside">
          <li>Paste NCBI accession numbers (e.g., <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded dark:text-teal-400 font-semibold">LC535007.1</code>)</li>
          <li>Click "Fetch from NCBI" to retrieve sequences</li>
          <li>Review fetched sequences — valid ones will show length and GC%</li>
          <li>Click "Add to Workspace" to include in your analysis</li>
          <li>Added sequences appear in Sequences table</li>
          <li><span className="text-amber-600 dark:text-amber-400 font-semibold">Note:</span> Large sequences (&gt;5000 bp) are automatically rejected</li>
        </ul>
      </div>
    </div>
  );
}
