import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { testGeminiConnection } from '../../services/geminiService';
import { Database, Sparkles, Eye, EyeOff, Radio, Check, CheckCircle, XCircle, AlertCircle, RefreshCw, Key } from 'lucide-react';

export default function APISettings() {
  const {
    geminiApiKey,
    setGeminiApiKey,
    useRealAI,
    setUseRealAI,
    useRealAPIs,
    ncbiBackendAvailable,
    setNcbiBackendAvailable,
    setUseRealAPIs,
    apiStatus,
    toggleRealAPIs,
    testAPIConnection
  } = useAppStore();

  const [inputKey, setInputKey] = useState(geminiApiKey || '');
  const [geminiTestStatus, setGeminiTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [showKey, setShowKey] = useState(false);
  
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error' | 'mock'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [ncbiStatus, setNcbiStatus] = useState<'connected' | 'disconnected'>(
    ncbiBackendAvailable ? 'connected' : 'disconnected'
  );

  const useRealNCBI = useRealAPIs;

  const handleTest = async () => {
    if (!inputKey.trim()) return;
    
    setGeminiTestStatus('testing');
    const isValid = await testGeminiConnection(inputKey.trim());
    setGeminiTestStatus(isValid ? 'success' : 'error');
    
    if (isValid) {
      setGeminiApiKey(inputKey.trim());
      setUseRealAI(true);
      useAppStore.getState().showToast('🟢 Direct Gemini connection succeeded. Real AI activated.', 'success');
    } else {
      useAppStore.getState().showToast('🔴 Connection test failed. Check API key format.', 'error');
    }
  };

  const handleClear = () => {
    setInputKey('');
    setGeminiApiKey(null);
    setUseRealAI(false);
    setGeminiTestStatus('idle');
    useAppStore.getState().showToast('Saved Gemini credentials cleared.', 'success');
  };

  const handleTestNCBI = async () => {
    // Check if Live API Execution is enabled
    if (!useRealNCBI) {
      setTestStatus('mock');
      setTestMessage('Demo Mode active. Toggle "Live API Execution" ON to connect to real NCBI.');
      return;
    }
    
    // If enabled, proceed with real test
    setTestStatus('testing');
    setTestMessage('Testing connection to NCBI proxy...');
    
    try {
      const backendUrl = (import.meta as any).env?.VITE_BACKEND_URL;
      if (!backendUrl || backendUrl === 'http://localhost:8080') {
        throw new Error('Backend URL not configured');
      }
      
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setTestStatus('success');
        setTestMessage('✅ NCBI proxy connected — real BLAST available');
        setNcbiStatus('connected');
        setNcbiBackendAvailable(true);
      } else {
        throw new Error(`Backend responded with status ${response.status}`);
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`❌ Cannot reach NCBI proxy: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setNcbiStatus('disconnected');
      setNcbiBackendAvailable(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Gemini API Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-teal-200 dark:border-teal-900/60 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-teal-900/40 pb-3">
          <Sparkles className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-bold text-teal-950 dark:text-teal-50 text-sm">AI Configuration</h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
          Configure a real Gemini API Key here to enable genuine LLM sequence reasoning. Direct browser execution ensures fast, CORS-compliant, and secure analyses.
        </p>

        <div className="space-y-4">
          {/* API Key Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Gemini API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 max-w-md">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste your API key here (AIzaSy...)"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-teal-950 rounded-lg text-xs font-mono bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden"
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-2 ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleTest}
                disabled={!inputKey.trim() || geminiTestStatus === 'testing'}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-lg text-xs disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center min-w-[70px]"
              >
                {geminiTestStatus === 'testing' ? 'Testing...' : 'Test'}
              </button>
            </div>
            <p className="text-[10px] text-slate-450 dark:text-slate-500">
              Generate a free key instantly at{' '}
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* Connection Status Notification */}
          {geminiTestStatus !== 'idle' && (
            <div className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs leading-normal animate-fadeIn ${
              geminiTestStatus === 'success' 
                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-150 dark:border-green-900/35' 
                : geminiTestStatus === 'error' 
                  ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-150 dark:border-red-900/35' 
                  : 'bg-slate-55 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-450 border-slate-200 dark:border-teal-950'
            }`}>
              {geminiTestStatus === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
              {geminiTestStatus === 'error' && <XCircle className="w-4 h-4 shrink-0" />}
              {geminiTestStatus === 'testing' && <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />}
              <span>
                {geminiTestStatus === 'success' && 'Gemini AI connected! Real scientific insights enabled.'}
                {geminiTestStatus === 'error' && 'Connection failed. Check your API key format or internet stability.'}
                {geminiTestStatus === 'testing' && 'Testing secure direct connection to Google Gemini endpoints...'}
              </span>
            </div>
          )}

          {/* Real AI Switch Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-teal-950">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Use Real AI</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">
                {useRealAI ? 'Generating genuine insights dynamically' : 'Using pre-loaded demo insights'}
              </p>
            </div>
            <button
              onClick={() => setUseRealAI(!useRealAI)}
              disabled={geminiTestStatus !== 'success' && !geminiApiKey}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                useRealAI ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                useRealAI ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Clear Key */}
          {geminiApiKey && (
            <button
              onClick={handleClear}
              className="text-xs text-red-650 hover:text-red-700 font-semibold cursor-pointer block hover:underline"
            >
              Clear Saved Credentials & Disable Real AI
            </button>
          )}
        </div>
      </div>

      {/* Backend Cloud Microservice Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/60 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-teal-900/40 pb-3">
          <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <h3 className="font-bold text-teal-950 dark:text-teal-50 text-sm">NCBI & Pipeline Settings</h3>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
          Toggle live pipeline execution. Local simulation allows full offline evaluation, bypassing remote server latencies.
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-teal-950">
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Live API Execution</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5">
                Connect external databases for BLAST query requests
              </p>
            </div>
            <button
              onClick={toggleRealAPIs}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                useRealAPIs ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                useRealAPIs ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {useRealAPIs && !ncbiBackendAvailable && (
            <div className="bg-red-55 dark:bg-red-950/25 border border-red-200/50 dark:border-red-900/45 rounded-xl p-3.5 mt-2 animate-fadeIn">
              <p className="text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-1.5">
                <span>⚠️</span> Cannot Enable Real NCBI Connections
              </p>
              <p className="text-red-650 dark:text-red-400 text-[11px] mt-1 leading-relaxed">
                Backend proxy is not configured or is unreachable. Real NCBI BLAST queries require a backend proxy API due to browser CORS security restrictions. Please deploy a backend proxy first, or continue using simulated Demo Mode.
              </p>
              <button 
                onClick={() => setUseRealAPIs(false)} 
                className="mt-2.5 text-[10.5px] font-bold bg-red-100 dark:bg-red-950 text-red-750 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200/40 dark:border-red-900/50 hover:bg-red-150 transition-colors cursor-pointer block"
              >
                Switch to Demo Mode
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
            Remote Pipeline Statuses
          </div>
          <button
            onClick={handleTestNCBI}
            disabled={testStatus === 'testing'}
            className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer border transition-colors ${
              !useRealNCBI 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40'
                : 'bg-teal-500 text-white hover:bg-teal-600 border-transparent shadow-sm'
            } disabled:opacity-50`}
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {testMessage && (
          <div className={`text-xs mt-2 p-2 rounded ${
            testStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200/40 dark:bg-green-950/20 dark:text-green-350' :
            testStatus === 'error' ? 'bg-red-50 text-red-700 border border-red-200/40 dark:bg-red-950/20 dark:text-red-350' :
            testStatus === 'mock' ? 'bg-amber-50 text-amber-700 border border-amber-200/40 dark:bg-amber-950/20 dark:text-amber-350' :
            'bg-slate-55 bg-slate-50 text-slate-600 border border-slate-200 dark:bg-slate-900 dark:text-slate-400'
          }`}>
            {testMessage}
          </div>
        )}

        {!useRealNCBI ? (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 rounded-lg p-3 mt-2 animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Demo Mode Active</span>
            </div>
            <p className="text-xs text-amber-600 mt-1">
              Live API Execution is OFF. BLAST results are simulated for demonstration.
              Toggle ON above to connect to real NCBI servers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-900/45 border border-slate-150 dark:border-teal-950 rounded-lg space-y-1">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                NCBI Entrez Gateway
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {useRealAPIs && ncbiBackendAvailable ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-slate-700 dark:text-slate-300">Live API</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="text-slate-550 dark:text-slate-450">Unavailable (Mock Only)</span>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-900/45 border border-slate-150 dark:border-teal-950 rounded-lg space-y-1">
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                NCBI Blast Subsystem
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {useRealAPIs && ncbiBackendAvailable ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-slate-700 dark:text-slate-300">Live API</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                    <span className="text-slate-550 dark:text-slate-450">Unavailable (Mock Only)</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Backend Configuration - Hidden from UI for production */}
        {/* The backend URL is managed via environment variables and not shown to users */}
      </div>

      {/* Info Card */}
      <div className="bg-teal-50 dark:bg-teal-950/20 rounded-xl border border-teal-200/50 dark:border-teal-900/40 p-4">
        <h4 className="font-bold text-teal-950 dark:text-teal-200 text-xs mb-1.5 flex items-center gap-1">
          <Key className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Three-Tier AI Fallback Model</span>
        </h4>
        <ul className="text-[11px] text-teal-800 dark:text-teal-300 space-y-1 list-disc list-inside leading-relaxed">
          <li><strong>Tier 1 — Real Direct AI:</strong> Connects securely from the browser directly to Gemini models (requires key).</li>
          <li><strong>Tier 2 — Connectivity validation:</strong> Verifies keys directly with a 500ms heartbeat prompt.</li>
          <li><strong>Tier 3 — Offline fallbacks:</strong> If Gemini rate-limits (429) or fails, pre-loaded genetic mock datasets step in instantly.</li>
          <li><strong>Security:</strong> Keys reside strictly in-memory inside the active browser state and are never cached to localStorage.</li>
        </ul>
      </div>
    </div>
  );
}
