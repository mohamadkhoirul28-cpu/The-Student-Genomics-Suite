import React from 'react';

interface ConservationBarProps {
  scores: number[];
  visibleRange?: [number, number]; // [startIdx, endIdx] for synchronized scrolling / viewport rendering
  charWidth?: number;              // width in pixels of a single alignment base column (e.g. 18px), for precision scroll matching
}

export default function ConservationBar({ scores, visibleRange, charWidth = 20 }: ConservationBarProps) {
  if (!scores || scores.length === 0) return null;

  // Let's either draw a full-width dense representation or a scrollable itemized bar representation
  const start = visibleRange ? visibleRange[0] : 0;
  const end = visibleRange ? Math.min(scores.length, visibleRange[1]) : scores.length;
  
  const displayScores = scores.slice(start, end);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-teal-900/40 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h5 className="text-[11px] font-bold text-teal-950 dark:text-teal-200 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
          Conservation Profile ({scores.length} sites)
        </h5>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          Consensus match % per column
        </span>
      </div>

      {visibleRange ? (
        // Detailed scroll-matching column alignment bar graph
        <div className="overflow-x-auto select-none no-scrollbar">
          <div 
            className="flex items-end h-16" 
            style={{ width: `${scores.length * charWidth}px` }}
          >
            {scores.map((score, idx) => {
              // Color based on conservation %
              let barColor = 'bg-teal-500/80';
              if (score >= 90) barColor = 'bg-teal-600 dark:bg-teal-400';
              else if (score >= 70) barColor = 'bg-teal-400 dark:bg-teal-500/70';
              else if (score >= 40) barColor = 'bg-teal-300 dark:bg-teal-600/40';
              else barColor = 'bg-slate-300 dark:bg-slate-700';

              return (
                <div 
                  key={idx}
                  className="flex flex-col items-center justify-end h-full group relative"
                  style={{ width: `${charWidth}px` }}
                >
                  <div 
                    className={`w-4/5 rounded-t-sm transition-all duration-300 ${barColor}`} 
                    style={{ height: `${score}%` }} 
                  />
                  <div className="w-px h-1 bg-slate-300 dark:bg-slate-800" />
                  
                  {/* Absolute positioning of tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block z-20 bg-slate-900 text-white rounded text-[9px] py-0.5 px-1.5 whitespace-nowrap font-mono shadow-md">
                    Pos {idx + 1}: {score}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        // Full overview dense SVG graph
        <div className="w-full h-14 relative mt-1 bg-slate-100 dark:bg-slate-950 rounded border border-slate-200/50 dark:border-teal-950/50">
          <svg className="w-full h-full" preserveAspectRatio="none" viewBox={`0 0 ${scores.length} 100`}>
            <defs>
              <linearGradient id="conservationGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.85" />
              </linearGradient>
            </defs>
            <path
              d={`M0 100 ${scores.map((score, idx) => `L${idx} ${100 - score}`).join(' ')} L${scores.length} 100 Z`}
              fill="url(#conservationGrad)"
              className="transition-all duration-350"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
