export type ViewType = 'home' | 'upload' | 'sequences' | 'analysis' | 'ncbi' | 'report' | 'settings';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: 'uploading' | 'parsing' | 'ready' | 'completed' | 'failed';
  errorMessage?: string;
  sequenceCount?: number;
  parsedSequences?: GeneticSequence[];
}

export interface Sequence {
  id: string;           // Unique identifier
  name: string;         // Display name (from header or filename)
  source: string;       // Original filename
  sourceType?: 'demo' | 'upload' | 'ncbi';
  format?: 'fasta' | 'seq' | 'ab1';
  sequence: string;     // Uppercase, cleaned
  length: number;
  gcContent: number;    // 0-100
  nCount?: number;       // Ambiguous bases
  quality?: number[];   // For AB1, optional
  metadata?: {
    location?: string | null;
    species?: string;
    collectionDate?: string;
    accession?: string;     // For NCBI sequences
    [key: string]: any;
  };
}

export interface GeneticSequence extends Sequence {
  location?: string | null; // Metadata for geography if population metrics (copied to metadata also)
  species?: string; // Species identification (copied to metadata also)
}

export interface DemoDataset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  iconName: 'Deer' | 'Bug' | 'Microscope';
  sampleCount: number;
  avgLength: number;
  sequences: GeneticSequence[];
}

export interface SidebarItem {
  id: ViewType;
  label: string;
  icon: string; // Represents Lucide icon name, but in code we can use the components directly
}

export interface SessionActivity {
  id: string;
  description: string;
  timestamp: string;
  type: 'upload' | 'analysis' | 'blast' | 'report';
}

export interface CleanOptions {
  trimNsAndGaps: boolean;
  removeShortSequences: boolean;
  minSequenceLength: number;
  standardizeCase: boolean;
  removeWhitespace: boolean;
  removeNonDnaChars: boolean;
}

export interface AlignedSequence {
  id: string;
  name: string;
  sequence: string; // aligned sequence with gaps '-'
}

export interface DiversityMetrics {
  s: number; // polymorphic sites count
  hd: number; // haplotype diversity (0-1)
  pi: number; // nucleotide diversity (0-1)
  numHaplotypes: number;
}

export interface TreeNode {
  name: string;
  id?: string;
  branchLength?: number;
  bootstrap?: number;
  location?: string;
  children?: TreeNode[];
}

export interface BlastHit {
  rank: number;
  accession: string;
  species: string;
  score: number;
  cover: number;
  evalue: string;
  identity: number;
}

export interface BlastSearchState {
  isSearching: boolean;
  progressStep: string;
  querySequence: string;
  results: BlastHit[] | null;
  selectedHit: BlastHit | null;
}

export interface BlastResult {
  id: string;
  querySequence: string;
  queryName: string;
  timestamp: number;
  results: BlastHit[];
  source: 'real' | 'mock';
}

export interface AnalysisResult {
  alignedSequences: AlignedSequence[];
  diversity: DiversityMetrics;
  tree: TreeNode;
  gcContentMin: number;
  gcContentMax: number;
  avgLength: number;
  totalLength: number; // sum of parsed sequence length
  consensus: string;
  conservationScores: number[]; // Conservation score per position from 0 to 100
}

export interface SavedInsight {
  id: string;
  dataset: string;
  datasetName: string;
  focus: string;
  focusName: string;
  detail: string;
  text: string;
  timestamp: string;
  question?: string;
  source?: 'gemini' | 'mock';
  metricsUsed?: {
    hd?: string;
    pi?: string;
    haplotypes?: number;
    polymorphicSites?: number;
    n_samples?: number;
  };
}


