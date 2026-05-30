import { GeneticSequence } from '../types';

// ==========================================
// 1. BIOLOGICALLY PLAUSIBLE CONSENSUS STRINGS
// ==========================================

// Javan Rusa (Rusa timorensis) mitochondrial D-Loop consensus (approx. 480 bp)
// Rich in A/T (approx. 60%), containing conserved sequence blocks (CSB-1)
const RUSA_DLOOP_CONSENSUS = 
  'ATGGCGTACATAGCACATTATGTCAGATCAACCCGCTCCTTGACATACAAACACCGTTTT' +
  'TCCCACCCATACATAATACGTATTACTTACCATACATTTATATATACCATACATTTATAC' +
  'CATACATTTTACCGTACCATACATTTATCGCACATACATATACATTACTACCATACATTT' +
  'ATACTACCATACAATTTATCCTACAAACCCATCCACCAGACACACCAAACCCCAAAAACC' +
  'TAACCAACCCTAATGTCATGCATACATAAGCAAAACATTTTCATGTGTGCTAAGCTCAGG' +
  'TCTCTACCATTCACATGACTACCCTCACCAGGTAGCCCAATCCCCCGAACTGAACCTACA' +
  'AAACTTACCGTTTATCCTTACTTATGCTTGTGGAACTTAGTTATGTGTCACCAGGACACG' +
  'GCCTGCCACAGCACTTAACGAAATACATGCAATATCCTATCCTTACTGTACATCGTGC';

// Cytochrome c Oxidase Subunit I (COI) ancestral sequence fragment (approx. 650 bp)
// GC-content approx. 45%, standard codon structure (protein coding)
const COI_ANCESTRAL = 
  'AACTTTATATTTTATTTTTGGTGCATGGGCGGGAATAGTAGGAACAGCCTTAAGCCTACT' +
  'TATCCGTGCTGAATTAGGCCAACCTGGCTCCCTACTCGGAGACGACCAAATTTACAATGT' +
  'TATCGTTACTGCACATGCATTTATCATAATTTTTTTTATGGTTATACCAATCATAATTGG' +
  'TGGATTCGGTAACTGACTTGTACCTTTAATATTAGGCGCCCCTGACATAGCATTCCCACG' +
  'AATAAACAACATAAGCTTTTGACTCCTACCCCCATCACTCACATTATTACTATCGTCAGC' +
  'TGCAGTAGAAAGCGGAGTAGGCACTGGATGAACTGTCTACCCTCCACTAGCTGGCAATCT' +
  'AGCCCACGCAGGAGCCTCCGTAGACCTAACAATTTTTTCCCTACACTTAGCCGGAGTGTC' +
  'CTCAATCCTAGGGGCAATCAACTTTATCACAACAATTATTAATATGAAACCCCCAGCAAT' +
  'ATCACAATACCAAACACCCCTATTCGTCTGATCAGTTCTAATCACCGCTGTACTACTACT' +
  'TCTCTCCCTACCAGTACTAGCCGCAGGCATTACAATGCTGCTAACAGACCGAAACCTAAA' +
  'CACCACTTTCTTTGACCCTGCAGGGGGAGGAGACCCTATCCTATACCAACA';

// 16S rRNA Ribosomal Ancestral bacterial fragment (approx. 400 bp)
// GC-content approx. 54%, alternating highly conserved and hypervariable regions
const rRNA_16S_ANCESTRAL = 
  'AGAGTTTGATCCTGGCTCAGGATGAACGCTGGCGGCGTGCCTAATACATGCAAGTCGAGC' +
  'GAACGGATCCTTCGGGATTCAGTGGCGGACGGGTGAGTAACACGTGGGTAACCTGCCCTG' +
  'TAAGACTGGGATAACTCCGGGAAACCGGGGCTAATACCGGATAATATTTTGAACCGCATG' +
  'GTTCGATAGTGAAAGACGGTTTCGGCTGTCACTTACAGATGGACCCGCGGCGCATTAGCT' +
  'AGTTGGTGAGGTAACGGCTCACCAAGGCGACGATGCGTAGCCGACCTGAGAGGGTGATCG' +
  'GCCACACTGGGACTGAGACACGGCCCAGACTCCTACGGGAGGCAGCAGTGGGGAATATTG' +
  'CACAATGGGCGCAAGCCTGATGCAGCCATGCCGCGTGTGTGAAGAAGGCCTTCGGGTTGT';

// ==========================================
// 2. STABLE MUTATION DETERMINISTIC GENERATION
// ==========================================

// Deterministic random pseudo-generator so we always get the exact same lovely data
function createSeededRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Applies transition or transversion mutation at specific indices
function mutateSeq(
  seq: string, 
  positions: number[], 
  randomFn: () => number
): string {
  const chars = seq.split('');
  positions.forEach(pos => {
    if (pos >= chars.length) return;
    const original = chars[pos];
    // Transitions (more plausible): A <-> G, C <-> T
    let target = original;
    if (original === 'A') target = 'G';
    else if (original === 'G') target = 'A';
    else if (original === 'C') target = 'T';
    else if (original === 'T') target = 'C';
    else target = 'N';

    // Occasional transversions
    if (randomFn() < 0.2) {
      const transversions: Record<string, string> = {
        'A': 'C', 'C': 'A', 'G': 'T', 'T': 'G'
      };
      target = transversions[original] || target;
    }
    chars[pos] = target;
  });
  return chars.join('');
}

// Calculates GC Content percent
const getGc = (seq: string): number => {
  const gcCount = (seq.match(/[GCgc]/g) || []).length;
  return parseFloat(((gcCount / seq.length) * 100).toFixed(2));
};

// ==========================================
// 3. EXPORT EXPLICIT DEMO SEQUENCES
// ==========================================

// --- Dataset 1: Rusa timorensis (D-loop mtDNA) ---
// 20 sequences, ~500bp. Shared polymorphic sites based on population centers.
export function generateRusaDataset(): GeneticSequence[] {
  const rand = createSeededRandom(1001);
  const locations = [
    { name: 'Taman Nasional Alas Purwo', code: 'AP' },
    { name: 'Taman Nasional Baluran', code: 'BL' },
    { name: 'Taman Nasional Meru Betiri', code: 'MB' }
  ];

  // Define cluster-specific SNPs to simulate true population divergence
  // Alas Purwo cluster share mutations at positions: 15, 84, 210, 340
  // Baluran cluster share mutations at positions: 42, 115, 298, 412
  // Meru Betiri cluster share mutations at positions: 60, 185, 305, 451
  // This yields an excellent Fst index and phylogenetic clustering!

  return Array.from({ length: 20 }).map((_, idx) => {
    const locObj = locations[idx % locations.length];
    const locName = locObj.name;
    const locCode = locObj.code;

    // Build unique SNP profiles
    const mutations: number[] = [];
    
    // Geographic group shared SNPs
    if (locCode === 'AP') {
      mutations.push(15, 84, 210, 340);
      if (idx % 2 === 0) mutations.push(112); // sub-haplotype
    } else if (locCode === 'BL') {
      mutations.push(42, 115, 298, 412);
      if (idx % 2 === 0) mutations.push(22);  // sub-haplotype
    } else if (locCode === 'MB') {
      mutations.push(60, 185, 305, 451);
      if (idx % 2 === 0) mutations.push(378); // sub-haplotype
    }

    // Add 1-2 random individual mutations for fine-scale diversity
    const rPos = Math.floor(rand() * 400);
    mutations.push(rPos);

    let mutatedSeqStr = RUSA_DLOOP_CONSENSUS;
    
    // Add insertions/deletions/Ns occasionally for educational trimming/cleaning scenarios
    if (idx === 4) {
      mutatedSeqStr = 'NNNNNN' + mutatedSeqStr + 'NNNN';
    } else if (idx === 11) {
      mutatedSeqStr = 'NNN' + mutatedSeqStr + '----NNN';
    } else {
      // Small length variations
      const sliceStart = Math.floor(rand() * 5);
      const sliceEnd = mutatedSeqStr.length - Math.floor(rand() * 5);
      mutatedSeqStr = mutatedSeqStr.substring(sliceStart, sliceEnd);
    }

    const sequence = mutateSeq(mutatedSeqStr.toUpperCase(), mutations, rand);
    
    return {
      id: `rt-seq-${idx + 1}`,
      name: `Rusa_timorensis_DLoop_${locCode}_${101 + idx}`,
      source: 'Rusa_timorensis_mtDNA_Sanger.fasta',
      format: 'fasta',
      sequence,
      length: sequence.length,
      gcContent: getGc(sequence),
      nCount: (sequence.match(/N/gi) || []).length,
      metadata: {
        location: locName,
        species: 'Rusa timorensis (Javan Rusa Deer)',
        collectionDate: `2025-07-${10 + (idx % 15)}`
      },
      // root-level compatibility
      location: locName,
      species: 'Rusa timorensis (Javan Rusa Deer)'
    };
  });
}

// --- Dataset 2: COI Barcode (Multi-Species) ---
// 10 species, 3 individuals each. High inter-species variance, low intra-species.
export function generateCoiDataset(): GeneticSequence[] {
  const rand = createSeededRandom(2022);
  const speciesList = [
    { bin: 'Varanus komodoensis', common: 'Komodo Dragon', origin: 'Komodo Island' },
    { bin: 'Paradisaea apoda', common: 'Greater Bird-of-Paradise', origin: 'Aru Islands' },
    { bin: 'Macrocephalon maleo', common: 'Maleo Fowl', origin: 'Sulawesi Highlands' },
    { bin: 'Babyrousa babyrussa', common: 'Golden Babirusa', origin: 'Buru Island' },
    { bin: 'Macaca celebensis', common: 'Moor Macaque', origin: 'South Sulawesi' },
    { bin: 'Anoa depressicornis', common: 'Lowland Anoa', origin: 'Sulawesi Rainforest' },
    { bin: 'Leucopsar rothschildi', common: 'Bali Myna', origin: 'West Bali' },
    { bin: 'Cacatua sulphurea', common: 'Yellow-crested Cockatoo', origin: 'Nusa Tenggara' },
    { bin: 'Casuarius casuarius', common: 'Southern Cassowary', origin: 'Papua Jungles' },
    { bin: 'Ornithoptera croesus', common: 'Wallace\'s Golden Birdwing', origin: 'Halmahera' }
  ];

  const sequences: GeneticSequence[] = [];

  speciesList.forEach((sp, spIdx) => {
    // Generate a highly diverged template for this species
    // Pick 30-40 specific indices to diverge this species from ancestral COI
    const speciesDivergentPositions: number[] = [];
    for (let p = 0; p < 45; p++) {
      speciesDivergentPositions.push(Math.floor(p * 14 + (spIdx * 7) % 15));
    }
    const speciesTemplate = mutateSeq(COI_ANCESTRAL, speciesDivergentPositions, () => spIdx / 10);

    // Create 3 individuals for this species
    for (let ind = 1; ind <= 3; ind++) {
      // Very close to species template (only 1-2 small polymorphisms)
      const indivMutations: number[] = [
        Math.floor(rand() * 600)
      ];
      // Include occasional trailing Ns in some samples for Sanger chromatogram realism
      let rawSequence = speciesTemplate;
      if (spIdx === 1 && ind === 1) {
        rawSequence = 'NNNNNNNNNC' + rawSequence.substring(10) + 'NNNN';
      }

      const seq = mutateSeq(rawSequence, indivMutations, rand);

      const identifier = sp.bin.replace(' ', '_');
      sequences.push({
        id: `coi-seq-${spIdx * 3 + ind}`,
        name: `${identifier}_Ind_${ind}`,
        source: 'Fauna_COI_Barcode_Sanger.ab1',
        format: 'ab1',
        sequence: seq,
        length: seq.length,
        gcContent: getGc(seq),
        nCount: (seq.match(/N/gi) || []).length,
        quality: Array.from({ length: seq.length }).map(() => 35 + Math.floor(rand() * 15)), // High Sanger quality reads
        metadata: {
          location: sp.origin,
          species: `${sp.bin} (${sp.common})`,
          collectionDate: '2025-09-12'
        },
        location: sp.origin,
        species: `${sp.bin} (${sp.common})`
      });
    }
  });

  return sequences;
}

// --- Dataset 3: 16S rRNA (Bacterial Endophytes) ---
// 15 sequences of bacteria. Alternating constant regions and hypervariable loops.
export function generate16sDataset(): GeneticSequence[] {
  const rand = createSeededRandom(3003);
  const bacteriaStrains = [
    'Bacillus subtilis strain BS-YND1',
    'Pseudomonas fluorescens strain PF-YND3',
    'Streptomyces coelicolor strain SC-YND4',
    'Bacillus amyloliquefaciens strain BA-YND5',
    'Azotobacter chroococcum strain AC-YND8',
    'Lactobacillus plantarum strain LP-YND9',
    'Rhizobium leguminosarum strain RL-YND12',
    'Burkholderia cepacia strain BC-YND13',
    'Lysinibacillus sphaericus strain LS-YND14',
    'Paenibacillus polymyxa strain PP-YND17',
    'Bradyrhizobium japonicum strain BJ-YND19',
    'Serratia marcescens strain SM-YND22',
    'Enterobacter cloacae strain EC-YND23',
    'Micrococcus luteus strain ML-YND25',
    'Bacillus megaterium strain BM-YND27'
  ];

  // Highly conserved 16S flanking sections
  // Hypervariable loop 1: positions 80 to 140
  // Hypervariable loop 2: positions 230 to 290
  return bacteriaStrains.map((strain, idx) => {
    const mutations: number[] = [];

    // Let's introduce mutations primarily in the hypervariable loops!
    // This replicates true ribosomal design
    const loop1Pos = [82, 88, 95, 104, 112, 128, 131, 139];
    const loop2Pos = [234, 241, 248, 255, 269, 274, 281, 288];

    // Select subset based on index to create unique strains
    loop1Pos.forEach((p, pIdx) => {
      if ((idx + pIdx) % 3 === 0) mutations.push(p);
    });
    loop2Pos.forEach((p, pIdx) => {
      if ((idx + pIdx) % 2 === 0) mutations.push(p);
    });

    // Extremely rare mutation in conserved backbone
    if (idx % 5 === 0) mutations.push(30);

    const sequence = mutateSeq(rRNA_16S_ANCESTRAL, mutations, rand);

    return {
      id: `bac-seq-${idx + 1}`,
      name: strain.split(' ').slice(0, 2).join('_') + `_16s_${101 + idx}`,
      source: 'Endophyte_Bacteria_16S_Ribosomal.fasta',
      format: 'fasta',
      sequence,
      length: sequence.length,
      gcContent: getGc(sequence),
      nCount: (sequence.match(/N/gi) || []).length,
      metadata: {
        location: 'Kabupaten Sleman Agricultural Soil',
        species: strain,
        collectionDate: '2025-11-05'
      },
      location: 'Kabupaten Sleman Agricultural Soil',
      species: strain
    };
  });
}
