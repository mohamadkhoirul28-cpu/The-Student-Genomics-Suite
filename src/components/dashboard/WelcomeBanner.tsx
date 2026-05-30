import { Play, BookOpen } from 'lucide-react';

interface WelcomeBannerProps {
  onStartAnalysis: () => void;
}

export default function WelcomeBanner({ onStartAnalysis }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden p-8 md:p-10 rounded-xl border border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50 to-teal-100/60 dark:from-teal-950/40 dark:to-teal-900/10 shadow-xs">
      {/* Background DNA Motif SVG */}
      <div className="absolute right-0 bottom-0 pointer-events-none opacity-5 dark:opacity-10 translate-x-12 translate-y-12">
        <svg width="240" height="240" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 20 Q 25 10, 40 20 T 70 20 T 100 20" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3"/>
          <path d="M10 40 Q 25 30, 40 40 T 70 40 T 100 40" stroke="currentColor" strokeWidth="2"/>
          <path d="M10 60 Q 25 50, 40 60 T 70 60 T 100 60" stroke="currentColor" strokeWidth="2" strokeDasharray="1 1"/>
          <path d="M25 10 L 25 40 M 55 10 L 55 40 M 85 10 L 85 40" stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl space-y-4 text-slate-900 dark:text-slate-100">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-200/60 dark:bg-teal-905/70 text-teal-955 dark:text-teal-200">
          <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
          <span>Academic Edition v1.0.0</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-teal-950 dark:text-teal-50">
          Welcome to <span className="text-teal-600 dark:text-teal-400">The Student Genomics Suite</span>
        </h1>
        
        <p className="text-base text-teal-900/85 dark:text-teal-200 leading-relaxed max-w-3xl text-sans">
          Educational bioinformatics workflow assistant for Indonesian biology students. 
          Upload Sanger sequences (FASTA/AB1), run MSA alignment, calculate genetic diversity (Hd/π), 
          build interactive phylogenetic trees, perform real NCBI BLAST, and generate AI-powered 
          biological insights via Google Gemini. Replaces 8+ fragmented tools with one unified platform.
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={onStartAnalysis}
            className="inline-flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 active:bg-teal-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Execute Analysis</span>
          </button>
          
          <button
            onClick={() => window.open('https://github.com/mohamadkhoirul28', '_blank')}
            className="inline-flex items-center space-x-2 border border-slate-205 dark:border-teal-700 bg-white/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 text-teal-800 dark:text-teal-200 font-bold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-teal-550" />
            <span>Genomics Guide</span>
          </button>
        </div>
      </div>
    </div>
  );
}
