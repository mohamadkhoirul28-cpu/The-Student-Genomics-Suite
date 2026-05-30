import React from 'react';
import { useAppStore } from '../../stores/appStore';

export interface WelcomeInsightProps {
  sequences: any[];
}

function detectGeneType(sequences: any[]) {
  if (!sequences || sequences.length === 0) return 'genomic region';
  const avgLen = sequences.reduce((sum, s) => sum + (s.sequence?.length || s.length || 0), 0) / sequences.length;
  if (avgLen < 400) return 'mitochondrial D-Loop or small barcode';
  if (avgLen < 1000) return 'COI (Cytochrome c Oxidase Subunit I) barcode or diagnostic gene fragment';
  return 'ribosomal DNA or high-fidelity genomic locus';
}

export function WelcomeInsight({ sequences }: WelcomeInsightProps) {
  const { isDemoMode } = useAppStore();
  if (!sequences || sequences.length === 0) return null;

  const isUpload = sequences.some(s => s.sourceType === 'upload' || s.source === 'upload');
  const showDemoInference = isDemoMode && !isUpload;

  const uniqueLocations = Array.from(
    new Set(
      sequences
        .map(s => s.metadata?.location || s.location)
        .filter((loc): loc is string => typeof loc === 'string' && loc.trim().length > 0)
    )
  );

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-950/60 rounded-xl p-4 mb-4 animate-fadeIn">
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0" role="img" aria-label="DNA Helix">🧬</span>
        <div>
          <h4 className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
            Dataset Ready for Population Genetics
          </h4>
          <p className="text-amber-800 dark:text-amber-300 text-xs mt-1">
            You have <strong>{sequences.length}</strong> sequences active in your workspace. 
            These appear to be <strong>{detectGeneType(sequences)}</strong> sequences based on composition and trace lengths.
          </p>

          <div className="mt-2 text-xs text-amber-800 dark:text-amber-300">
            {showDemoInference ? (
              <p>
                <strong>Geographic Distribution (Inferred):</strong> Alas Purwo (45%), Baluran (30%), Meru Betiri (25%)
              </p>
            ) : uniqueLocations.length > 0 ? (
              <p>
                <strong>Location:</strong> {uniqueLocations.join(', ')}
              </p>
            ) : (
              <p className="text-amber-600 dark:text-amber-400 italic">
                No geographic information in uploaded file
              </p>
            )}
          </div>

          <p className="text-amber-600 dark:text-amber-400 text-xs mt-2 font-mono">
            🎓 Suggested Dry-lab Workflow: 
            <span className="text-amber-700 dark:text-amber-300 font-semibold font-sans"> Clean Sanger ambiguous bases ➔ Formulate pairwise alignments ➔ Compile diversity indices ➔ Build Neighbor-Joining Tree ➔ Generate thesis draft analysis</span>
          </p>
        </div>
      </div>
    </div>
  );
}
