/**
 * Actionable Recommendation Logic based on Sanger sequence quality and Pop-Gen diversity metrics.
 */

export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  reason: string;
}

export interface RecommendationMetrics {
  hd: number;
  pi: number;
  s: number;
  numHaplotypes: number;
  sequences: { sequence: string; name: string }[];
}

export function generateRecommendations(metrics: RecommendationMetrics, dataset: string): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // 1. Density & Bottleneck Structure Guidance
  if (metrics.hd > 0.8 && metrics.pi < 0.02) {
    recommendations.push({
      priority: 'high',
      title: 'Run AMOVA Analysis in Arlequin',
      description: 'Isolate geographic locations and construct an Analysis of Molecular Variance (AMOVA) to determine if differences between localities are statistically significant.',
      reason: 'Your high Haplotype Diversity (Hd = ' + metrics.hd.toFixed(4) + ') paired with low Nucleotide Diversity (π = ' + metrics.pi.toFixed(5) + ') suggests potential microspatial genetic differentiation, typical of Javan conservation reserves.'
    });
    recommendations.push({
      priority: 'high',
      title: 'Conduct Mismatch Distribution Expansion Modeling',
      description: 'Model the frequency distribution of pairwise nucleotide differences to test for signs of recent historical population expansion.',
      reason: 'High Hd coupled with low π is a classical genetics signature indicating sudden evolutionary expansion from a small post-bottleneck founder community.'
    });
  } else if (metrics.hd < 0.4 && metrics.pi < 0.005) {
    recommendations.push({
      priority: 'high',
      title: 'Formulate Habitat Corridor Recommendations',
      description: 'Due to severe depletion in genetic diversity, write down recommendations in your discussion suggesting ecological forest bridges or artificial translocation projects to minimize localized drift.',
      reason: 'Low genetic indices (Hd = ' + metrics.hd.toFixed(4) + ', π = ' + metrics.pi.toFixed(5) + ') emphasize isolation, pointing to extreme genetic bottlenecks and imminent risk of inbreeding depression.'
    });
  }

  // 2. Network Layout Guidance based on polymorphism site counts
  if (metrics.s > 10) {
    recommendations.push({
      priority: 'medium',
      title: 'Construct a Median-Joining Haplotype Network',
      description: 'Utilize software such as PopART or Network to map the mutation relationships among the ' + metrics.numHaplotypes + ' identified haplotypes.',
      reason: 'The presence of ' + metrics.s + ' polymorphic SNP sites provides excellent evolutionary resolution to visualize ancestral nodes and geographic sequence clusters.'
    });
  }

  // 3. Sanger Chromatogram Sequence Quality Check
  const countNs = (seqStr: string) => (seqStr.toUpperCase().match(/N/g) || []).length;
  const highNSequences = metrics.sequences?.filter(s => countNs(s.sequence || '') > 10) || [];

  if (highNSequences.length > 0) {
    recommendations.push({
      priority: 'high',
      title: 'Perform Fine-Trim or Chromatogram Extraction',
      description: 'Use the Sanger Sequence Sensi-Cleaner tool to truncate the low-confidence ends of your ' + highNSequences.length + ' noisy samples (containing >10 ambiguous N bases).',
      reason: 'High N content clusters degrade ClustalW alignment accuracy and cause artificial branch extensions in phylogenetic NJ trees.'
    });
  }

  // Default fallback recommendations to guarantee suggestions are never empty
  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'low',
      title: 'Incorporate Additional Outgroup References',
      description: 'Obtain homologous reference accessions from BLAST hits and re-run alignments with an outgroup specimen to polarize phylogenetic branch weights.',
      reason: 'Outgroups are necessary to root the Neighbor-Joining tree correctly and evaluate ancestral character states.'
    });
  }

  return recommendations;
}
