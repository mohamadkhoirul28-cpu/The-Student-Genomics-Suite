import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Trash2, 
  Download, 
  Search, 
  Filter, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Eye, 
  X,
  FileDown
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { SavedInsight } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

export default function SavedInsights() {
  const { savedInsights, removeSavedInsight, clearSavedInsights, showToast } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDataset, setFilterDataset] = useState('all');
  const [filterFocus, setFilterFocus] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<SavedInsight | null>(null); // For detail preview modal

  // Filter & Search Logic
  const filteredInsights = useMemo(() => {
    return savedInsights.filter((insight) => {
      const matchesSearch = 
        insight.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.datasetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        insight.focusName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (insight.question && insight.question.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDataset = 
        filterDataset === 'all' || 
        insight.dataset.toLowerCase() === filterDataset.toLowerCase();

      const matchesFocus = 
        filterFocus === 'all' || 
        insight.focus.toLowerCase() === filterFocus.toLowerCase();

      return matchesSearch && matchesDataset && matchesFocus;
    });
  }, [savedInsights, searchQuery, filterDataset, filterFocus]);

  // Unique datasets and focus options for filters
  const datasetOptions = useMemo(() => {
    const list = new Set(savedInsights.map(item => item.dataset));
    return Array.from(list);
  }, [savedInsights]);

  const focusOptions = useMemo(() => {
    const list = new Set(savedInsights.map(item => item.focus));
    return Array.from(list);
  }, [savedInsights]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleExportSingle = (insight: SavedInsight) => {
    const separator = "============================================================\n";
    const header = `THE STUDENT GENOMICS SUITE — MOLECULAR ANALYSIS EXPLANATION\n`;
    const metadata = `Dataset: ${insight.datasetName}\nFocus Area: ${insight.focusName} (${insight.detail})\nDate Saved: ${insight.timestamp}\n`;
    const content = `${insight.question ? `Question Asked: ${insight.question}\n\n` : ''}${insight.text}\n`;
    const footer = `\n${separator}Produced automatically by Student Genomics AI Insight Assistant.\n`;
    
    const fileBytes = header + separator + metadata + separator + content + footer;
    const blob = new Blob([fileBytes], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Insight_${insight.focus}_${insight.id.substring(0,4)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ Exported single report successfully', 'success');
  };

  const handleExportAll = () => {
    if (filteredInsights.length === 0) return;
    
    const divider = "\n\n" + "#".repeat(80) + "\n\n";
    let aggregatedText = `THE STUDENT GENOMICS SUITE — ALL SAVED EXPERIMENTAL REPORTS\n`;
    aggregatedText += `Export Date: ${new Date().toLocaleDateString('en-US')} | Total Compiled Insights: ${filteredInsights.length}\n`;
    aggregatedText += `================================================================================\n\n`;

    filteredInsights.forEach((insight, idx) => {
      aggregatedText += `REPORT CHUNK ${idx + 1} OF ${filteredInsights.length}\n`;
      aggregatedText += `ID: ${insight.id}\n`;
      aggregatedText += `Dataset: ${insight.datasetName}\n`;
      aggregatedText += `Analysis Target: ${insight.focusName} (${insight.detail})\n`;
      aggregatedText += `Timestamp: ${insight.timestamp}\n`;
      if (insight.question) {
        aggregatedText += `User Question: ${insight.question}\n`;
      }
      aggregatedText += `--------------------------------------------------------\n\n`;
      aggregatedText += insight.text;
      if (idx !== filteredInsights.length - 1) {
        aggregatedText += divider;
      }
    });

    const blob = new Blob([aggregatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Genomics_Suite_Saved_Insights_Bundle.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ Exported all selected report files successfully', 'success');
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you absolutely sure you want to delete ALL saved insight reports? This cannot be undone.')) {
      clearSavedInsights();
      showToast('✓ Cleared all saved reports', 'success');
    }
  };

  const getDatasetLabel = (key: string) => {
    if (key === 'rusa') return 'Rusa timorensis MT';
    if (key === 'coi') return 'COI Species Barcode';
    if (key === 'bacteria') return '16S Ribosomal RNA';
    return 'Custom Sequence';
  };

  const getFocusLabel = (key: string) => {
    if (key === 'overview') return 'Overview';
    if (key === 'diversity') return 'Diversity Statistics';
    if (key === 'tree') return 'Phylogeny Branching';
    if (key === 'blast') return 'BLAST Species confirmation';
    return 'Q&A Consultation';
  };

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-teal-900/40 p-4 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h4 className="text-xs font-bold text-teal-950 dark:text-teal-100 uppercase tracking-widest leading-none">
              Filter Saved Knowledge Base
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {savedInsights.length > 0 && (
              <>
                <button
                  onClick={handleExportAll}
                  disabled={filteredInsights.length === 0}
                  className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100/80 dark:bg-teal-950/40 dark:hover:bg-teal-900/60 dark:text-teal-300 border border-teal-200 dark:border-teal-900/60 text-teal-700 font-bold text-[11px] rounded-lg transition-all inline-flex items-center space-x-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Selection ({filteredInsights.length})</span>
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100/80 dark:bg-red-950/20 dark:hover:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-900/40 text-red-600 font-bold text-[11px] rounded-lg transition-all inline-flex items-center space-x-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
          {/* Keyword Query */}
          <div className="sm:col-span-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search keyword in explanations, questions..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-teal-900/60 focus:outline-none focus:ring-1 focus:ring-teal-500 placeholder-slate-400 font-sans"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          {/* Dataset Selector */}
          <div className="sm:col-span-3">
            <select
              value={filterDataset}
              onChange={(e) => setFilterDataset(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-teal-900/60 cursor-pointer focus:outline-none"
            >
              <option value="all">All Datasets ({savedInsights.length})</option>
              {datasetOptions.map((item) => (
                <option key={item} value={item}>
                  {getDatasetLabel(item)}
                </option>
              ))}
            </select>
          </div>

          {/* Focus Selector */}
          <div className="sm:col-span-3">
            <select
              value={filterFocus}
              onChange={(e) => setFilterFocus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-teal-900/60 cursor-pointer focus:outline-none"
            >
              <option value="all">All Metrics Categories</option>
              {focusOptions.map((item) => (
                <option key={item} value={item}>
                  {getFocusLabel(item)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {filteredInsights.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-teal-900/40">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-650 mb-3" />
          <h4 className="text-sm font-bold text-teal-950 dark:text-teal-100">
            No Saved Reports Found
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-md mx-auto">
            {savedInsights.length === 0 
              ? "Generate an explanation utilizing the top form and click 'Save to Reports' to populate your permanent academic appendix log."
              : "No search results match your active filtering parameters. Reset keywords or choose 'All Datasets'."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredInsights.map((insight) => {
              const isExpanded = expandedId === insight.id;
              return (
                <motion.div
                  key={insight.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-teal-900/50 rounded-xl p-5 shadow-xs flex flex-col justify-between hover:border-teal-350 dark:hover:border-teal-800 transition-all duration-150"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-50 dark:border-slate-700/30 pb-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">
                            {insight.focus}
                          </span>
                          {insight.source && (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold ${
                              insight.source === 'gemini'
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30'
                                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100/30'
                            } uppercase tracking-widest font-mono`}>
                              {insight.source === 'gemini' ? 'Gemini' : 'Demo'}
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-teal-950 dark:text-teal-50 mt-1.5 leading-tight">
                          {insight.focusName}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                          {insight.datasetName} ({insight.detail})
                        </p>
                      </div>

                      <span className="text-[9px] text-slate-400 font-mono text-right shrink-0">
                        {insight.timestamp}
                      </span>
                    </div>

                    {/* Question summary if any */}
                    {insight.question && (
                      <div className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-md border-l-2 border-teal-500 text-[11px] text-slate-600 dark:text-slate-350">
                        <span className="font-bold block text-[9px] uppercase tracking-wider text-teal-600 dark:text-teal-400">Consultation Query:</span>
                        <p className="line-clamp-2 italic font-medium">"{insight.question}"</p>
                      </div>
                    )}

                    {/* Dynamic height text section */}
                    <div className="text-xs text-slate-700 dark:text-slate-300 pointer-events-auto leading-relaxed">
                      {isExpanded ? (
                        <div className="prose prose-teal max-w-none text-xs dark:text-slate-300 pr-1 max-h-[220px] overflow-y-auto scrollbar">
                          <ReactMarkdown
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-[11px] font-bold text-teal-950 dark:text-teal-300 mt-2 mb-1 pl-1 border-l border-teal-500" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-[10px] font-bold text-teal-900 dark:text-teal-400 mt-2 mb-1" {...props} />,
                              th: ({node, ...props}) => <th className="px-2 py-1 text-[10px] bg-slate-50 dark:bg-slate-900 text-teal-950 dark:text-teal-200" {...props} />,
                              td: ({node, ...props}) => <td className="px-2 py-1 text-[10px] border-b border-slate-100 dark:border-slate-750" {...props} />,
                            }}
                          >
                            {insight.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="line-clamp-4 text-slate-500 dark:text-slate-400">
                          {insight.text.replace(/[#*`\n]/g, ' ')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions footer tools */}
                  <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-50 dark:border-slate-750/30">
                    <button
                      onClick={() => toggleExpand(insight.id)}
                      className="inline-flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Collapse</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Expand Explanations ({insight.text.length} chars)</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setSelectedInsight(insight)}
                        title="View fullscreen model"
                        className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-500 text-slate-400 rounded-md cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleExportSingle(insight)}
                        title="Download summary"
                        className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-teal-500 text-slate-400 rounded-md cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          removeSavedInsight(insight.id);
                          showToast('✓ Delete report index successfully', 'success');
                        }}
                        title="Remove report index"
                        className="p-1 px-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded-md cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Fullscreen detail Modal overlay */}
      <AnimatePresence>
        {selectedInsight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/60 shadow-xl overflow-hidden max-w-2xl w-full flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-teal-950 dark:text-teal-50 text-sm">
                      {selectedInsight.focusName}
                    </h3>
                    {selectedInsight.source && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        selectedInsight.source === 'gemini' 
                          ? 'bg-emerald-150 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-amber-150 bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                      }`}>
                        {selectedInsight.source === 'gemini' ? 'Gemini' : 'Demo'}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-mono leading-none mt-1">
                    {selectedInsight.datasetName} — {selectedInsight.detail}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-655" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {selectedInsight.question && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-l-3 border-teal-500 rounded-r-md text-xs text-slate-600 dark:text-slate-350">
                    <span className="block text-[10px] font-bold text-teal-600 uppercase">Consulted Topic:</span>
                    "{selectedInsight.question}"
                  </div>
                )}
                
                <div className="prose prose-teal max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-205 leading-relaxed">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-sm font-bold text-teal-950 dark:text-teal-400 mt-4 mb-2 first:mt-0" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xs font-bold text-teal-905 dark:text-teal-300 mt-4 mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="mb-0.5" {...props} />,
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-750 rounded-lg">
                          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left text-[11px]" {...props} />
                        </div>
                      ),
                      thead: ({node, ...props}) => <thead className="bg-slate-50 dark:bg-slate-900" {...props} />,
                      th: ({node, ...props}) => <th className="px-3 py-1.5 text-teal-950 dark:text-teal-200 font-bold border-b border-slate-200 dark:border-slate-700" {...props} />,
                      td: ({node, ...props}) => <td className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-750 text-slate-600 dark:text-slate-300" {...props} />,
                      blockquote: ({node, ...props}) => (
                        <blockquote className="border-l-4 border-teal-500 pl-4 py-2 italic text-teal-800 dark:text-teal-300 bg-teal-50/20 dark:bg-slate-900/50 rounded" {...props} />
                      )
                    }}
                  >
                    {selectedInsight.text}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/40">
                <span className="text-[10px] text-slate-400 font-mono">
                  Saved {selectedInsight.timestamp}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleExportSingle(selectedInsight)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 rounded-lg border border-teal-200 dark:border-teal-900/40 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </button>
                  <button
                    onClick={() => setSelectedInsight(null)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-705 rounded-lg cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
