import { GeneticSequence, Sequence } from '../types';

/**
 * Parses a string content as FASTA format safely without throwing uncaught exceptions.
 */
export function parseFASTA(content: string): Sequence[] {
  console.log('[Parser] Starting parse, content length:', content?.length);
  
  // Validate input
  if (!content || typeof content !== 'string') {
    console.error('[Parser] Invalid content type');
    return [];
  }
  
  if (content.trim().length === 0) {
    console.error('[Parser] Empty content');
    return [];
  }
  
  // Ensure we ALWAYS return an array
  try {
    const sequences = parseFasta(content, 'uploaded_file.fasta');
    if (!Array.isArray(sequences)) {
      console.error('[Parser] parseFASTACore returned non-array');
      return [];
    }
    return sequences;
  } catch (err) {
    console.error('[Parser] Exception:', err);
    return [];
  }
}

/**
 * Utility function to validate that a DNA sequence contains only valid bases or gaps.
 * Permitted: A, C, G, T, N, -
 */
export function validateSequence(seq: string): boolean {
  return /^[ACGTNRYMKSWHBVDX\-]+$/i.test(seq);
}

/**
 * Helper function to calculate GC-content percentage (0-100)
 */
export function calculateGCContent(seq: string): number {
  if (seq.length === 0) return 0;
  const cleaned = seq.toUpperCase();
  const gcCount = (cleaned.match(/[GC]/g) || []).length;
  return parseFloat(((gcCount / seq.length) * 100).toFixed(2));
}

/**
 * Helper function to calculate N-count (ambiguous bases)
 */
export function calculateNCount(seq: string): number {
  const cleaned = seq.toUpperCase();
  return (cleaned.match(/N/g) || []).length;
}

/**
 * Parses a string content as FASTA format.
 * Supports single or multiple sequences in a single FASTA file.
 */
export function parseFasta(content: string, filename: string): GeneticSequence[] {
  console.log('[Parser] Input length:', content?.length || 0);

  if (!content || content.trim().length === 0) {
    throw new Error('File is empty');
  }

  const trimmed = content.trim();
  if (!content.includes('>')) {
    throw new Error('Invalid FASTA: no headers found (must start with >)');
  }

  if (!trimmed.startsWith('>')) {
    throw new Error('Invalid FASTA format. Header line must start with >');
  }

  const entries = trimmed.split('>');
  const sequences: GeneticSequence[] = [];

  for (const entry of entries) {
    if (!entry.trim()) continue;

    const lines = entry.split(/\r?\n/);
    const headerLine = lines[0].trim();
    const seqBody = lines.slice(1).join('').replace(/\s+/g, '').toUpperCase();

    if (!seqBody) {
      throw new Error(`Empty sequence body encountered in FASTA item: "${headerLine}"`);
    }

    if (!/^[ACGTNRYMKSWHBVDX\-]+$/i.test(seqBody)) {
      const invalidChars = seqBody.match(/[^ACGTNRYMKSWHBVDX\-]/gi) || [];
      const uniqueInvalid = [...new Set(invalidChars.map(c => c.toUpperCase()))];
      throw new Error(
        `IUPAC ambiguity codes detected. Valid codes: A, C, G, T, R, Y, M, K, S, W, H, B, V, D, X, N, -. ` +
        `Invalid characters found: ${uniqueInvalid.join(', ')}. ` +
        `Note: Many databases use these standard ambiguity codes. No action needed.`
      );
    }

    // Extract Display ID / Name from header line
    // Extract location from FASTA header if pattern: >ID|Location|Region
    const parts = headerLine.split('|').map(p => p.trim());
    const name = parts[0] || 'UnnamedSequence';
    let locationPart: string | null = null;
    let speciesPart: string | undefined = undefined;

    if (parts.length >= 2) {
      locationPart = parts[1] || null;
      if (parts.length >= 3) {
        speciesPart = parts[2] || undefined;
      }
    } else {
      locationPart = null;
    }

    const id = `seq-${Math.random().toString(36).substr(2, 9)}`;
    const gc = calculateGCContent(seqBody);
    const nCnt = calculateNCount(seqBody);

    const mappedSeq: GeneticSequence = {
      id,
      name,
      source: filename,
      format: 'fasta',
      sequence: seqBody,
      length: seqBody.length,
      gcContent: gc,
      nCount: nCnt,
      metadata: {
        location: locationPart,
        species: speciesPart,
      },
      // Root-level backward compatibility fields
      location: locationPart,
      species: speciesPart,
    };

    sequences.push(mappedSeq);
  }

  console.log('[Parser] Sequences found:', sequences.length);

  if (sequences.length === 0) {
    throw new Error('No valid sequences parsed. Check file format.');
  }

  return sequences;
}

/**
 * Parses a raw or .seq/txt plain file content.
 * If starts with ">" matches FASTA, otherwise treats as a singular raw sequence.
 */
export function parseSeqOrTxt(content: string, filename: string): GeneticSequence[] {
  const trimmed = content.trim();
  if (trimmed.startsWith('>')) {
    return parseFasta(content, filename);
  }

  // Treat as raw sequence
  const cleanedSeq = trimmed.replace(/\s+/g, '').toUpperCase();
  if (!cleanedSeq) {
    throw new Error('File sequence content is empty.');
  }

  if (!/^[ACGTNRYMKSWHBVDX\-]+$/i.test(cleanedSeq)) {
    const invalidChars = cleanedSeq.match(/[^ACGTNRYMKSWHBVDX\-]/gi) || [];
    const uniqueInvalid = [...new Set(invalidChars.map(c => c.toUpperCase()))];
    throw new Error(
      `IUPAC ambiguity codes detected. Valid codes: A, C, G, T, R, Y, M, K, S, W, H, B, V, D, X, N, -. ` +
      `Invalid characters found: ${uniqueInvalid.join(', ')}. ` +
      `Note: Many databases use these standard ambiguity codes. No action needed.`
    );
  }

  const name = filename.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');
  const id = `seq-${Math.random().toString(36).substr(2, 9)}`;
  const gc = calculateGCContent(cleanedSeq);
  const nCnt = calculateNCount(cleanedSeq);

  return [
    {
      id,
      name,
      source: filename,
      format: 'seq',
      sequence: cleanedSeq,
      length: cleanedSeq.length,
      gcContent: gc,
      nCount: nCnt,
      metadata: {
        location: null,
      },
      location: null,
    },
  ];
}

/**
 * Parses a binary .ab1 (Sanger Chromatogram ABI) file.
 * Extends the client directory parser or throws if corrupt/invalid.
 */
export function parseAb1(buffer: ArrayBuffer, filename: string): GeneticSequence {
  if (buffer.byteLength < 30) {
    throw new Error('Chromatogram parse failed. File is too small to be a valid AB1 file.');
  }

  const view = new DataView(buffer);
  
  // Verify magic bytes "ABIF"
  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  );

  if (magic !== 'ABIF') {
    throw new Error('Chromatogram parse failed. Upload .seq or .fasta instead.');
  }

  try {
    // Read directory entries count and directory structure offset
    const dirNumElements = view.getInt32(18); 
    const dirOffset = view.getInt32(26); 

    let sequence = '';
    let quality: number[] = [];

    // Traverse directories, looking for:
    // PBAS (Called bases sequence, version 1 or 2)
    // PCON (Called bases quality scores, version 1 or 2)
    for (let i = 0; i < dirNumElements; i++) {
      const entryOffset = dirOffset + i * 28;
      if (entryOffset + 28 > buffer.byteLength) break;

      const tagName = String.fromCharCode(
        view.getUint8(entryOffset),
        view.getUint8(entryOffset + 1),
        view.getUint8(entryOffset + 2),
        view.getUint8(entryOffset + 3)
      );

      const tagNum = view.getInt32(entryOffset + 4);
      const numElements = view.getInt32(entryOffset + 12);
      const dataSize = view.getInt32(entryOffset + 16);
      const dataOffset = view.getInt32(entryOffset + 20);

      // PBAS 2 contains the called bases ASCII chars
      if (tagName === 'PBAS' && tagNum === 2) {
        const actualOffset = dataSize <= 4 ? entryOffset + 20 : dataOffset;
        const chars: string[] = [];
        for (let j = 0; j < numElements; j++) {
          chars.push(String.fromCharCode(view.getUint8(actualOffset + j)));
        }
        sequence = chars.join('').toUpperCase();
      }

      // PCON 2 contains quality phred values (0-100)
      if (tagName === 'PCON' && tagNum === 2) {
        const actualOffset = dataSize <= 4 ? entryOffset + 20 : dataOffset;
        const scores: number[] = [];
        for (let j = 0; j < numElements; j++) {
          scores.push(view.getUint8(actualOffset + j));
        }
        quality = scores;
      }
    }

    // Fallback search to PBAS 1 and PCON 1 if needed
    if (!sequence) {
      for (let i = 0; i < dirNumElements; i++) {
        const entryOffset = dirOffset + i * 28;
        if (entryOffset + 28 > buffer.byteLength) break;

        const tagName = String.fromCharCode(
          view.getUint8(entryOffset),
          view.getUint8(entryOffset + 1),
          view.getUint8(entryOffset + 2),
          view.getUint8(entryOffset + 3)
        );

        const tagNum = view.getInt32(entryOffset + 4);
        const numElements = view.getInt32(entryOffset + 12);
        const dataSize = view.getInt32(entryOffset + 16);
        const dataOffset = view.getInt32(entryOffset + 20);

        if (tagName === 'PBAS' && tagNum === 1) {
          const actualOffset = dataSize <= 4 ? entryOffset + 20 : dataOffset;
          const chars: string[] = [];
          for (let j = 0; j < numElements; j++) {
            chars.push(String.fromCharCode(view.getUint8(actualOffset + j)));
          }
          sequence = chars.join('').toUpperCase();
        }

        if (tagName === 'PCON' && tagNum === 1) {
          const actualOffset = dataSize <= 4 ? entryOffset + 20 : dataOffset;
          const scores: number[] = [];
          for (let j = 0; j < numElements; j++) {
            scores.push(view.getUint8(actualOffset + j));
          }
          quality = scores;
        }
      }
    }

    // Clean sequence (ensure only uppercase valid bases)
    const cleanedSeq = sequence.replace(/\s+/g, '').toUpperCase();
    if (!cleanedSeq) {
      throw new Error('Extracted sequence was empty.');
    }

    if (!validateSequence(cleanedSeq)) {
      throw new Error('Chromatogram contains some invalid base definitions.');
    }

    const name = filename.replace(/\.[^/.]+$/, '').replace(/\s+/g, '_');
    const id = `seq-${Math.random().toString(36).substr(2, 9)}`;
    const gc = calculateGCContent(cleanedSeq);
    const nCnt = calculateNCount(cleanedSeq);

    return {
      id,
      name,
      source: filename,
      format: 'ab1',
      sequence: cleanedSeq,
      length: cleanedSeq.length,
      gcContent: gc,
      nCount: nCnt,
      quality: quality.length > 0 ? quality : Array(cleanedSeq.length).fill(40), // Default high quality fallback
      metadata: {
        location: null,
      },
      location: null,
    };

  } catch (error: any) {
    throw new Error(error?.message || 'Chromatogram parse failed. Upload .seq or .fasta instead.');
  }
}

export function expandAmbiguityCode(code: string): string {
  const expansion: Record<string, string> = {
    'R': 'A/G', 'Y': 'C/T', 'M': 'A/C', 'K': 'G/T',
    'S': 'C/G', 'W': 'A/T', 'H': 'A/C/T', 'B': 'C/G/T',
    'V': 'A/C/G', 'D': 'A/G/T', 'X': 'A/C/G/T', 'N': 'A/C/G/T'
  };
  return expansion[code.toUpperCase()] || code;
}
