import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside genomics app:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-teal-50/50 dark:bg-slate-900 p-6 font-sans text-slate-950 dark:text-slate-50">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-teal-900/40 shadow-xl max-w-md text-center space-y-5 animate-scaleIn">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-sm font-bold text-teal-950 dark:text-teal-50">
                Something went wrong
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                An unexpected crash occurred inside your sequence workspace browser memory.
              </p>
              {this.state.error && (
                <pre className="p-3 bg-red-50/50 dark:bg-slate-900 rounded-lg text-[10px] text-red-650 dark:text-red-400 font-mono text-left max-h-32 overflow-auto border border-red-100/30">
                  {this.state.error.message}
                </pre>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Full Reset Sequence Memory & Restart</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
