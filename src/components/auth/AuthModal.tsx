import { motion } from 'motion/react';
import { X, ShieldAlert, LogIn, User, Play, ChevronRight } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const setAuth = useAppStore((state) => state.setAuth);
  const { login, enableGuestMode } = useAuth();

  if (!isOpen) return null;

  const handleGoogleSignIn = () => {
    login();
    onSuccess();
    onClose();
  };

  const handleGuestMode = () => {
    enableGuestMode();
    onSuccess();
    onClose();
  };

  const handleDemoMode = () => {
    setAuth('demo');
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-teal-900/80 p-6 z-10 text-slate-900 dark:text-slate-100 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-lg md:text-xl font-bold text-teal-950 dark:text-teal-50">
            Welcome! How would you like to proceed?
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] mx-auto">
            Choose your preferred session mode to explore and analyze sequences.
          </p>
        </div>

        <div className="space-y-4">
          {/* OPTION A: Sign in with Google */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full relative flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all group duration-200 text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.99 5.99 0 0 1 8 12.5a5.99 5.99 0 0 1 5.991-6.015c1.533 0 2.93.576 3.996 1.514l3.124-3.124C19.23 3.097 16.784 2 13.991 2 8.163 2 3.4 6.702 3.4 12.5s4.763 10.5 10.591 10.5c5.362 0 9.875-3.834 9.875-10.5 0-.671-.06-1.285-.16-1.785H12.24Z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-teal-950 dark:text-teal-50 flex items-center gap-1.5">
                  Sign in with Google
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Save projects directly to Google Cloud workspace storage.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* OPTION B: Continue as Guest */}
          <button
            onClick={handleGuestMode}
            className="w-full relative flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all group duration-200 text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                <User className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs md:text-sm font-bold text-teal-950 dark:text-teal-50">
                  Continue as Guest
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Local browser storage limit. Data will be saved on your device.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* OPTION C: Try Demo */}
          <button
            onClick={handleDemoMode}
            className="w-full relative flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-905 border border-slate-200 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:shadow-xs transition-all group duration-200 text-left cursor-pointer"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Play className="w-4.5 h-4.5 fill-current" />
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-bold text-teal-950 dark:text-teal-50">
                  Try Demo Mode
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Load curated Javan Rusa dataset directly into read-only exploration.
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Warning Badge for Guest Mode */}
        <div className="mt-5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/60 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 dark:text-amber-350 leading-relaxed font-semibold">
            Guest mode stores data locally in your browser. Data may be lost if you clear browser storage.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
