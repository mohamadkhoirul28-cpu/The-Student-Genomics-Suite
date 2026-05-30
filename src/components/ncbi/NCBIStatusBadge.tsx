import React from 'react';

interface NCBIStatusBadgeProps {
  status: 'real' | 'mock' | 'error';
  message?: string;
}

export function NCBIStatusBadge({ status, message }: NCBIStatusBadgeProps) {
  const config = {
    real: { 
      icon: '🟢', 
      bg: 'bg-green-50 dark:bg-green-950/20 border-green-200/45 dark:border-green-900/35', 
      text: 'text-green-700 dark:text-green-400', 
      label: 'Live NCBI' 
    },
    mock: { 
      icon: '🟡', 
      bg: 'bg-amber-50 dark:bg-amber-950/25 border-amber-200/45 dark:border-amber-900/35', 
      text: 'text-amber-700 dark:text-amber-400', 
      label: 'Demo Mode' 
    },
    error: { 
      icon: '🔴', 
      bg: 'bg-red-50 dark:bg-red-950/25 border-red-200/45 dark:border-red-900/35', 
      text: 'text-red-700 dark:text-red-400', 
      label: 'Connection Error' 
    }
  };
  
  const { icon, bg, text, label } = config[status] || config.mock;
  
  return (
    <div className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs leading-normal animate-fadeIn ${bg} ${text}`}>
      <span className="shrink-0">{icon}</span>
      <span className="font-semibold">{label}</span>
      {message && <span className="text-[10px] opacity-75 font-mono"> - {message}</span>}
    </div>
  );
}

export default NCBIStatusBadge;
