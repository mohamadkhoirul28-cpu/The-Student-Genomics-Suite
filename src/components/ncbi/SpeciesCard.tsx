import React from 'react';
import { BlastHit } from '../../types';
import { CheckCircle, Landmark } from 'lucide-react';

interface SpeciesCardProps {
  hit: BlastHit;
  allHits?: BlastHit[];
}

export default function SpeciesCard({ hit, allHits = [] }: SpeciesCardProps) {
  let commonName = 'Unknown species';
  let taxonomy = 'Eukaryota > Metazoa > Chordata';
  let taxId = 'N/A';
  
  const speciesLower = hit.species.toLowerCase();
  if (speciesLower.includes('timorensis')) {
    commonName = 'Javan Rusa / Timor Deer';
    taxonomy = 'Animalia > Chordata > Mammalia > Artiodactyla > Cervidae > Rusa > Rusa timorensis';
    taxId = 'TaxID: 108848';
  } else if (speciesLower.includes('unicolor')) {
    commonName = 'Sambar Deer';
    taxonomy = 'Animalia > Chordata > Mammalia > Artiodactyla > Cervidae > Rusa > Rusa unicolor';
    taxId = 'TaxID: 9883';
  } else if (speciesLower.includes('elaphus')) {
    commonName = 'Red Deer';
    taxonomy = 'Animalia > Chordata > Mammalia > Artiodactyla > Cervidae > Cervus > Cervus elaphus';
    taxId = 'TaxID: 9860';
  } else if (speciesLower.includes('muntjak')) {
    commonName = 'Southern Red Muntjac / Barking Deer';
    taxonomy = 'Animalia > Chordata > Mammalia > Artiodactyla > Cervidae > Muntiacus > Muntiacus muntjak';
    taxId = 'TaxID: 9884';
  } else if (speciesLower.includes('javanicus')) {
    commonName = 'Java Mouse-Deer / Kancil';
    taxonomy = 'Animalia > Chordata > Mammalia > Artiodactyla > Tragulidae > Tragulus > Tragulus javanicus';
    taxId = 'TaxID: 9851';
  } else if (speciesLower.includes('coli')) {
    commonName = 'Escherichia coli (Bacterium)';
    taxonomy = 'Bacteria > Pseudomonadota > Gammaproteobacteria > Enterobacterales > Enterobacteriaceae > Escherichia > E. coli';
    taxId = 'TaxID: 562';
  } else if (speciesLower.includes('flexneri')) {
    commonName = 'Shigella flexneri (Bacterium)';
    taxonomy = 'Bacteria > Pseudomonadota > Gammaproteobacteria > Enterobacterales > Enterobacteriaceae > Shigella > Shigella flexneri';
    taxId = 'TaxID: 623';
  } else if (speciesLower.includes('enterica')) {
    commonName = 'Salmonella enterica (Bacterium)';
    taxonomy = 'Bacteria > Pseudomonadota > Gammaproteobacteria > Enterobacterales > Enterobacteriaceae > Salmonella > Salmonella enterica';
    taxId = 'TaxID: 28901';
  } else if (speciesLower.includes('homo sapiens') || speciesLower.includes('sapiens')) {
    commonName = 'Human';
    taxonomy = 'Animalia > Chordata > Mammalia > Primates > Hominidae > Homo > Homo sapiens';
    taxId = 'TaxID: 9606';
  }

  const cleanSpeciesName = hit.species.split(' (')[0];

  return (
    <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/40 shadow-xs space-y-4 animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-405 px-2 py-0.5 rounded-full">
            Species Identification
          </span>
          <h3 className="text-sm md:text-base font-bold text-teal-950 dark:text-teal-50 mt-1 italic">
            {cleanSpeciesName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans mt-0.5">
            Common Name: <strong className="text-teal-700 dark:text-teal-300 font-bold">{commonName}</strong>
          </p>
        </div>
        <CheckCircle className="w-8 h-8 text-emerald-500 shrink-0" />
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg space-y-1.5 text-[11px] font-sans">
        <div className="flex items-center space-x-1.5 text-slate-400">
          <Landmark className="w-3.5 h-3.5" />
          <span className="font-bold text-[9px] uppercase tracking-wider">Lineage Hierarchy</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic font-mono text-[10px]">
          {taxonomy}
        </p>
        <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold font-mono">
          {taxId}
        </p>
      </div>

      <div className="p-3 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/15 rounded-lg text-xs leading-relaxed text-emerald-800 dark:text-emerald-400">
        <strong className="font-bold">Match Confidence:</strong> This sequence shows <strong className="font-black">{hit.identity}% identity</strong> with {cleanSpeciesName} (e-value = {hit.evalue}) across <strong className="font-bold">{hit.cover}% query coverage</strong>. 
        Highly likely correct biological identification.
      </div>

      {allHits && allHits.length > 0 && (
        <div className="space-y-1.5 text-[11px]">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Candidate Matches Comparison</span>
          <div className="overflow-hidden border border-slate-100 dark:border-teal-950 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-[9px] uppercase font-bold border-b border-slate-100 dark:border-teal-950">
                  <th className="px-3 py-1.5">Species candidate</th>
                  <th className="px-3 py-1.5 text-right">Identity %</th>
                  <th className="px-3 py-1.5 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-teal-950/40">
                {allHits.map((h) => (
                  <tr key={h.accession} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 font-sans ${h.accession === hit.accession ? 'bg-teal-500/5 font-bold text-teal-600 dark:text-teal-400' : ''}`}>
                    <td className="px-3 py-2 italic text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{h.species.split(' (')[0]}</td>
                    <td className="px-3 py-2 text-right font-mono">{h.identity}%</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-400">{h.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
