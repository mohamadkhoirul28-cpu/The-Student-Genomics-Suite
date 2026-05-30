import { generateMockBlastResults, generateMockSequence } from '../utils/ncbiMock';
import { generateInsight, PromptMetrics, biologicalContext } from '../utils/aiPrompts';
import { useAppStore } from '../stores/appStore';
import { callGeminiDirect, testGeminiConnection } from './geminiService';

export interface AIInsightRequest {
  dataset: string;      // 'rusa' | 'coi' | 'bacteria'
  focus: string;        // 'diversity' | 'tree' | 'blast' | 'custom'
  detail: string;       // 'brief' | 'standard' | 'detailed'
  focusArea?: string;   // 'biological' | 'methodology' | 'next_steps' | 'comparison'
  metrics: {
    n_samples?: number;
    n?: number;
    hd: string | number;
    pi: string | number;
    polymorphicSites?: number;
    s?: number;
    haplotypes: number;
    datasetName?: string;
    avgLen?: number;
    [key: string]: any;
  };
  customQuestion?: string;
}

export interface AIInsightResponse {
  text: string;
  source: 'gemini' | 'mock';
  timestamp: string;
}

/**
 * Direct Gemini + Mock Three-Tier AI Fallback Service
 */
export async function generateAIInsight(
  request: AIInsightRequest,
  apiKey: string | null
): Promise<AIInsightResponse> {
  const timestamp = new Date().toISOString();
  
  const isRealAI = useAppStore.getState().useRealAI;
  
  // Tier 1: Try real browser-direct Gemini if key exists and real AI is enabled
  if (isRealAI && apiKey && apiKey.startsWith('AIza')) {
    try {
      const prompt = buildGeminiPrompt(request);
      console.log('[AI Service] Prompt compiled. Calling callGeminiDirect...');
      let text = await callGeminiDirect(prompt, apiKey);
      
      // FIX 3a: Detect truncation (ends mid-sentence / doesn't end with standard punctuation)
      const lastChar = text.trim().slice(-1);
      const isTruncated = !['.', '!', '?', '"', "'"].includes(lastChar);
      
      if (isTruncated) {
        console.warn('[AI Service] Response truncated, requesting continuation...');
        const continuePrompt = prompt + '\n\nPREVIOUS RESPONSE (incomplete):\n' + text + '\n\nContinue from where you left off. Finish the last sentence and complete the analysis.';
        const continuation = await callGeminiDirect(continuePrompt, apiKey);
        text = text.trim() + ' ' + continuation.trim();
      }
      
      // FIX 3b: Detect Indonesian language
      const indonesianWords = ['dan', 'yang', 'dari', 'untuk', 'dengan', 'pada', 'adalah', 'ini', 'skripsi', 'mahasiswa', 'bab', 'metode', 'hasil', 'pembahasan'];
      const hasIndonesian = indonesianWords.some(word => text.toLowerCase().includes(word));
      
      if (hasIndonesian) {
        console.warn('[AI Service] Response contains Indonesian, regenerating with stricter instruction...');
        const strictPrompt = prompt + '\n\nCRITICAL: Your previous response contained non-English text. This response MUST be 100% in English only.';
        text = await callGeminiDirect(strictPrompt, apiKey);
      }
      
      return {
        text,
        source: 'gemini',
        timestamp
      };
    } catch (err) {
      console.warn('[AI Service] Gemini direct call failed, falling back to mock:', err);
      // Fall through to Tier 3
    }
  }
  
  // Tier 3: Mock fallback (always works)
  const n_samples = request.metrics.n !== undefined ? request.metrics.n : (request.metrics.n_samples !== undefined ? request.metrics.n_samples : 20);
  const polymorphicSites = request.metrics.s !== undefined ? request.metrics.s : (request.metrics.polymorphicSites !== undefined ? request.metrics.polymorphicSites : 18);
  const hdStr = String(request.metrics.hd);
  const piStr = String(request.metrics.pi);
  const dName = request.metrics.datasetName || 'Active Genome Dataset';
  
  const promptMetrics: PromptMetrics = {
    hd: hdStr,
    pi: piStr,
    haplotypes: request.metrics.haplotypes || 5,
    polymorphicSites,
    n_samples,
    datasetName: dName,
    avgLen: request.metrics.avgLen || 500
  };

  const text = generateInsight(
    request.dataset,
    request.focus,
    request.detail,
    request.focusArea || 'biological',
    promptMetrics,
    request.customQuestion
  );
  
  return {
    text,
    source: 'mock',
    timestamp
  };
}

/**
 * Builds standard structured prompt instructions for Gemini AI analysis
 */
function buildGeminiPrompt(req: AIInsightRequest): string {
  const { dataset, focus, detail, metrics, customQuestion } = req;
  const n = metrics.n !== undefined ? metrics.n : (metrics.n_samples !== undefined ? metrics.n_samples : 20);
  const s = metrics.s !== undefined ? metrics.s : (metrics.polymorphicSites !== undefined ? metrics.polymorphicSites : 18);
  const dName = metrics.datasetName || 'Active Genome Dataset';
  
  const hdNum = parseFloat(String(metrics.hd)) || 0;
  const piNum = parseFloat(String(metrics.pi)) || 0;

  const bioContext: string[] = [];
  if (hdNum > 0.8) {
    bioContext.push(biologicalContext.hd.high);
  } else if (hdNum > 0.5) {
    bioContext.push(biologicalContext.hd.moderate);
  } else {
    bioContext.push(biologicalContext.hd.low);
  }

  if (piNum > 0.02) {
    bioContext.push(biologicalContext.pi.high);
  } else if (piNum > 0.005) {
    bioContext.push(biologicalContext.pi.moderate);
  } else {
    bioContext.push(biologicalContext.pi.low);
  }
  
  let prompt = `INSTRUCTION: You are a population genetics expert helping an Indonesian undergraduate biology student interpret their data for their thesis. 
RESPOND ENTIRELY IN ENGLISH. Do not use any other language.
Use scientific but accessible language.
Be concise but thorough.

DATA SUMMARY:
- Target Species/Organism: ${dName}
- Cohort Sample Count (N): ${n}
- Estimated Haplotype Diversity (Hd): ${metrics.hd}
- Estimated Nucleotide Diversity (π): ${metrics.pi}
- Polymorphic Loci / SNP Sites (S): ${s}
- Haplotypes Observed Count: ${metrics.haplotypes}
- Average Read Length: ${metrics.avgLen || 500} bp

BIOLOGICAL CONTEXT (incorporate naturally):
${bioContext.join('\n')}

`;

  if (focus === 'diversity') {
    prompt += `TASK: Explain the genetic diversity metrics.
Structure your response as follows:
1. EXECUTIVE SUMMARY (2-3 sentences): What do these numbers mean overall?
2. BIOLOGICAL INTERPRETATION: 
   - What does Hd = ${metrics.hd} indicate about genetic diversity?
   - What does π = ${metrics.pi} suggest about population history? Mention that high Hd and low π suggest a population bottleneck followed by rapid expansion.
3. COMPARISON: How do these values compare to typical mammalian/fauna/microbe populations in the literature?
4. NEXT STEPS: Suggest 1-2 follow-up analyses.

RULES:
- Respond ONLY in English
- Include specific numbers from data
- Do not invent data not provided
- Total length: ${detail === 'brief' ? '200-300 words' : detail === 'standard' ? '400-600 words' : '700-1000 words'}
- Use markdown formatting with headers`;
  } else if (focus === 'tree') {
    prompt += `TASK: Interpret the phylogenetic tree structure.
Structure your response as follows:
1. EXECUTIVE SUMMARY (2-3 sentences): What is the main finding regarding genetic structure or tree topology?
2. BIOLOGICAL INTERPRETATION:
   - Describe the main clades and what they suggest about gene flow, geographical isolation, or sub-species taxonomy.
   - Explain bootstrap node reliability and support.
3. COMPARISON: What does the tree structure imply compared to healthy, panmictic, or structured populations in the literature?
4. NEXT STEPS: Suggest 1-2 genetic tests or diagnostic steps.

RULES:
- Respond ONLY in English
- Include specific numbers from data
- Do not invent data not provided
- Total length: ${detail === 'brief' ? '200-300 words' : detail === 'standard' ? '400-600 words' : '700-1000 words'}
- Use markdown formatting with headers`;
  } else if (focus === 'blast') {
    prompt += `TASK: Interpret NCBI BLAST results.
Structure your response as follows:
1. EXECUTIVE SUMMARY (2-3 sentences): Summarize the top hits and organism identification confidence.
2. BIOLOGICAL INTERPRETATION:
   - Describe what high query cover and high identity percentages imply about organism identification.
   - Detail the reliability and significance of low/zero E-values.
3. COMPARISON: Highlight how BLAST comparison with GenBank reference standards is crucial.
4. NEXT STEPS: Detail 1-2 further identification criteria (like sequencing other loci).

RULES:
- Respond ONLY in English
- Include specific numbers from data
- Do not invent data not provided
- Total length: ${detail === 'brief' ? '200-300 words' : detail === 'standard' ? '400-600 words' : '700-1000 words'}
- Use markdown formatting with headers`;
  } else {
    prompt += `TASK: Interpret the provided results as a specialized bioinformatician. Focus specifically on: ${customQuestion || 'General popgen overview'}.
Structure your response clearly with Markdown headings and ensure it is answered in ${detail} detail.

RULES:
- Respond ONLY in English
- Include specific numbers from data
- Do not invent data not provided
- Total length: ${detail === 'brief' ? '200-300 words' : detail === 'standard' ? '400-600 words' : '700-1000 words'}
- Use markdown formatting with headers`;
  }

  return prompt;
}

class APIService {
  private get backendUrl(): string {
    const envUrl = (import.meta as any).env?.VITE_BACKEND_URL;
    if (envUrl) return envUrl;
    
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return 'http://localhost:8080';
    }
    return 'https://genomics-proxy.run.app';
  }

  private isRealEnabled(): boolean {
    return useAppStore.getState().useRealAPIs;
  }

  // NCBI BLAST
  async blastSearch(sequence: string, program: string, database: string) {
    if (!this.isRealEnabled()) {
      return generateMockBlastResults(sequence);
    }
    try {
      const response = await fetch(`${this.backendUrl}/api/ncbi/blast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequence, program, database })
      });
      if (!response.ok) throw new Error('API server responded with error');
      return await response.json();
    } catch (err) {
      console.warn('Real BLAST API call failed; falling back to local simulation:', err);
      return generateMockBlastResults(sequence);
    }
  }

  // NCBI Fetch
  async fetchReference(accession: string) {
    if (!this.isRealEnabled()) {
      return { accession, sequence: generateMockSequence(accession) };
    }
    try {
      const response = await fetch(`${this.backendUrl}/api/ncbi/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accession })
      });
      if (!response.ok) throw new Error('API server responded with error');
      return await response.json();
    } catch (err) {
      console.warn('Real Fetch API call failed; falling back to local simulation:', err);
      return { accession, sequence: generateMockSequence(accession) };
    }
  }

  // Gemini proxy fallback
  async getInsight(focus: string, context: any) {
    const key = useAppStore.getState().geminiApiKey;
    if (!this.isRealEnabled() || !key) {
      return { text: this.mockInsight(focus, context) };
    }
    try {
      const response = await fetch(`${this.backendUrl}/api/gemini/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: focus, context, apiKey: key })
      });
      if (!response.ok) throw new Error('Gemini API server list error');
      return await response.json();
    } catch (err) {
      console.warn('Real Gemini API.chat failed; falling back to local simulation:', err);
      return { text: this.mockInsight(focus, context) };
    }
  }

  private mockInsight(focus: string, context: any): string {
    const datasetId = context.datasetId || 'rusa';
    const detail = context.detail || 'standard';
    const focusArea = context.focusArea || 'biological';
    const metrics = context.metrics || {
      hd: '0.842',
      pi: '0.0124',
      haplotypes: 7,
      polymorphicSites: 18,
      n_samples: 20,
      datasetName: 'Demo Javan Rusa mtDNA',
      avgLen: 508
    };
    const customQuestion = context.customQuestion || '';
    return generateInsight(datasetId, focus, detail, focusArea, metrics, customQuestion);
  }
}

export const apiService = new APIService();
export { testGeminiConnection };
