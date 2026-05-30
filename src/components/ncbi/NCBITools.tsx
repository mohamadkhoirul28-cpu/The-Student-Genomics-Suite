import React, { useState } from 'react';
import BlastSearch from './BlastSearch';
import ReferenceFetcher from './ReferenceFetcher';
import { Search, DownloadCloud, Landmark } from 'lucide-react';

export default function NCBITools() {
  const [activeTab, setActiveTab] = useState<'blast' | 'fetcher'>('blast');

  return (
    <div className="space-y-6">
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-teal-200/40 dark:border-teal-900/20">
        <div>
          <h2 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-teal-950 dark:text-teal-50">
            NCBI Database Tools
          </h2>
          <p className="text-xs text-teal-700 dark:text-teal-300 mt-1">
            Access public molecular datasets: alignment search checks (BLAST) and academic accession code downloads.
          </p>
        </div>
        <div className="flex items-center space-x-1.5 bg-teal-500/10 text-teal-750 dark:text-teal-300 font-bold px-3 py-1 rounded-full border border-teal-200/20 text-[10px] uppercase mt-2 md:mt-0 tracking-wider">
          <Landmark className="w-4 h-4 text-teal-500" />
          <span>NCBI Integrated Hub</span>
        </div>
      </div>

      {/* Segment navigation tabs selection */}
      <div className="flex border-b border-slate-200 dark:border-teal-900/10">
        <button
          onClick={() => setActiveTab('blast')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'blast'
              ? 'border-teal-400 text-teal-600 dark:text-teal-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-500'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>BLAST Sequence Search</span>
        </button>

        <button
          onClick={() => setActiveTab('fetcher')}
          className={`px-5 py-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-2 cursor-pointer ${
            activeTab === 'fetcher'
              ? 'border-teal-400 text-teal-600 dark:text-teal-400 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-500'
          }`}
        >
          <DownloadCloud className="w-4 h-4" />
          <span>Reference Finder / Fetcher</span>
        </button>
      </div>

      {/* Render active tabs */}
      <div className="animate-fadeIn">
        {activeTab === 'blast' ? <BlastSearch /> : <ReferenceFetcher />}
      </div>
    </div>
  );
}
