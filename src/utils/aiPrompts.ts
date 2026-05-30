/**
 * AI Prompt Templates and Response Generators
 * The Student Genomics Suite
 */

import { getMockResponse } from './aiMock';

export const biologicalContext = {
  hd: {
    high: 'High haplotype diversity (>0.8) suggests the population maintains substantial genetic variation, indicating healthy maternal lineages and limited bottleneck effects.',
    moderate: 'Moderate haplotype diversity (0.5-0.8) indicates moderate genetic variation, possibly from historical population fluctuations.',
    low: 'Low haplotype diversity (<0.5) suggests genetic depletion, possibly from founder effects, drift, or recent population decline.'
  },
  pi: {
    high: 'High nucleotide diversity indicates many accumulated mutations, suggesting an ancient or large population with long evolutionary history.',
    moderate: 'Moderate nucleotide diversity is typical of stable populations with balanced mutation and drift processes.',
    low: 'Low nucleotide diversity with high haplotype diversity suggests recent population expansion from a small founder group.'
  }
};

export interface PromptMetrics {
  hd: string;
  pi: string;
  haplotypes: number;
  polymorphicSites: number;
  n_samples: number;
  datasetName: string;
  avgLen?: number;
}

/**
 * Generates an insight response using the mock knowledge base and dynamic formatting
 */
export function generateInsight(
  datasetId: string,
  focus: string, // 'diversity' | 'tree' | 'blast' | 'overview' | 'custom'
  detail: string, // 'brief' | 'standard' | 'detailed'
  focusArea: string, // 'biological' | 'methodology' | 'next_steps' | 'comparison'
  metrics: PromptMetrics,
  customQuestion?: string
): string {
  // Translate keys to match the template structure
  let resolvedDataset = 'rusa';
  if (datasetId.includes('coi') || datasetId.includes('barcode') || datasetId.includes('fish') || datasetId.includes('insect')) {
    resolvedDataset = 'coi';
  } else if (datasetId.includes('bacteria') || datasetId.includes('16s') || datasetId.includes('bacterial')) {
    resolvedDataset = 'bacteria';
  } else if (datasetId.includes('mammal') || datasetId.includes('rusa')) {
    resolvedDataset = 'rusa';
  } else {
    resolvedDataset = 'rusa'; // default to rusa/mammalian template
  }

  return getMockResponse(resolvedDataset, focus, detail, focusArea, metrics, customQuestion);
}
