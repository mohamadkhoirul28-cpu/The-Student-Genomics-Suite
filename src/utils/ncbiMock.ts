import { BlastHit } from '../types';

export function calculateGC(sequence: string): number {
  if (!sequence) return 0;
  const gcCount = (sequence.match(/[GCgc]/g) || []).length;
  const cleanLen = sequence.replace(/[-\s]/g, '').length;
  return cleanLen > 0 ? parseFloat(((gcCount / cleanLen) * 100).toFixed(1)) : 0;
}

export function generateMockBlastResults(querySeq: string): BlastHit[] {
  if (!querySeq) return [];
  const gc = calculateGC(querySeq);
  const length = querySeq.replace(/[-\s]/g, '').length;
  
  // Pattern 1: Rusa timorensis (GC 38-42% and length 450-550 bp)
  if (gc > 36 && gc < 44 && length > 400 && length < 600) {
    return [
      { rank: 1, accession: 'AF291883.1', species: 'Rusa timorensis (Javan Rusa d-loop mitochondrial marker region)', score: 892, cover: 98, evalue: '0.0', identity: 99.2 },
      { rank: 2, accession: 'AF291884.1', species: 'Rusa unicolor (Sambar Deer d-loop mitochondrial haplotype)', score: 856, cover: 97, evalue: '0.0', identity: 97.8 },
      { rank: 3, accession: 'JN632511.1', species: 'Cervus elaphus (Red Deer d-loop control sequence)', score: 743, cover: 95, evalue: '1e-143', identity: 94.5 },
    ];
  }
  
  // Pattern 2: COI Barcode (GC ~44-48%, length 600-700 bp)
  if (gc > 42 && gc < 50 && length > 550 && length < 750) {
    return [
      { rank: 1, accession: 'COI_RUSA_01.1', species: 'Rusa timorensis cytochrome c oxidase subunit I gene (COI)', score: 1142, cover: 100, evalue: '0.0', identity: 99.8 },
      { rank: 2, accession: 'COI_MUNT_04.1', species: 'Muntiacus muntjak (Indian Muntjac COI gene for barcoding)', score: 988, cover: 98, evalue: '0.0', identity: 91.2 },
      { rank: 3, accession: 'COI_TRAG_09.1', species: 'Tragulus javanicus (Java Mouse-Deer mitochondrial COI locus)', score: 812, cover: 96, evalue: '2e-172', identity: 85.4 },
    ];
  }

  // Pattern 3: Bacterial 16S (GC ~50-56%, length 350-450 bp)
  if (gc > 48 && gc < 58 && length > 300 && length < 500) {
    return [
      { rank: 1, accession: 'NR_114041.1', species: 'Escherichia coli strain K-12 ribosomal RNA 16S locus gene', score: 720, cover: 99, evalue: '0.0', identity: 99.5 },
      { rank: 2, accession: 'NR_024570.1', species: 'Shigella flexneri strain ATCC 12022 16S ribosomal RNA', score: 710, cover: 99, evalue: '0.0', identity: 98.9 },
      { rank: 3, accession: 'NR_040782.1', species: 'Salmonella enterica subsp. enterica serovar Typhimurium LT2 16S', score: 652, cover: 97, evalue: '3e-160', identity: 94.1 },
    ];
  }

  // General default fallback
  return [
    { rank: 1, accession: 'DQ846923.1', species: 'Uncultured mammalian cloning vector sequence', score: 610, cover: 91, evalue: '1e-152', identity: 89.6 },
    { rank: 2, accession: 'AY129481.1', species: 'Homo sapiens partial mitochondrial genome control loop', score: 480, cover: 88, evalue: '4e-110', identity: 83.2 },
    { rank: 3, accession: 'BC083204.2', species: 'Synthetic construct DNA cloning adapter segment linkers', score: 382, cover: 75, evalue: '1e-78', identity: 79.1 },
  ];
}

export function generateSequence(length: number, gcPercentage: number): string {
  const bases = ['A', 'C', 'G', 'T'];
  let seq = '';
  const gcTargetCount = Math.round((length * gcPercentage) / 100);
  const atTargetCount = length - gcTargetCount;
  
  let gcCount = 0;
  let atCount = 0;
  
  for (let i = 0; i < length; i++) {
    const needsGc = (gcCount < gcTargetCount) && (Math.random() < 0.5 || atCount >= atTargetCount);
    if (needsGc) {
      seq += Math.random() < 0.5 ? 'G' : 'C';
      gcCount++;
    } else {
      seq += Math.random() < 0.5 ? 'A' : 'T';
      atCount++;
    }
  }
  return seq;
}

export function generateMockSequence(accession: string): string {
  if (accession.startsWith('AF29188') || accession.toLowerCase().includes('rusa')) {
    return 'TTACATAGCACATTACAGTCACATTACATAGCACACAAACACACACATACATATACATATAGCACATACAGCCATGCGTATACACACACAGCACATACAGCCATGCGTAT' +
      'ACACACACAGCACATACAGCCATGCGTATACACACACAGCACAACAGTACATTACATAGCACTCTACTGAACACATACAGCACTCTACTGAACACATACAGCACTCTACTGG' +
      'ACACATAGCACATTACAGTCACATTACATAGCACACAAACACACACATACATATACATATAGCACATACAGCCATGCGTATACACACACAGCACATACAGCCATGCGTATAC' +
      'ACACACAGCACATACAGCCATGCGTATACACACACAGCACAACAGTACATTACATAGCACTCTACTGAACACATACAGCACTCTACTGAACACATACAGCACTCTACTGGAC' +
      'ATACATATAGCACATACAGCCATGCGTATACACA';
  }
  if (accession.startsWith('JN63251') || accession.toLowerCase().includes('cervus')) {
    return 'TTACATAGCACATTACAGTCACATTACATAGCACACAAACACACACATACATATACATATAGCACATACAGCCATGCGTATACACACACAGCACATACAGCCATGCGTAT' +
      'ACACACACAGCACAACAGTACATTACATAGCACTCTACTGAACACATACAGCACTCTACTGAACACATACAGCACTCTACTGGACACACAGCACTCTACTGAACACATACAG' +
      'CACTCTACTGGACACATAGCACATTACAGTCACATTACATAGCACACAAACACACACATACATATACATATAGCACATACAGCCATGCGTATACACACACAGCACATACAGC' +
      'CATGCGTATACACACACAGCACATACAGCCATGCGTATACACACACAGCACAACAGTACATTACATAGCACTCTACTGAACACATACAGCACTCTACTGAACACATACAGCA' +
      'CTCTACTGGACATACATATAGCACATACAGCCAT';
  }
  if (accession.startsWith('COI_RUSA')) {
    return 'AACTTTATATTTTATTTTTGGAACATGAGCAGGTATAGTAGGAACTGCATTAAGCCTATTAATTCGAGCAGAACTGGGCCAACCAGGTGCTCTTCTTGGAGATGATCAAA' +
      'TTTATAATGTAATTGTTACAGCACATGCCTTCGTAATAATTCTTTTTATAGTTATACCAATCATAATTGGAGGCTTTGGAAACTGATTAGTACCCCTAATAATCGGAGCCC' +
      'CCGATATAGCATTCCCACGAATAAATAATATAAGTTTTTGGCTCCTCCCTCCTTCCTTATTACTTTTACTTGCCTCATCTATAGTAGAAGCCGGAGCTGGAACAGGATGAA' +
      'CCGTTTACCCCCCTCTAGCTGGAAACTTAGCTCATGCAGGAGCCTCCGTAGATCTAACAATTTTTTCACTACATTTAGCAGGTACTTCCTCAATA';
  }
  if (accession.startsWith('NR_114041') || accession.toLowerCase().includes('escherichia')) {
    return 'AGAGTTTGATCCTGGCTCAGATTGAACGCTGGCGGCAGGCCTAACACATGCAAGTCGAACGGTAACAGGAAGAAGCTTGCTTCTTTGCTGACGAGTGGCGGACGGGTGAG' +
      'TAATGTCTGGGAAACTGCCTGATGGAGGGGGATAACTACTGGAAACGGTAGCTAATACCGCATAACGTCGCAAGACCAAAGAGGGGGACCTTCGGGCCTCTTGCCATCGGA' +
      'TGTGCCCAGATGGGATTAGCTAGTAGGTGGGGTAACGGCTCACCTAGGCGACGATCCCTAGCTGGTCTGAGAGGATGACCAGCCACACTGGAACTGAGA';
  }
  return generateSequence(500, 43);
}
