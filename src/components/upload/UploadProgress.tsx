import { motion } from 'motion/react';
import { Loader2, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  status: 'idle' | 'reading' | 'uploading' | 'parsing' | 'success' | 'error';
  errorMessage?: string | null;
  sequenceCount?: number;
}

export default function UploadProgress({
  fileName,
  progress,
  status,
  errorMessage,
  sequenceCount
}: UploadProgressProps) {
  if (status === 'idle') return null;

  const isError = status === 'error';
  const isSuccess = status === 'success';

  // Return corresponding status texts in Indonesian/English as per context log
  let statusText = 'Processing...';
  if (status === 'reading') {
    statusText = `Reading ${fileName}...`;
  } else if (status === 'uploading') {
    statusText = `Uploading ${fileName}...`;
  } else if (status === 'parsing') {
    statusText = `Parsing sequences...`;
  } else if (status === 'success') {
    statusText = `✓ Successfully loaded ${sequenceCount || 0} sequence${(sequenceCount || 0) > 1 ? 's' : ''}!`;
  } else if (status === 'error') {
    statusText = `✗ Parse failure: ${errorMessage || 'Unknown error'}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/60 p-5 shadow-sm space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg ${
            isError 
              ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500' 
              : isSuccess 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500' 
                : 'bg-teal-50 dark:bg-teal-950/20 text-teal-500'
          }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isError ? (
              <AlertCircle className="w-5 h-5 animate-bounce" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
              Genomic Extractor
            </h4>
            <p className="text-sm font-semibold text-teal-950 dark:text-teal-50 mt-1 truncate max-w-xs sm:max-w-md">
              {fileName}
            </p>
          </div>
        </div>
        
        {!isError && !isSuccess && (
          <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 px-2.5 py-1 rounded-full">
            {progress}%
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className={`font-semibold ${
            isError 
              ? 'text-rose-600 dark:text-rose-400' 
              : isSuccess 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-teal-700 dark:text-teal-300'
          }`}>
            {statusText}
          </span>
        </div>

        {/* Outer Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isError 
                ? 'bg-rose-500' 
                : isSuccess 
                  ? 'bg-emerald-500' 
                  : 'bg-teal-500'
            }`}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'tween', ease: 'easeInOut' }}
          />
        </div>
      </div>

      {isError && (
        <div className="text-[11px] font-medium leading-relaxed p-3 rounded-lg bg-rose-50/50 dark:bg-rose-955/10 border border-rose-100 dark:border-rose-950 text-rose-700 dark:text-rose-455">
          <strong>Debugging Output:</strong> {errorMessage}
        </div>
      )}
    </motion.div>
  );
}
