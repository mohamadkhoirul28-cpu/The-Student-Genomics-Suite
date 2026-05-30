import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import WelcomeBanner from './components/dashboard/WelcomeBanner';
import StatCard from './components/dashboard/StatCard';
import FileDropzone from './components/upload/FileDropzone';
import FileList from './components/upload/FileList';
import DemoSelector from './components/upload/DemoSelector';
import SequenceTable from './components/sequences/SequenceTable';
import SequenceCleaner from './components/sequences/SequenceCleaner';
import AnalysisDashboard from './components/analysis/AnalysisDashboard';
import NCBITools from './components/ncbi/NCBITools';
import ReportsPage from './components/reports/ReportsPage';
import ProfilePage from './components/profile/ProfilePage';
import LandingPage from './components/landing/LandingPage';
import { useAppStore } from './stores/appStore';
import { demoDatasets } from './data/demoDatasets';
import { parseFasta, parseSeqOrTxt, parseAb1 } from './utils/sequenceParser';
import Toast from './components/shared/Toast';
import ErrorBoundary from './components/shared/ErrorBoundary';
import EmptyState from './components/shared/EmptyState';

import { GeneticSequence, UploadedFile, ViewType, SessionActivity } from './types';
import { 
  Users, 
  Dna, 
  FileText, 
  ChevronRight, 
  Clock, 
  Database
} from 'lucide-react';

export function MainAppContent() {
  const { 
    authType, 
    isDemoMode, 
    sequences: loadedSequences, 
    addSequences, 
    loadDemoDataset, 
    clearAllData,
    showToast,
    exitDemoMode
  } = useAppStore();

  const { user: authUser, isAuthenticated, isGuestMode } = useAuth();
  const setAuth = useAppStore(state => state.setAuth);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      setAuth('google', {
        name: authUser.name,
        email: authUser.email,
        avatar: authUser.picture
      });
    } else if (isGuestMode) {
      const currentAuth = useAppStore.getState().authType;
      if (currentAuth !== 'demo') {
        setAuth('guest');
      }
    } else {
      setAuth(null);
    }
  }, [isAuthenticated, authUser, isGuestMode, setAuth]);
  
  const location = useLocation();
  const navigate = useNavigate();

  const getViewFromPath = (path: string): ViewType => {
    if (path.startsWith('/app/upload')) return 'upload';
    if (path.startsWith('/app/sequences')) return 'sequences';
    if (path.startsWith('/app/analysis')) return 'analysis';
    if (path.startsWith('/app/ncbi')) return 'ncbi';
    if (path.startsWith('/app/report')) return 'report';
    if (path.startsWith('/app/profile') || path.startsWith('/app/settings')) return 'settings';
    return 'home';
  };

  const activeView = getViewFromPath(location.pathname);

  const setActiveView = (view: ViewType) => {
    if (view === 'settings') {
      navigate('/app/profile');
    } else if (view === 'home') {
      navigate('/app');
    } else {
      navigate(`/app/${view}`);
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedDemoId, setSelectedDemoId] = useState<string | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleanerOpen, setCleanerOpen] = useState(false);
  
  // Recent Session Activity Log list
  const [activities, setActivities] = useState<SessionActivity[]>([
    { id: '1', description: 'Student Genomics Suite initialized.', timestamp: 'Just now', type: 'upload' }
  ]);

  // Global cross-tab redirection listener
  const { viewRedirect, setViewRedirect } = useAppStore();
  useEffect(() => {
    if (viewRedirect) {
      setActiveView(viewRedirect as any);
      setViewRedirect(null);
    }
  }, [viewRedirect, setViewRedirect]);

  // Log a new session activity
  const addActivity = (description: string, type: 'upload' | 'analysis' | 'blast' | 'report') => {
    const newAct: SessionActivity = {
      id: Math.random().toString(),
      description,
      timestamp: 'Just now',
      type
    };
    setActivities(prev => [newAct, ...prev.slice(0, 9)]);
  };

  // Synchronize session log and uploaded file lists when mode/realm shifts
  useEffect(() => {
    if (authType === 'demo') {
      setUploadedFiles([]);
      const defaultDemo = demoDatasets.find(d => d.id === 'rusa-timorensis') || demoDatasets[0];
      setSelectedDemoId(defaultDemo.id);
      setActivities([
        { id: Math.random().toString(), description: `Demo dataset loaded: ${defaultDemo.name}`, timestamp: 'Just now', type: 'upload' }
      ]);
    } else if (authType === 'guest' || authType === 'google') {
      setUploadedFiles([]);
      setSelectedDemoId(undefined);
      setActivities([
        { id: Math.random().toString(), description: 'Workspace ready. Upload data to begin.', timestamp: 'Just now', type: 'upload' }
      ]);
    } else if (authType === null) {
      // Clear data when signed out
      setUploadedFiles([]);
      setSelectedDemoId(undefined);
    }
  }, [authType]);

  // No auto-redirects here - routing is handled declaratively in the return block

  // 1. Simulates realistic upload speed for multiple files
  const handleFilesSelected = (newFiles: File[]) => {
    if (isDemoMode) return; // Prevent uploading in read-only demo mode
    
    // Stop demo use if client uploads new files
    setSelectedDemoId(undefined);

    const mappedFiles: UploadedFile[] = newFiles.map(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      let format = 'FASTA';
      if (ext === '.ab1') format = 'AB1';
      else if (ext === '.seq') format = 'SEQ';
      else if (ext === '.txt') format = 'TXT';

      return {
        id: Math.random().toString(),
        name: file.name,
        size: file.size,
        type: format,
        progress: 0,
        status: 'uploading'
      } as UploadedFile;
    });

    setUploadedFiles(prev => [...prev, ...mappedFiles]);

    // An animate event helper
    addActivity(`Uploaded ${newFiles[0]?.name || 'dataset'} — ${newFiles.length} sequences`, 'upload');

    // Animate each file's progress bar independently then real-time parse
    mappedFiles.forEach((mapped, index) => {
      const targetFile = newFiles[index];

      // File limit filter
      if (targetFile.size > 5 * 1024 * 1024) {
        setUploadedFiles(current => 
          current.map(f => f.id === mapped.id ? { 
            ...f, 
            progress: 100, 
            status: 'failed', 
            errorMessage: 'File exceeds 5MB limit. Consider splitting or compressing.' 
          } : f)
        );
        return;
      }

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 20) + 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Switch to parsing
          setUploadedFiles(current => 
            current.map(f => f.id === mapped.id ? { ...f, progress: 100, status: 'parsing' } : f)
          );

          // Read and parse
          const reader = new FileReader();
          const ext = '.' + targetFile.name.split('.').pop()?.toLowerCase();

          reader.onload = (e) => {
            try {
              const result = e.target?.result;
              if (!result) {
                throw new Error('Could not read file content');
              }

              let parsedSeqs: GeneticSequence[] = [];
              if (ext === '.ab1') {
                const seq = parseAb1(result as ArrayBuffer, targetFile.name);
                parsedSeqs = [seq];
              } else if (ext === '.fasta' || ext === '.fa') {
                parsedSeqs = parseFasta(result as string, targetFile.name);
              } else {
                parsedSeqs = parseSeqOrTxt(result as string, targetFile.name);
              }

              setUploadedFiles(current => 
                current.map(f => f.id === mapped.id ? { 
                  ...f, 
                  status: 'ready', 
                  sequenceCount: parsedSeqs.length,
                  parsedSequences: parsedSeqs 
                } as any : f)
              );

            } catch (error: any) {
              const errMsg = error?.message || 'Invalid sequence format.';
              setUploadedFiles(current => 
                current.map(f => f.id === mapped.id ? { 
                  ...f, 
                  status: 'failed', 
                  errorMessage: errMsg 
                } : f)
              );
            }
          };

          reader.onerror = () => {
            setUploadedFiles(current => 
              current.map(f => f.id === mapped.id ? { 
                ...f, 
                status: 'failed', 
                errorMessage: 'System was unable to read the file.' 
              } : f)
            );
          };

          if (ext === '.ab1') {
            reader.readAsArrayBuffer(targetFile);
          } else {
            reader.readAsText(targetFile);
          }

        } else {
          setUploadedFiles(current => 
            current.map(f => f.id === mapped.id ? { ...f, progress } : f)
          );
        }
      }, 100);
    });
  };

  // 2. Remove File Callback
  const handleRemoveFile = (id: string) => {
    if (isDemoMode) return;
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // 3. Process files and extract the real genomics sequences
  const handleProcessFiles = () => {
    if (isDemoMode) return;
    setIsProcessing(true);
    addActivity('Trimming and sorting Sanger sequences...', 'upload');

    setTimeout(() => {
      const allExtracted: GeneticSequence[] = [];
      uploadedFiles.forEach((file: any) => {
        if ((file.status === 'ready' || file.status === 'completed') && file.parsedSequences) {
          allExtracted.push(...file.parsedSequences);
        }
      });

      if (allExtracted.length === 0) {
        setIsProcessing(false);
        addActivity('Failed to process sequence files: No parsed sequences ready.', 'upload');
        return;
      }

      addSequences(allExtracted);
      setIsProcessing(false);
      setUploadedFiles([]); // Clear list
      addActivity(`Extracted ${allExtracted.length} high-confidence sequence reads.`, 'upload');
      setActiveView('sequences'); // Switch view
    }, 1200);
  };

  // 4. Select Pre-built Curated Demo Dataset
  const handleSelectDemoDataset = (dataset: any) => {
    setUploadedFiles([]); // Clear any staging upload
    setSelectedDemoId(dataset.id);
    loadDemoDataset(dataset.id);
    
    addActivity(`Switched active research track to: ${dataset.name}`, 'upload');
    setActiveView('sequences'); // Switch view
  };

  // 5. Clear All Active Data
  const handleClearSession = () => {
    setUploadedFiles([]);
    clearAllData();
    setSelectedDemoId(undefined);
    addActivity('Active session cache and sequencing buffers cleared.', 'upload');
    setActiveView('home');
  };

  return (
    <Routes>
      <Route path="/" element={
        <LandingPage 
          onStartDemo={() => navigate('/app')} 
          onAuthSuccess={() => navigate('/app')} 
        />
      } />
      
      <Route path="/app/*" element={
        authType === null ? (
          <Navigate to="/" replace />
        ) : (
          <Layout 
            activeView={activeView} 
            setActiveView={setActiveView} 
            sampleCount={loadedSequences.length}
          >
      
      {/* 1. HOME/DASHBOARD TAB VIEW */}
      {activeView === 'home' && (
        <div className="space-y-8">
          <WelcomeBanner onStartAnalysis={() => setActiveView(isDemoMode ? 'sequences' : 'upload')} />
          
          {/* Stats Metrics widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title={isDemoMode ? "Demo Samples" : "Samples Uploaded"} 
              value={loadedSequences.length.toString()} 
              icon={Users} 
              percentage={isDemoMode ? "Preloaded" : (loadedSequences.length > 0 ? "Active" : undefined)}
            />
            <StatCard 
              title={isDemoMode ? "Demo Sequences" : "Active Sequences"} 
              value={loadedSequences.length.toString()} 
              icon={Dna} 
              colorClass="text-amber-500 bg-amber-50 dark:bg-amber-950/40"
              percentage={isDemoMode ? "Sanger DNA" : (loadedSequences.length > 0 ? "Workspace" : undefined)}
            />
            <StatCard 
              title={isDemoMode ? "Demo Report" : "Report Drafts"} 
              value={loadedSequences.length > 0 ? (isDemoMode ? "Demo Ready" : "Ready") : "Empty"} 
              icon={FileText} 
              colorClass="text-blue-500 bg-blue-50 dark:bg-blue-950/40"
              percentage={isDemoMode ? "Academic" : (loadedSequences.length > 0 ? "Workspace" : undefined)}
            />
          </div>

          {/* Activity Log and Demo Fast-tracker split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left side: Recent Activity */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-teal-900/60 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-teal-950 dark:text-teal-50 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Active Session Activity Log</span>
              </h3>
              
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="flex items-start space-x-3 text-xs py-2 border-b border-slate-100 dark:border-teal-950/45 last:border-0">
                    <div className="p-1 px-1.5 rounded-sm bg-slate-50 dark:bg-slate-900 text-teal-700 dark:text-teal-300 font-mono text-[9px] font-bold uppercase mt-0.5">
                      {act.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-750 dark:text-slate-200">
                        {act.description}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                      {act.timestamp}
                    </span>
                  </div>
                ))}
                
                {activities.length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">
                    Workspace is empty. Start by uploading sequence reads or loading academic demo data.
                  </p>
                )}
              </div>
            </div>

            {/* Right side: Academic guidance context */}
            <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-teal-900/60 space-y-4">
              <h3 className="text-sm font-bold text-teal-950 dark:text-teal-50 flex items-center space-x-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span>Why Choose This Platform?</span>
              </h3>
              <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed">
                The Student Genomics Suite bridges the gap between complex command-line bioinformatics algorithms and easy-to-use, highly visual web interfaces.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-center space-x-2 text-xs font-semibold text-teal-950 dark:text-teal-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>Instant Hd, π, and Polymorphic sites estimation</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-teal-950 dark:text-teal-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Interactive Neighbor-Joining phylogenetic trees</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-semibold text-teal-955 dark:text-teal-200">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>CORS-safe direct NCBI BLAST proxy wrapper</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-150 dark:border-slate-750">
                {isDemoMode ? (
                  <button
                    onClick={() => setActiveView('analysis')}
                    className="w-full flex items-center justify-between py-2 px-3 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 dark:hover:bg-teal-950/40 border border-teal-200 dark:border-teal-900 rounded-lg transition-all text-xs font-bold text-teal-700 dark:text-teal-300 cursor-pointer"
                  >
                    <span>Explore Analysis</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : loadedSequences.length === 0 ? (
                  <button
                    onClick={() => setActiveView('upload')}
                    className="w-full flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-teal-900 rounded-lg hover:bg-teal-550 hover:bg-teal-500 hover:text-white transition-all text-xs font-bold text-teal-705 dark:text-teal-300 cursor-pointer"
                  >
                    <span>Upload Data</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveView('analysis')}
                    className="w-full flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-teal-900 rounded-lg hover:bg-teal-550 hover:bg-teal-500 hover:text-white transition-all text-xs font-bold text-teal-700 dark:text-teal-300 cursor-pointer"
                  >
                    <span>Run Analysis</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 2. UPLOAD VIEW TAB */}
      {activeView === 'upload' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-teal-950 dark:text-teal-50">
              Upload Sanger Files & Genomic Sequences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Upload raw .fasta files, or explore with a pre-loaded Javanese or bacterial research dataset below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-4">
              {isDemoMode ? (
                <div className="p-8 border-2 border-dashed border-slate-350 dark:border-teal-900/50 rounded-xl bg-slate-50 dark:bg-slate-900/30 text-center">
                  <p className="text-slate-500 dark:text-slate-400 mb-2 font-semibold">Demo data is active</p>
                  <button 
                    onClick={() => {
                      exitDemoMode();
                      showToast('Welcome to your workspace. Upload your own data to begin.', 'success');
                      addActivity('Switched from Demo Mode to Workspace.', 'upload');
                    }}
                    className="text-teal-600 dark:text-teal-400 font-bold hover:underline cursor-pointer"
                  >
                    Exit Demo → Start Your Workspace
                  </button>
                </div>
              ) : (
                <>
                  <FileDropzone onFilesSelected={handleFilesSelected} />
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-teal-900/60 rounded-xl gap-4">
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-teal-950 dark:text-teal-50">
                        Need instant sandbox data for testing?
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Bypass raw file upload to test all analytical tools (Diversity, MSA, SNPs, Trees, Blast) immediately.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        console.log('[Upload] Force-loading demo dataset');
                        loadDemoDataset('rusa-timorensis');
                        addActivity('Demo Javan Rusa mtDNA dataset loaded directly.', 'upload');
                        showToast('✓ Loaded Javan Rusa sample dataset successfully (Skip upload)', 'success');
                        setActiveView('sequences');
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-teal-500 hover:bg-teal-600 font-bold text-xs text-white rounded-lg transition-colors shadow-2xs cursor-pointer text-center inline-flex items-center justify-center space-x-1.5 shrink-0"
                      id="btn-force-demo"
                    >
                      <span>⚡ Load Demo Data (Skip Upload)</span>
                    </button>
                  </div>
                </>
              )}
            </div>
            
            <FileList 
              files={uploadedFiles}
              onRemove={handleRemoveFile}
              onProcess={handleProcessFiles}
              isProcessing={isProcessing}
            />

            <DemoSelector 
              onSelectDataset={handleSelectDemoDataset}
              selectedId={selectedDemoId}
            />
          </div>
        </div>
      )}

      {/* 3. SEQUENCES TAB VIEW */}
      {activeView === 'sequences' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-teal-950 dark:text-teal-50">
                Genetic Sequence Explorer ({loadedSequences.length} Samples)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect structured DNA residues, perform high-speed quality trimming, and execute individual/bulk FASTA downloads.
              </p>
            </div>
            
            {loadedSequences.length > 0 && (
              <button
                onClick={() => setCleanerOpen(true)}
                className="px-4 py-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-900/60 rounded-lg cursor-pointer transition-colors shadow-3xs inline-flex items-center space-x-1.5"
                id="btn-open-cleaner"
              >
                <span>🧹 Sensi-Cleaner / Trimmer</span>
              </button>
            )}
          </div>

          {loadedSequences.length > 0 ? (
            <>
              <SequenceTable onOpenCleaner={() => setCleanerOpen(true)} />
              
              <SequenceCleaner 
                isOpen={cleanerOpen} 
                onClose={() => setCleanerOpen(false)} 
              />
            </>
          ) : (
            <EmptyState
              title="No sequences yet"
              description="No Sanger sequence strands exist in your active workspace memory. Return home to load our pre-loaded Indonesian specimen sets or drag in your custom sequence files."
              actionLabel="Return Home to Upload"
              onAction={() => setActiveView('home')}
              icon={<Dna className="w-8 h-8 text-teal-500" />}
            />
          )}
        </div>
      )}

      {/* 4. STATISTICS & GENETIC DIVERSITY TAB VIEW */}
      {activeView === 'analysis' && (
        <AnalysisDashboard />
      )}

      {/* 5. NCBI BLAST SEARCH TAB VIEW */}
      {activeView === 'ncbi' && (
        <NCBITools />
      )}

      {/* 6. EXPANDED AI REPORTS SUMMARY TAB VIEW */}
      {activeView === 'report' && (
        <ReportsPage />
      )}

      {/* 7. SETTINGS AND IDENTITY TAB VIEW */}
      {activeView === 'settings' && (
        <ProfilePage 
          onClearSession={handleClearSession}
          hasData={loadedSequences.length > 0}
        />
      )}

          </Layout>
        )
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <MainAppContent />
          <Toast />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
