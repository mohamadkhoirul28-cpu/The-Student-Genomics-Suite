import { useState } from 'react';
import { motion } from 'motion/react';
import { Compass, Dna, GitBranch, Globe, ArrowRight, ShieldCheck, Github } from 'lucide-react';
import FeatureCard from './FeatureCard';
import HowItWorks from './HowItWorks';
import AuthModal from '../auth/AuthModal';
import { useAppStore } from '../../stores/appStore';
import { useTheme } from '../../context/ThemeContext';

interface LandingPageProps {
  onStartDemo: () => void;
  onAuthSuccess: () => void;
}

export default function LandingPage({ onStartDemo, onAuthSuccess }: LandingPageProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const setAuth = useAppStore((state) => state.setAuth);

  const handleTryDemo = () => {
    setAuth('demo');
    onStartDemo();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* 1. Landing Top Bar */}
      <header className="h-16 w-full flex items-center justify-between px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-md bg-teal-500 text-white">
            <Compass className="w-5 h-5" />
          </div>
          <span className="font-sans font-bold text-sm tracking-tight text-teal-900 dark:text-teal-50">
            The Student Genomics Suite
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 dark:bg-teal-400 dark:hover:bg-teal-500 text-white dark:text-slate-900 text-xs font-bold rounded-lg transition-all duration-300 shadow-xs cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12 md:py-20 md:px-8 space-y-16">
        
        {/* Hero Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Hero Left Info */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold text-teal-950 dark:text-teal-50 font-sans tracking-tight leading-none">
              The Student Genomics Suite
            </h1>
            
            <p className="text-xl text-teal-700 dark:text-teal-300 mt-4 max-w-2xl mx-auto lg:mx-0 font-medium">
              Educational bioinformatics workflow assistant for Indonesian biology students.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleTryDemo}
                className="w-full sm:w-auto px-6 py-3 border border-slate-300 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-500 text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 font-bold text-sm rounded-xl transition-all cursor-pointer bg-white/20 hover:bg-white dark:hover:bg-slate-800"
              >
                Try Demo
              </button>
            </div>
          </div>

          {/* Hero Right Visual Column */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: 'linear' }}
              className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center bg-gradient-to-tr from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-teal-950 rounded-full border border-slate-200/50 dark:border-teal-900/40 p-4"
            >
              <Dna className="w-32 h-32 text-teal-500 dark:text-teal-400 opacity-90" />
              <div className="absolute top-8 left-8 w-6 h-6 rounded-full bg-teal-200/60 dark:bg-teal-900 animate-pulse" />
              <div className="absolute bottom-8 right-8 w-4 h-4 rounded-full bg-emerald-300 dark:bg-emerald-850 animate-pulse" />
            </motion.div>
          </div>

        </div>

        {/* 3. Feature Preview Block */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <FeatureCard
            title="Sequence Analysis"
            icon={Dna}
            description="Upload FASTA, AB1, or SEQ files. Auto-trim, clean, and validate."
          />
          <FeatureCard
            title="Phylogenetic Trees"
            icon={GitBranch}
            description="Build Neighbor-Joining trees with bootstrap support. Interactive visualization."
          />
          <FeatureCard
            title="NCBI Integration"
            icon={Globe}
            description="BLAST search and fetch reference sequences directly from NCBI."
          />
        </div>

        {/* 4. How It Works Section */}
        <HowItWorks />

      </div>

      {/* 5. Footer */}
      <footer className="py-8 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 text-center space-y-1.5 transition-colors duration-300 mt-auto shrink-0">
        <p className="text-[11px] text-slate-400">
          &copy; 2026 The Student Genomics Suite. All rights reserved.
        </p>
      </footer>

      {/* Auth Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={onAuthSuccess}
      />
    </div>
  );
}
