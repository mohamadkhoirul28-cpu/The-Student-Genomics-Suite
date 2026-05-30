import React from 'react';
import { BlastHit, GeneticSequence } from '../../types';
import { useAppStore } from '../../stores/appStore';
import { generateMockSequence } from '../../utils/ncbiMock';
import { Eye, Download } from 'lucide-react';

interface BlastResultsProps {
  results: BlastHit[];
  onSelectHit: (hit: BlastHit) => void;
}

export default function BlastResults({ results, onSelectHit }: BlastResultsProps) {
  const { addSequences, showToast } = useAppStore();

  const handleFetchReference = (hit: BlastHit) => {
    try {
      const gseq = generateMockSequence(hit.accession);
      const newSeq: GeneticSequence = {
        id: 'ncbi_' + hit.accession + '_' + Date.now(),
        name: hit.accession + '_' + hit.species.split(' ')[1] + '_ref',
        source: 'ncbi',
        format: 'fasta',
        sequence: gseq,
        length: gseq.length,
        gcContent: parseFloat(((gseq.match(/[GCgc]/g) || []).length / gseq.length * 100).toFixed(1)),
        nCount: (gseq.match(/[Nn]/g) || []).length,
        metadata: {
          species: hit.species.split(' (')[0],
          location: 'NCBI Reference Collection'
        }
      };
      addSequences([newSeq]);
      showToast(`Added academic reference sequence ${hit.accession} to workspace!`, 'success');
    } catch (err: any) {
      showToast(`Could not fetch reference sequence.`, 'error');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/40 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100 dark:border-teal-900/20 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
        <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider">
          Query Match Analysis Table (BLAST Results)
        </h4>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">
          {results.length} hit(s) resolved
        </span>
      </div>

      <div className="overflow-x-auto font-sans">
        <table className="w-full text-[11px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-teal-900/20 text-slate-400 uppercase font-bold text-[9px] tracking-wider">
              <th className="px-4 py-3 text-center">Rank</th>
              <th className="px-4 py-3">Accession ID</th>
              <th className="px-4 py-3">Organism / Target Species</th>
              <th className="px-4 py-3 text-right">Max Score</th>
              <th className="px-4 py-3 text-right">Query Cover</th>
              <th className="px-4 py-3 text-right">E-Value</th>
              <th className="px-4 py-3 text-right">Identity %</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-teal-950/40">
            {results.map((hit) => (
              <tr key={hit.accession} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all">
                <td className="px-4 py-3 text-center font-bold text-slate-400">{hit.rank}</td>
                <td className="px-4 py-3 font-mono font-medium text-teal-600 dark:text-teal-403">{hit.accession}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate animate-fadeIn" title={hit.species}>
                  {hit.species}
                </td>
                <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-350">{hit.score}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-350">{hit.cover}%</td>
                <td className="px-4 py-3 text-right font-mono text-slate-404">{hit.evalue}</td>
                <td className="px-4 py-3 text-right font-mono text-emerald-500 font-bold">{hit.identity}%</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => onSelectHit(hit)}
                      className="p-1 text-teal-600 hover:text-teal-700 hover:bg-teal-50 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                      title="View Species Clade Information"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFetchReference(hit)}
                      className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                      title="Import Reference to Workspace"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
