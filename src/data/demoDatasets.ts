import { DemoDataset } from '../types';
import { 
  generateRusaDataset, 
  generateCoiDataset, 
  generate16sDataset 
} from './mockSequences';

export const demoDatasets: DemoDataset[] = [
  {
    id: 'rusa-timorensis',
    name: 'Rusa timorensis (D-loop mtDNA)',
    tagline: 'Phylogeography & Population Genomics',
    description: '20 mitochondrial D-loop sequences of Javan rusa deer sampled from three Indonesian national parks: Alas Purwo, Baluran, and Meru Betiri. Perfect for genetic diversity analyses.',
    iconName: 'Deer',
    sampleCount: 20,
    avgLength: 480,
    sequences: generateRusaDataset()
  },
  {
    id: 'coi-barcode',
    name: 'COI Barcoding (Multi-Species)',
    tagline: 'DNA Barcoding of Endangered East Indonesian Fauna',
    description: '10 iconic wildlife species of Eastern Indonesia, featuring 3 individuals each for COI cytochrome c oxidase subunit I barcode identification. Excellent for building high-divergence phylogenetic trees.',
    iconName: 'Bug',
    sampleCount: 30,
    avgLength: 645,
    sequences: generateCoiDataset()
  },
  {
    id: '16s-rrna',
    name: '16S rRNA Bacterial Endophytes',
    tagline: 'Taxonomic Identification of Resilient Bacteria',
    description: '15 local endophytic bacterial strains isolated from crops of drought-resistant paddy plants in Sleman, Yogyakarta, analyzed using 16S rRNA sequences to demonstrate hypervariable loop structures.',
    iconName: 'Microscope',
    sampleCount: 15,
    avgLength: 400,
    sequences: generate16sDataset()
  }
];
