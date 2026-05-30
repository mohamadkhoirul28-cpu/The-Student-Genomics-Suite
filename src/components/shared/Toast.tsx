import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

export default function Toast() {
  const { toast, hideToast } = useAppStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none flex flex-col items-end gap-2 max-w-sm w-full">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg w-full ${
            isSuccess
              ? 'bg-teal-50 border-teal-200 dark:bg-slate-900 dark:border-teal-900/60 text-teal-900 dark:text-teal-150'
              : 'bg-rose-50 border-rose-200 dark:bg-slate-900 dark:border-rose-950/65 text-rose-900 dark:text-rose-150'
          }`}
          id="toast-notification-banner"
          role="alert"
        >
          <div className="shrink-0 mt-0.5">
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold leading-none tracking-wide uppercase subpixel-antialiased">
              {isSuccess ? 'Success' : 'Error Occurred'}
            </h4>
            <p className="text-xs mt-1.5 font-medium leading-relaxed dark:text-slate-300">
              {toast.message}
            </p>
          </div>

          <button
            onClick={hideToast}
            className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
