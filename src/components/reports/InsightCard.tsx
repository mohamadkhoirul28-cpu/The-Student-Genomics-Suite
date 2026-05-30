import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Copy, Check, Bookmark, BookmarkCheck, RefreshCw, AlertTriangle, Download, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { MethodsBadge } from '../shared/MethodsBadge';
import { useAppStore } from '../../stores/appStore';

interface InsightCardProps {
  focusArea: string;
  detailLevel: string;
  insightText: string;
  timestamp: string;
  isSaved?: boolean;
  onSave?: () => void;
  onRegenerate?: () => void;
  datasetName?: string;
  source?: 'gemini' | 'mock';
}

export default function InsightCard({
  focusArea,
  detailLevel,
  insightText,
  timestamp,
  isSaved = false,
  onSave,
  onRegenerate,
  datasetName,
  source = 'mock'
}: InsightCardProps) {
  const [copied, setCopied] = useState(false);
  const { useRealAI, geminiApiKey } = useAppStore();

  const handleCopy = () => {
    navigator.clipboard.writeText(insightText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSourceBadge = () => {
    if (source === 'gemini') {
      return { 
        label: 'Gemini AI', 
        icon: '🟢', 
        bgClass: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30' 
      };
    }
    if (useRealAI && geminiApiKey) {
      return { 
        label: 'Gemini AI (Pending)', 
        icon: '🟡', 
        bgClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30' 
      };
    }
    return { 
      label: 'Demo Mode', 
      icon: '🟡', 
      bgClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30' 
    };
  };

  const badge = getSourceBadge();

  const handleExportMarkdown = () => {
    const blob = new Blob([insightText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `genomics_insight_${focusArea.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportText = () => {
    const rawContent = `GENOMICS SUITE AI INSIGHT REPORT\n================================\nSource Dataset: ${datasetName || 'Active Genome'}\nFocus Area: ${focusArea} (${detailLevel})\nCompiled on: ${timestamp}\n\n${insightText}`;
    const blob = new Blob([rawContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `genomics_insight_${focusArea.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/60 p-6 shadow-md space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-500 dark:text-teal-400">
            <Sparkles className={`w-5 h-5 ${source === 'gemini' ? 'text-teal-500' : 'text-amber-500 animate-pulse'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-teal-950 dark:text-teal-50 text-sm tracking-tight">
                AI Analysis Support
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${badge.bgClass}`}>
                {badge.icon} {badge.label}
              </span>
            </div>
            {datasetName && (
              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                Source: {datasetName} | Area: {focusArea} ({detailLevel})
              </p>
            )}
          </div>
        </div>

        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono tracking-wider sm:text-right">
          Analyzed {timestamp}
        </span>
      </div>

      {/* Styled ReactMarkdown body conforming to Tailwind 4.0 CSS dark and light standards */}
      <div className="markdown-body text-xs sm:text-sm text-slate-705 dark:text-slate-205 leading-relaxed overflow-x-auto whitespace-normal select-text max-h-96 overflow-y-auto pr-2 scrollbar mb-4">
        <ReactMarkdown
          components={{
            h1: ({node, ...props}) => <h1 className="text-sm font-bold text-teal-950 dark:text-teal-400 mt-4 mb-2 first:mt-0" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xs font-bold text-teal-900 dark:text-teal-300 mt-4 mb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xs font-bold text-teal-950 dark:text-teal-300 mt-3 mb-1" {...props} />,
            p: ({node, ...props}) => <p className="mb-3 whitespace-normal hyphens-auto" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1 dark:text-slate-350" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1 dark:text-slate-350" {...props} />,
            li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left text-[11px]" {...props} />
              </div>
            ),
            thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-900 font-bold" {...props} />,
            th: ({node, ...props}) => <th className="px-3 py-2 text-teal-950 dark:text-teal-200 font-bold border-b border-slate-200 dark:border-slate-700" {...props} />,
            td: ({node, ...props}) => <td className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/30 text-slate-600 dark:text-slate-300" {...props} />,
            hr: ({node, ...props}) => <hr className="my-4 border-slate-200 dark:border-slate-700" {...props} />,
            blockquote: ({node, ...props}) => (
              <blockquote className="border-l-4 border-teal-500 pl-4 py-1.5 my-3 italic text-teal-800 dark:text-teal-300 bg-teal-50/30 dark:bg-teal-950/20 rounded-r-md" {...props} />
            )
          }}
        >
          {insightText}
        </ReactMarkdown>
      </div>

      {/* Dynamic Academic Citation Methods Badge based on Report focus area */}
      {focusArea && (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          {focusArea.toLowerCase().includes('diversity') ? (
            <MethodsBadge 
              method="Interpretation Methodology: Pop-Gen Indices"
              algorithm="Nei's Haplotype Diversity (Hd) and Nucleotide Diversity (π)"
              reference="Nei, M., 1987. Molecular evolutionary genetics. Columbia University; Tajima, F., 1983. Evolutionary relationship of DNA sequences. Genetics, 105(2)."
            />
          ) : focusArea.toLowerCase().includes('blast') ? (
            <MethodsBadge 
              method="Interpretation Methodology: NCBI BLAST Local Aligner Search"
              algorithm="BLASTn nucleotide-nucleotide basic local alignment query"
              reference="Altschul, S.F., Gish, W., Miller, W., Myers, E.W. and Lipman, D.J., 1990. Basic local alignment search tool. Journal of Molecular Biology, 215(3), pp.403-410."
            />
          ) : (
            <MethodsBadge 
              method="Interpretation Methodology: Phylogeny Dendrogram Inference"
              algorithm="Saitou & Nei p-distance matrices & Neighbor-Joining"
              reference="Saitou, N. and Nei, M., 1987. The neighbor-joining method: a new method for reconstructing phylogenetic trees. Molecular Biology and Evolution, 4(4)."
            />
          )}
        </div>
      )}

      {/* Safety Disclaimer */}
      <div className="p-3 bg-teal-50/10 dark:bg-slate-900/30 border border-teal-100/60 dark:border-teal-955/40 rounded-lg flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
          <strong>AI Disclaimer:</strong> Insights are generated recursively utilizing molecular database templates for Indonesia. Cross-validate genetic index figures against standard dry-lab software (DnaSP, MEGA) before presentation in academic defend skripsi or research journals.
        </p>
      </div>

      {/* Actions toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <button
          onClick={handleCopy}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-900/60 border border-slate-250 dark:border-teal-900/40 rounded-lg cursor-pointer transition-colors shadow-3xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Insight</span>
            </>
          )}
        </button>

        <button
          onClick={handleExportMarkdown}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-900/60 border border-slate-250 dark:border-teal-900/40 rounded-lg cursor-pointer transition-colors shadow-3xs"
          title="Export report as raw Markdown file (.md)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export MD</span>
        </button>

        <button
          onClick={handleExportText}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-350 border border-slate-250 dark:border-teal-900/40 rounded-lg cursor-pointer transition-colors shadow-3xs"
          title="Export report as raw plain Text file (.txt)"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export TXT</span>
        </button>

        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaved}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border cursor-pointer transition-colors shadow-3xs ${
              isSaved
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 border-slate-250 dark:border-teal-900/40 text-slate-600 dark:text-slate-355'
            }`}
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Saved to Reports</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save to Reports</span>
              </>
            )}
          </button>
        )}

        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="inline-flex items-center space-x-1.5 ml-auto px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
