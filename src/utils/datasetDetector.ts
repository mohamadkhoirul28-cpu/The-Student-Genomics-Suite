import { Sequence } from '../types';

export interface DetectedDataset {
  name: 'bacteria' | 'mammal' | 'fish' | 'insect' | 'unknown';
  label: string;
  confidence: number;
  description: string;
}

export function detectDatasetFromSequences(sequences: Sequence[]): DetectedDataset {
  if (!sequences.length) {
    return { name: 'unknown', label: 'Uploaded Sequences', confidence: 0, description: 'No sequences loaded' };
  }
  
  // Calculate average GC content
  const avgGC = sequences.reduce((sum, s) => sum + s.gcContent, 0) / sequences.length;
  
  // Calculate average length
  const avgLength = sequences.reduce((sum, s) => sum + s.length, 0) / sequences.length;
  
  // Check for bacterial markers in names
  const bacterialKeywords = ['pseudomonas', 'bacillus', 'escherichia', 'coli', 'bacteria', '16s', 'strain'];
  const hasBacterialName = sequences.some(s => 
    bacterialKeywords.some(kw => s.name.toLowerCase().includes(kw))
  );
  
  // Detection logic
  if (avgGC > 45 && avgGC < 60 && avgLength < 600 && hasBacterialName) {
    return {
      name: 'bacteria',
      label: 'Bacterial 16S rRNA',
      confidence: 0.85,
      description: 'Prokaryotic 16S ribosomal RNA sequences'
    };
  }
  
  if (avgGC > 38 && avgGC < 45 && avgLength > 400 && avgLength < 700) {
    return {
      name: 'mammal',
      label: 'Mammalian Mitochondrial DNA',
      confidence: 0.7,
      description: 'COI, D-Loop, or CytB gene regions'
    };
  }
  
  return {
    name: 'unknown',
    label: 'Uploaded Sequences',
    confidence: 0.5,
    description: 'Genetic sequences from uploaded files'
  };
}
