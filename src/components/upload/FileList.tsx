import React, { useState } from 'react';
import { UploadedFile } from '../../types';
import { 
  Eye, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Play, 
  FileCode 
} from 'lucide-react';
import { FileDetailModal } from '../shared/FileDetailModal';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function FileList({
  files,
  onRemove,
  onProcess,
  isProcessing
}: FileListProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [activeModalFile, setActiveModalFile] = useState<UploadedFile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (files.length === 0) return null;

  // Format file size strictly in KB
  const formatKB = (bytes: number) => {
    return (bytes / 1024).toFixed(1);
  };

  // Helper to compute GC value of a file if parsed data exists
  const getFileGC = (file: UploadedFile) => {
    if (file.parsedSequences && file.parsedSequences.length > 0) {
      const totalGC = file.parsedSequences.reduce((sum, s) => sum + (s.gcContent || 0), 0);
      return (totalGC / file.parsedSequences.length).toFixed(1);
    }
    return '-';
  };

  const allSelected = files.length > 0 && selected.length === files.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(files.map(f => f.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const batchRemove = () => {
    selected.forEach(id => {
      onRemove(id);
    });
    setSelected([]);
  };

  // Process button is enabled ONLY when all files are in 'ready' or 'completed'
  const allReady = files.length > 0 && files.every(f => f.status === 'ready' || f.status === 'completed');

  const openDetailModal = (file: UploadedFile) => {
    setActiveModalFile(file);
    setIsModalOpen(true);
  };

  const closeDetailModal = () => {
    setActiveModalFile(null);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4 p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900 shadow-xs animate-fadeIn">
      
      {/* Title & Stats HUD */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-teal-900/60 pb-3">
        <div>
          <h3 className="text-sm font-bold text-teal-950 dark:text-teal-50">
            Staged Genomics Files ({files.length} active)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Table overview of genetic reads staged for population-level alignment analysis.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 px-2.5 py-0.5 rounded-full">
          {files.filter(f => f.status === 'ready' || f.status === 'completed').length} / {files.length} Ready
        </span>
      </div>

      {/* Compact table */}
      <div className="border border-slate-200 dark:border-teal-950 rounded-xl overflow-hidden bg-white dark:bg-slate-900/40">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-teal-950">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input 
                  type="checkbox" 
                  checked={allSelected} 
                  onChange={toggleSelectAll} 
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Filename</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Size</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">GC%</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-teal-950/30">
            {files.map(file => {
              const fileGC = getFileGC(file);
              const isReady = file.status === 'ready' || file.status === 'completed';

              return (
                <tr key={file.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-800/10 transition-colors">
                  {/* Select Checkbox */}
                  <td className="px-4 py-2 text-left">
                    <input 
                      type="checkbox" 
                      checked={selected.includes(file.id)} 
                      onChange={() => toggleSelectOne(file.id)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </td>

                  {/* Filename with custom format badge icon */}
                  <td className="px-4 py-2 font-mono text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[280px]" title={file.name}>
                    <div className="flex items-center space-x-2">
                      <FileCode className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  </td>

                  {/* Size column */}
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-400 text-xs font-mono">
                    {formatKB(file.size)} KB
                  </td>

                  {/* High-fidelity parsing status reporting column */}
                  <td className="px-4 py-2 text-xs">
                    {file.status === 'uploading' && (
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-teal-600 dark:text-teal-400">
                          <Loader2 className="w-3 h-3 animate-spin" /> UPLOADING ({file.progress}%)
                        </span>
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                          <div className="bg-teal-500 h-full transition-all duration-300" style={{ width: `${file.progress}%` }} />
                        </div>
                      </div>
                    )}
                    {file.status === 'parsing' && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> PARSING...
                      </span>
                    )}
                    {isReady && (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={13} className="shrink-0" /> READY
                      </span>
                    )}
                    {file.status === 'failed' && (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                          <AlertCircle size={13} className="shrink-0" /> VALIDATION FAILED
                        </span>
                        {file.errorMessage && (
                          <p className="text-[10px] text-rose-500 max-w-[140px] truncate" title={file.errorMessage}>
                            {file.errorMessage}
                          </p>
                        )}
                      </div>
                    )}
                  </td>

                  {/* GC Fraction column */}
                  <td className="px-4 py-2 text-slate-600 dark:text-slate-300 font-mono text-xs">
                    {fileGC !== '-' ? `${fileGC}%` : '-'}
                  </td>

                  {/* Actions column with detail modal trigger and deletions */}
                  <td className="px-4 py-2 actions-col">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => openDetailModal(file)} 
                        disabled={!isReady}
                        className={`p-1 rounded-md transition-all inline-flex items-center justify-center ${
                          isReady 
                            ? 'text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer' 
                            : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                        }`}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => onRemove(file.id)} 
                        disabled={isProcessing}
                        className={`p-1 rounded-md transition-all inline-flex items-center justify-center ${
                          isProcessing
                            ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
                            : 'text-slate-505 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer'
                        }`}
                        title="Remove file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Batch summary and execution HUD controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3 bg-slate-50/50 dark:bg-slate-900/20 p-3 rounded-lg border border-slate-150 dark:border-teal-950/30">
        <span className="text-xs font-semibold text-slate-550 dark:text-slate-400">
          {selected.length} of {files.length} staged file{files.length !== 1 ? 's' : ''} selected
        </span>
        
        <div className="flex gap-2.5 w-full sm:w-auto justify-end">
          {selected.length > 0 && (
            <button 
              onClick={batchRemove}
              disabled={isProcessing}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3.5 py-2 rounded-lg text-xs font-bold transition-all border border-rose-200 dark:border-rose-950 cursor-pointer"
            >
              Delete Selected ({selected.length})
            </button>
          )}
          
          <button
            disabled={!allReady || isProcessing}
            onClick={onProcess}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-5 py-2 rounded-lg text-xs cursor-pointer shadow-2xs transition-all disabled:bg-slate-205 dark:disabled:bg-slate-750 disabled:text-slate-400 dark:disabled:text-slate-550 disabled:cursor-not-allowed inline-flex items-center space-x-1.5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Sanger sequences...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Process {files.length} File{files.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Detailed Insights Modal */}
      {activeModalFile && (
        <FileDetailModal 
          file={activeModalFile}
          isOpen={isModalOpen}
          onClose={closeDetailModal}
        />
      )}
    </div>
  );
}
