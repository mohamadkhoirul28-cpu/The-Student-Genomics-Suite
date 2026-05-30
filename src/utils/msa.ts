import { GeneticSequence, AlignedSequence } from '../types';

/**
 * Performs a simplified progressive Multiple Sequence Alignment (MSA).
 * It uses the first sequence as a template, aligns each succeeding sequence
 * to the template, and propagates inserted gaps to all previously aligned sequences.
 */
export function simpleMSA(sequences: GeneticSequence[]): AlignedSequence[] {
  if (sequences.length === 0) return [];
  if (sequences.length === 1) {
    return [{
      id: sequences[0].id,
      name: sequences[0].name,
      sequence: sequences[0].sequence
    }];
  }

  // Cap at 30 sequences and max 1000bp for browser performance
  const processedSeqs = sequences.slice(0, 30).map(s => ({
    id: s.id,
    name: s.name,
    sequence: s.sequence.slice(0, 1000).toUpperCase().replace(/[^ACGTN-]/g, '')
  }));

  // Helper for pairwise global alignment (Needleman-Wunsch)
  function pairwiseAlign(seqA: string, seqB: string): [string, string] {
    const MATCH = 2;
    const MISMATCH = -1;
    const GAP = -2;

    const m = seqA.length;
    const n = seqB.length;

    // Allocate 1D score matrix to save memory, or 2D matrix
    const score: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) score[i][0] = i * GAP;
    for (let j = 0; j <= n; j++) score[0][j] = j * GAP;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const matchScore = seqA[i - 1] === seqB[j - 1] ? MATCH : MISMATCH;
        score[i][j] = Math.max(
          score[i - 1][j - 1] + matchScore,
          score[i - 1][j] + GAP,
          score[i][j - 1] + GAP
        );
      }
    }

    let alignA = '';
    let alignB = '';
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0) {
        const matchScore = seqA[i - 1] === seqB[j - 1] ? MATCH : MISMATCH;
        if (score[i][j] === score[i - 1][j - 1] + matchScore) {
          alignA = seqA[i - 1] + alignA;
          alignB = seqB[j - 1] + alignB;
          i--;
          j--;
          continue;
        }
      }
      if (i > 0 && (j === 0 || score[i][j] === score[i - 1][j] + GAP)) {
        alignA = seqA[i - 1] + alignA;
        alignB = '-' + alignB;
        i--;
      } else {
        alignA = '-' + alignA;
        alignB = seqB[j - 1] + alignB;
        j--;
      }
    }

    return [alignA, alignB];
  }

  // Initial alignment: template is the first sequence
  let alignedList: { id: string; name: string; sequence: string }[] = [
    { id: processedSeqs[0].id, name: processedSeqs[0].name, sequence: processedSeqs[0].sequence }
  ];

  for (let s = 1; s < processedSeqs.length; s++) {
    const currentSeq = processedSeqs[s];
    // Align with current template (the first aligned sequence is our template reference)
    const template = alignedList[0].sequence.replace(/-/g, ''); // un-gapped template to align with
    const [alignedTemplate, alignedQuery] = pairwiseAlign(template, currentSeq.sequence);

    // Now propagate gaps added into template back into all previously aligned sequences
    const newAlignedList: typeof alignedList = [];
    let templateGapPointer = 0;

    // Find indices in AlignedTemplate where gaps '-' are added
    const gapIndices: number[] = [];
    for (let i = 0; i < alignedTemplate.length; i++) {
      if (alignedTemplate[i] === '-') {
        gapIndices.push(i);
      }
    }

    // We need to sync existing aligned sequences (which might already have gaps)
    // To do this simply, we re-align the previously aligned sequences using alignedTemplate mapping.
    // The alignedTemplate maps character-by-character from the original 'template'.
    // Let's create the aligned versions.
    for (const prev of alignedList) {
      let prevAlignedWithNewGaps = '';
      let prevIdx = 0;
      let tempCharIdx = 0; // index of non-gap chars in template

      for (let i = 0; i < alignedTemplate.length; i++) {
        if (alignedTemplate[i] === '-') {
          prevAlignedWithNewGaps += '-';
        } else {
          // Consume chars from prev sequence including its own gaps,
          // matching character index of the template.
          while (prevIdx < prev.sequence.length) {
            const char = prev.sequence[prevIdx];
            prevAlignedWithNewGaps += char;
            prevIdx++;
            if (char !== '-') {
              tempCharIdx++;
              break;
            }
          }
        }
      }

      // Append any remaining trailing characters
      if (prevIdx < prev.sequence.length) {
        prevAlignedWithNewGaps += prev.sequence.slice(prevIdx);
      }

      newAlignedList.push({
        id: prev.id,
        name: prev.name,
        sequence: prevAlignedWithNewGaps
      });
    }

    // Add aligned query
    newAlignedList.push({
      id: currentSeq.id,
      name: currentSeq.name,
      sequence: alignedQuery
    });

    alignedList = newAlignedList;
  }

  // Ensure all aligned sequences are of exactly equal length (pad with trailing gaps if there's minor mismatch)
  const maxLength = Math.max(...alignedList.map(s => s.sequence.length));
  return alignedList.map(s => ({
    ...s,
    sequence: s.sequence.padEnd(maxLength, '-')
  }));
}

/**
 * Calculates the conservation profile across the aligned sequences.
 * Score per column ranges from 0 to 100%.
 */
export function calculateConservationAndConsensus(aligned: AlignedSequence[]): {
  consensus: string;
  conservationScores: number[];
} {
  if (aligned.length === 0) return { consensus: '', conservationScores: [] };
  const len = aligned[0].sequence.length;
  let consensus = '';
  const conservationScores: number[] = [];

  for (let i = 0; i < len; i++) {
    const counts: { [base: string]: number } = { A: 0, C: 0, G: 0, T: 0, '-': 0, N: 0 };
    for (const seq of aligned) {
      const base = seq.sequence[i] || '-';
      counts[base] = (counts[base] || 0) + 1;
    }

    // Find major base excluding gaps unless all are gaps
    let maxBase = '-';
    let maxCount = -1;
    for (const base in counts) {
      if (counts[base] > maxCount) {
        maxCount = counts[base];
        maxBase = base;
      }
    }

    consensus += maxBase;

    // Conservation score is the percentage of matching primary bases (excluding gaps from total if possible, or relative to absolute total)
    const scoreVal = Math.round((maxCount / aligned.length) * 100);
    conservationScores.push(scoreVal);
  }

  return { consensus, conservationScores };
}
