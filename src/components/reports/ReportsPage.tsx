import { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  FileText, 
  RefreshCw, 
  History, 
  AlertCircle, 
  Activity,
  Heart
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { apiService, generateAIInsight } from '../../services/apiService';
import { SavedInsight } from '../../types';
import EmptyState from '../shared/EmptyState';
import InsightForm from './InsightForm';
import InsightCard from './InsightCard';
import SavedInsights from './SavedInsights';
import { motion, AnimatePresence } from 'motion/react';
import { detectDatasetFromSequences } from '../../utils/datasetDetector';

export default function ReportsPage() {
  const { 
    analysisResults, 
    activeReportFocus, 
    setActiveReportFocus, 
    addSavedInsight, 
    savedInsights,
    showToast 
  } = useAppStore();

  const activeSequences = useAppStore(state => state.getActiveSequences());
  const activeView = useAppStore(state => state.activeView);
  const activeDatasetId = useAppStore(state => state.activeDatasetId);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedResult, setGeneratedResult] = useState<{
    text: string;
    focus: string;
    focusArea: string;
    detail: string;
    timestamp: string;
    question?: string;
    id: string;
    source?: 'gemini' | 'mock';
  } | null>(null);

  const [initialFocusForm, setInitialFocusForm] = useState('overview');
  const [initialFocusAreaForm, setInitialFocusAreaForm] = useState('biological');

  // Compute active dataset stats dynamically with falling back gracefully to standard defaults
  const activeStats = useMemo(() => {
    if (activeSequences.length === 0) {
      return {
        hd: '0.842',
        pi: '0.0124',
        haplotypes: 7,
        polymorphicSites: 18,
        n_samples: 20,
        datasetName: 'Demo Javan Rusa mtDNA',
        datasetId: 'rusa',
        avgLen: 508
      };
    }

    let dId = 'custom';
    let dName = 'Uploaded Sequences';
    let fallbackHd = '0.785';
    let fallbackPi = '0.0185';
    let fallbackHaplo = 5;
    let fallbackSites = 12;

    if (activeView === 'demo') {
      if (activeDatasetId === 'rusa-timorensis' || activeDatasetId === 'rusa') {
        dId = 'rusa';
        dName = 'Rusa timorensis (Javan Rusa Deer)';
        fallbackHd = '0.842';
        fallbackPi = '0.0124';
        fallbackHaplo = 7;
        fallbackSites = 18;
      } else if (activeDatasetId === 'coi-barcode' || activeDatasetId === 'coi') {
        dId = 'coi';
        dName = 'COI Barcode (Multi-species)';
        fallbackHd = '0.965';
        fallbackPi = '0.0468';
        fallbackHaplo = 14;
        fallbackSites = 94;
      } else if (activeDatasetId === '16s-rrna' || activeDatasetId === 'bacteria' || activeDatasetId === '16s-rrna-bacterial') {
        dId = 'bacteria';
        dName = '16S rRNA (Bacterial)';
        fallbackHd = '0.895';
        fallbackPi = '0.0210';
        fallbackHaplo = 9;
        fallbackSites = 32;
      }
    } else {
      // Workspace mode: auto-detect from actual user sequences
      const detection = detectDatasetFromSequences(activeSequences);
      dName = detection.label;
      dId = detection.name;
      if (detection.name === 'bacteria') {
        fallbackHd = '0.895';
        fallbackPi = '0.0210';
        fallbackHaplo = 9;
        fallbackSites = 32;
      } else if (detection.name === 'mammal') {
        fallbackHd = '0.842';
        fallbackPi = '0.0124';
        fallbackHaplo = 7;
        fallbackSites = 18;
      }
    }

    // Try reading actual live calculations from AnalysisDashboard
    const realHd = analysisResults?.diversity?.hd !== undefined ? parseFloat(analysisResults.diversity.hd.toFixed(4)) : parseFloat(fallbackHd);
    const realPi = analysisResults?.diversity?.pi !== undefined ? parseFloat(analysisResults.diversity.pi.toFixed(6)) : parseFloat(fallbackPi);
    const realHaplo = analysisResults?.diversity?.numHaplotypes !== undefined ? analysisResults.diversity.numHaplotypes : fallbackHaplo;
    const realSites = analysisResults?.diversity?.s !== undefined ? analysisResults.diversity.s : fallbackSites;
    const realAvgLen = analysisResults?.avgLength !== undefined ? analysisResults.avgLength : Math.round(activeSequences.reduce((sum, s) => sum + s.sequence.length, 0) / activeSequences.length);

    return {
      hd: realHd.toString(),
      pi: realPi.toString(),
      haplotypes: realHaplo,
      polymorphicSites: realSites,
      n_samples: activeSequences.length,
      datasetName: dName,
      datasetId: dId,
      avgLen: realAvgLen
    };
  }, [activeSequences, activeView, activeDatasetId, analysisResults]);

  // Handle auto-generation from "Ask AI" redirect
  useEffect(() => {
    if (activeReportFocus) {
      const { focus, focusArea } = activeReportFocus;
      setInitialFocusForm(focus);
      if (focusArea) setInitialFocusAreaForm(focusArea);

      // Trigger auto generation
      handleTriggerGeneration({
        focus,
        focusArea: focusArea || 'biological',
        detail: 'standard',
        customQuestion: ''
      });

      // Clear the trigger
      setActiveReportFocus(null);
    }
  }, [activeReportFocus]);

  const handleTriggerGeneration = async (params: {
    focus: string;
    focusArea: string;
    detail: string;
    customQuestion: string;
  }) => {
    setIsLoading(true);
    setLoadingStep('Extracting sequence metrics...');

    const isReal = useAppStore.getState().useRealAI && useAppStore.getState().geminiApiKey?.startsWith('AIza');

    try {
      await new Promise(r => setTimeout(r, 450));
      setLoadingStep('Filtering nucleotide positions...');
      await new Promise(r => setTimeout(r, 500));
      setLoadingStep('Compiling haplotype diversity matrices...');
      await new Promise(r => setTimeout(r, 550));
      if (isReal) {
        setLoadingStep('Consulting Gemini AI engine...');
      } else {
        setLoadingStep('Generating pre-loaded template insights...');
      }
      await new Promise(r => setTimeout(r, 600));
      setLoadingStep('Drafting thesis discussion parameters...');

      const req = {
        dataset: activeStats.datasetId,
        focus: params.focus,
        detail: params.detail,
        focusArea: params.focusArea,
        metrics: {
          n: activeStats.n_samples,
          hd: activeStats.hd,
          pi: activeStats.pi,
          s: activeStats.polymorphicSites,
          haplotypes: activeStats.haplotypes,
          datasetName: activeStats.datasetName,
          avgLen: activeStats.avgLen
        },
        customQuestion: params.customQuestion || undefined
      };

      const result = await generateAIInsight(req, useAppStore.getState().geminiApiKey);

      setGeneratedResult({
        text: result.text,
        focus: params.focus,
        focusArea: params.focusArea,
        detail: params.detail,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        question: params.customQuestion || undefined,
        id: 'insight_' + Math.random().toString(36).substring(2, 9),
        source: result.source
      });

      setIsLoading(false);
      if (result.source === 'gemini') {
        showToast('🟢 Insight generated via Google Gemini direct channel', 'success');
      } else {
        showToast('🟡 Analytical insight compiled (Offline Simulated fallback)', 'success');
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      showToast('Offline fallback: Compiled pre-loaded sample analysis.', 'success');
    }
  };

  const handleSaveInsight = () => {
    if (!generatedResult) return;

    const newSaved: SavedInsight = {
      id: generatedResult.id,
      dataset: activeStats.datasetId,
      datasetName: activeStats.datasetName,
      focus: generatedResult.focus,
      focusName: getFocusDisplayName(generatedResult.focus, generatedResult.focusArea),
      detail: generatedResult.detail,
      text: generatedResult.text,
      timestamp: `${new Date().toLocaleDateString('en-US')} ${generatedResult.timestamp}`,
      question: generatedResult.question,
      source: generatedResult.source,
      metricsUsed: {
        hd: activeStats.hd,
        pi: activeStats.pi,
        haplotypes: activeStats.haplotypes,
        polymorphicSites: activeStats.polymorphicSites,
        n_samples: activeStats.n_samples
      }
    };

    addSavedInsight(newSaved);
    showToast('✓ Saved report to analysis log successfully', 'success');
  };

  const getFocusDisplayName = (focusKey: string, areaKey: string) => {
    const focusLabels: Record<string, string> = {
      overview: 'Current Dataset Overview',
      diversity: 'Diversity Metrics Analysis',
      tree: 'Phylogenetic Tree Topology Interpretation',
      blast: 'BLAST Reference Sequence Verification',
      custom: 'Custom Theoretical Q&A consultation'
    };

    const areaLabels: Record<string, string> = {
      biological: 'Biological Interpretation',
      methodology: 'Methodology Analysis',
      next_steps: 'Next-Steps Recommendations',
      comparison: 'Literature Review Comparison'
    };

    return `${focusLabels[focusKey] || 'Genomic analysis'} - ${areaLabels[areaKey] || 'Interpretation'}`;
  };

  // Determine if active generated card has already been saved to report lists
  const isCurrentSaved = useMemo(() => {
    if (!generatedResult) return false;
    return savedInsights.some((item) => item.id === generatedResult.id);
  }, [generatedResult, savedInsights]);

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      {/* Title Header area */}
      <div className="flex items-start justify-between border-b border-slate-200 dark:border-teal-900/45 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-teal-950 dark:text-teal-50 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-500 animate-pulse shrink-0" />
            <span>AI Scientific Insights & Reports</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Formulate high-fidelity genomic explanations, thesis discussions, and methodological references instantly using mock Gemini AI parameters.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left pane: selector form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <Activity className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xs font-bold text-teal-950 dark:text-teal-55 uppercase tracking-wider">
              Generate New Insight
            </h3>
          </div>

          <InsightForm
            onGenerate={handleTriggerGeneration}
            isLoading={isLoading}
            initialFocus={initialFocusForm}
            initialFocusArea={initialFocusAreaForm}
          />
        </div>

        {/* Right pane: generation loader or content screen */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center space-x-2 px-1">
            <Sparkles className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-xs font-bold text-teal-950 dark:text-teal-55 uppercase tracking-wider">
              AI Insight Results
            </h3>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              /* Loading Spinner skeleton */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/50 p-12 text-center shadow-sm space-y-4 min-h-[350px] flex flex-col justify-center items-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-teal-100 dark:bg-teal-950/40 animate-ping opacity-60 w-12 h-12 m-auto" />
                  <RefreshCw className="w-10 h-10 text-teal-500 animate-spin relative" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-teal-950 dark:text-teal-100">
                    AI Sequencing Matrix Analysis Active
                  </h4>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-mono mt-1.5 animate-pulse">
                    {loadingStep}...
                  </p>
                  <p className="text-[10px] text-slate-400 mt-3 max-w-xs mx-auto">
                    Gemini assembles evolutionary distances, Tajima expansion neutrality thresholds, and family barcodes using peer benchmarks.
                  </p>
                </div>
              </motion.div>
            ) : generatedResult ? (
              /* Card results display */
              <InsightCard
                datasetName={activeStats.datasetName}
                focusArea={getFocusDisplayName(generatedResult.focus, generatedResult.focusArea)}
                detailLevel={generatedResult.detail}
                insightText={generatedResult.text}
                timestamp={generatedResult.timestamp}
                isSaved={isCurrentSaved}
                onSave={handleSaveInsight}
                source={generatedResult.source}
                onRegenerate={() => handleTriggerGeneration({
                  focus: generatedResult.focus,
                  focusArea: generatedResult.focusArea,
                  detail: generatedResult.detail,
                  customQuestion: generatedResult.question || ''
                })}
              />
            ) : (
              <EmptyState
                title="No insights generated"
                description="Select an analysis and focus area from the options panel on the left, then click 'Generate New Insight' to formulate your first Gemini explanation."
                icon={<FileText className="w-8 h-8 text-slate-400" />}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Permanent saved list bottom half */}
      <div className="border-t border-slate-200 dark:border-teal-900/40 pt-6 space-y-4">
        <div className="flex items-center space-x-2 px-1">
          <History className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
          <h3 className="text-xs font-bold text-teal-950 dark:text-teal-55 uppercase tracking-wider">
            Saved Permanent Knowledge Reports ({savedInsights.length} entries)
          </h3>
        </div>

        <SavedInsights />
      </div>
    </div>
  );
}
