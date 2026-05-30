import { create } from 'zustand';
import { Sequence, GeneticSequence, CleanOptions, AnalysisResult, BlastSearchState, SavedInsight, BlastResult } from '../types';
import { demoDatasets } from '../data/demoDatasets';

export type AuthType = 'google' | 'guest' | 'demo' | null;

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

interface AppState {
  // Existing state
  authType: AuthType;
  isDemoMode: boolean;
  user: UserProfile | null;
  setAuth: (type: AuthType, profile?: UserProfile | null) => void;
  updateDisplayName: (name: string) => void;
  signOut: () => void;

  // NEW: Sequence management
  sequences: GeneticSequence[];
  demoSequences: GeneticSequence[];
  userSequences: GeneticSequence[];
  activeView: 'demo' | 'workspace';
  originalSequences: GeneticSequence[] | null; // For Undo functionality
  activeSequenceId: string | null;
  activeDatasetId: string | null;
  isProcessing: boolean;

  // NEW: Analysis results state
  analysisResults: AnalysisResult | null;
  setAnalysisResults: (results: AnalysisResult | null) => void;

  // NEW: Cross-tab Report Navigation
  activeReportFocus: { focus: string; focusArea?: string } | null;
  setActiveReportFocus: (focus: { focus: string; focusArea?: string } | null) => void;
  viewRedirect: string | null;
  setViewRedirect: (view: any) => void;

  // NEW: NCBI Tools states
  blastSearch: BlastSearchState;
  setBlastSearch: (updates: Partial<BlastSearchState>) => void;
  blastHistory: BlastResult[];
  addBlastResult: (result: BlastResult) => void;
  clearBlastResults: () => void;
  deleteBlastResult: (id: string) => void;

  // NEW: Saved Insights state & actions
  savedInsights: SavedInsight[];
  addSavedInsight: (insight: SavedInsight) => void;
  removeSavedInsight: (id: string) => void;
  clearSavedInsights: () => void;

  // Actions
  getActiveSequences: () => GeneticSequence[];
  addSequences: (newSeqs: GeneticSequence[]) => void;
  addUserSequences: (newSeqs: GeneticSequence[]) => void;
  clearUserSequences: () => void;
  setActiveView: (view: 'demo' | 'workspace') => void;
  removeSequence: (id: string) => void;
  setActiveSequence: (id: string | null) => void;
  cleanSequences: (options: CleanOptions) => { beforeCount: number; afterCount: number; beforeAvgLen: number; afterAvgLen: number; totalBasesRemoved: number };
  undoCleanSequences: () => void;
  loadDemoDataset: (datasetId: string) => void;
  clearAllData: () => void;
  resetSequences: () => void;
  updateSequence: (id: string, updates: Partial<GeneticSequence>) => void;
  enterDemoMode: () => void;
  exitDemoMode: () => void;

  // Toast state and actions
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type: 'success' | 'error') => void;
  hideToast: () => void;

  // NEW: API Configuration Store (Mock ↔ Real Toggle)
  geminiApiKey: string | null;
  useRealAPIs: boolean;
  useRealAI: boolean;
  ncbiBackendAvailable: boolean;
  setNcbiBackendAvailable: (available: boolean) => void;
  setUseRealAPIs: (use: boolean) => void;
  apiStatus: {
    ncbi: 'connected' | 'disconnected' | 'mock';
    gemini: 'connected' | 'disconnected' | 'mock';
  };
  setGeminiApiKey: (key: string | null) => void;
  setUseRealAI: (use: boolean) => void;
  toggleRealAPIs: () => void;
  testAPIConnection: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Existing auth state
  authType: null,
  isDemoMode: false,
  user: null,
  activeDatasetId: null,
  demoSequences: [],
  userSequences: [],
  activeView: 'workspace',

  setAuth: (type, profile = null) => {
    if (type === 'guest') {
      const storedName = localStorage.getItem('guest_name') || 'Guest User';
      set({
        authType: 'guest',
        isDemoMode: false,
        user: { name: storedName, email: 'local-session@browser' },
        sequences: [], // Workspace starts empty
        demoSequences: [],
        userSequences: [],
        activeView: 'workspace',
        activeSequenceId: null,
        activeDatasetId: null,
        originalSequences: null
      });
    } else if (type === 'google') {
      set({
        authType: 'google',
        isDemoMode: false,
        user: profile || { name: 'Mohamad Khoirul', email: 'mohamadkhoirul28@gmail.com' },
        sequences: [], // Workspace starts empty
        demoSequences: [],
        userSequences: [],
        activeView: 'workspace',
        activeSequenceId: null,
        activeDatasetId: null,
        originalSequences: null
      });
    } else if (type === 'demo') {
      // Auto-load Javan Rusa demo data as part of entering Demo Mode
      const defaultDemo = demoDatasets.find(d => d.id === 'rusa-timorensis') || demoDatasets[0];
      const demoSeqs = defaultDemo.sequences.map(s => ({ ...s, sourceType: 'demo' as const }));
      set({
        authType: 'demo',
        isDemoMode: true,
        user: { name: 'Demo Explorer', email: 'demo@student-genomics.org' },
        demoSequences: demoSeqs,
        sequences: demoSeqs,
        activeSequenceId: defaultDemo.sequences[0]?.id || null,
        activeDatasetId: defaultDemo.id,
        activeView: 'demo',
        originalSequences: null
      });
    } else {
      set({
        authType: null,
        isDemoMode: false,
        user: null,
        sequences: [],
        demoSequences: [],
        userSequences: [],
        activeView: 'workspace',
        activeSequenceId: null,
        activeDatasetId: null,
        originalSequences: null
      });
    }
  },

  updateDisplayName: (name) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, name };
      if (state.authType === 'guest') {
        localStorage.setItem('guest_name', name);
      }
      return { user: updatedUser };
    });
  },

  signOut: () => {
    set({
      authType: null,
      isDemoMode: false,
      user: null,
      sequences: [],
      demoSequences: [],
      userSequences: [],
      activeView: 'workspace',
      activeSequenceId: null,
      originalSequences: null
    });
  },

  // NEW: Sequence management states
  sequences: [],
  originalSequences: null,
  activeSequenceId: null,
  isProcessing: false,
  analysisResults: null,
  setAnalysisResults: (results) => set({ analysisResults: results }),
  activeReportFocus: null,
  setActiveReportFocus: (focus) => set({ activeReportFocus: focus }),
  viewRedirect: null,
  setViewRedirect: (view) => set({ viewRedirect: view }),

  // NEW: API Configuration Store (Mock ↔ Real Toggle)
  geminiApiKey: null,
  useRealAI: false,
  useRealAPIs: typeof window !== 'undefined' ? localStorage.getItem('use_real_apis') === 'true' : false,
  ncbiBackendAvailable: false,
  setNcbiBackendAvailable: (available) => set((state) => ({
    ncbiBackendAvailable: available,
    apiStatus: {
      ...state.apiStatus,
      ncbi: available ? (state.useRealAPIs ? 'connected' : 'mock') : 'mock'
    }
  })),
  setUseRealAPIs: (use) => set((state) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('use_real_apis', String(use));
    }
    return {
      useRealAPIs: use,
      apiStatus: {
        ncbi: use ? (state.ncbiBackendAvailable ? 'connected' : 'mock') : 'mock',
        gemini: use ? (state.geminiApiKey ? 'connected' : 'disconnected') : 'mock'
      }
    };
  }),
  apiStatus: {
    ncbi: (typeof window !== 'undefined' && localStorage.getItem('use_real_apis') === 'true') ? 'connected' : 'mock',
    gemini: 'mock'
  },
  setGeminiApiKey: (key) => set((state) => {
    const apiStatus = { ...state.apiStatus };
    if (state.useRealAPIs) {
      apiStatus.gemini = key ? 'connected' : 'disconnected';
    }
    return { geminiApiKey: key, apiStatus };
  }),
  setUseRealAI: (use) => set({ useRealAI: use }),
  toggleRealAPIs: () => set((state) => {
    const newVal = !state.useRealAPIs;
    if (typeof window !== 'undefined') {
      localStorage.setItem('use_real_apis', String(newVal));
    }
    return {
      useRealAPIs: newVal,
      apiStatus: {
        ncbi: newVal ? (state.ncbiBackendAvailable ? 'connected' : 'mock') : 'mock',
        gemini: newVal ? (state.geminiApiKey ? 'connected' : 'disconnected') : 'mock'
      }
    };
  }),
  testAPIConnection: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const current = get();
    set({
      apiStatus: {
        ncbi: current.useRealAPIs ? (current.ncbiBackendAvailable ? 'connected' : 'mock') : 'mock',
        gemini: current.useRealAPIs ? (current.geminiApiKey ? 'connected' : 'disconnected') : 'mock'
      }
    });
  },

  // NEW: NCBI Tools states initialization
  blastSearch: {
    isSearching: false,
    progressStep: '',
    querySequence: '',
    results: null,
    selectedHit: null
  },
  setBlastSearch: (updates) => set((state) => ({
    blastSearch: { ...state.blastSearch, ...updates }
  })),
  blastHistory: [],
  addBlastResult: (result) => set((state) => ({
    blastHistory: [result, ...state.blastHistory].slice(0, 10) // Keep last 10
  })),
  clearBlastResults: () => set({ blastHistory: [] }),
  deleteBlastResult: (id) => set((state) => ({
    blastHistory: state.blastHistory.filter(r => r.id !== id)
  })),

  // NEW: Saved Insights state and actions implementation
  savedInsights: [],
  addSavedInsight: (insight) => set((state) => {
    if (state.savedInsights.some((item) => item.id === insight.id)) {
      return state;
    }
    return {
      savedInsights: [insight, ...state.savedInsights]
    };
  }),
  removeSavedInsight: (id) => set((state) => ({
    savedInsights: state.savedInsights.filter((item) => item.id !== id)
  })),
  clearSavedInsights: () => set({ savedInsights: [] }),

  // Toast state implementation
  toast: null,
  showToast: (message, type) => set({ toast: { message, type } }),
  hideToast: () => set({ toast: null }),

  getActiveSequences: () => {
    const state = get();
    return state.activeView === 'demo' ? state.demoSequences : state.userSequences;
  },

  addSequences: (newSeqs) => {
    // Ensure newSeqs is array
    if (!Array.isArray(newSeqs)) {
      console.error('addSequences: received non-array', newSeqs);
      return;
    }
    
    // Ensure each sequence has required fields
    const validSequences = newSeqs.filter(s => 
      s && typeof s === 'object' && typeof s.id === 'string' && typeof s.sequence === 'string'
    );

    set((state) => {
      const updatedSeqs = [...state.userSequences];
      
      // Prevent duplicates by checking name and sequence
      validSequences.forEach(newSeq => {
        const isDuplicate = updatedSeqs.some(
          s => s.name === newSeq.name && s.sequence === newSeq.sequence
        );
        if (!isDuplicate) {
          updatedSeqs.push({ ...newSeq, sourceType: 'upload' });
        }
      });

      return {
        userSequences: updatedSeqs,
        sequences: updatedSeqs,
        activeView: 'workspace',
        isDemoMode: false, // Turn off read-only demo mode upon custom user upload
        activeSequenceId: state.activeSequenceId || (updatedSeqs[0]?.id || null),
        activeDatasetId: 'custom'
      };
    });
  },

  addUserSequences: (newSeqs) => {
    get().addSequences(newSeqs);
  },

  clearUserSequences: () => {
    set((state) => {
      const newActiveId = state.activeView === 'workspace' ? null : state.activeSequenceId;
      return {
        userSequences: [],
        sequences: state.activeView === 'workspace' ? [] : state.sequences,
        activeSequenceId: newActiveId,
        activeDatasetId: state.activeView === 'workspace' ? null : state.activeDatasetId
      };
    });
  },

  setActiveView: (view) => {
    set((state) => {
      const targetSeqs = view === 'demo' ? state.demoSequences : state.userSequences;
      return {
        activeView: view,
        sequences: targetSeqs,
        activeSequenceId: targetSeqs[0]?.id || null
      };
    });
  },

  removeSequence: (id) => {
    set((state) => {
      const isDemo = state.activeView === 'demo';
      const currentSeqs = isDemo ? state.demoSequences : state.userSequences;
      const filtered = currentSeqs.filter(s => s.id !== id);
      let newActiveId = state.activeSequenceId;
      if (state.activeSequenceId === id) {
        newActiveId = filtered[0]?.id || null;
      }
      return {
        demoSequences: isDemo ? filtered : state.demoSequences,
        userSequences: !isDemo ? filtered : state.userSequences,
        sequences: filtered,
        activeSequenceId: newActiveId
      };
    });
  },

  setActiveSequence: (id) => set({ activeSequenceId: id }),

  cleanSequences: (options) => {
    const state = get();
    const isDemo = state.activeView === 'demo';
    const currentSeqs = isDemo ? [...state.demoSequences] : [...state.userSequences];
    
    // Save backup for Undo
    set({ originalSequences: currentSeqs });

    const beforeCount = currentSeqs.length;
    const totalBasesBefore = currentSeqs.reduce((sum, s) => sum + s.sequence.length, 0);
    const beforeAvgLen = beforeCount > 0 ? parseFloat((totalBasesBefore / beforeCount).toFixed(1)) : 0;

    let processedSeqs: GeneticSequence[] = currentSeqs.map(seq => {
      let cleanedStr = seq.sequence;

      if (options.standardizeCase) {
        cleanedStr = cleanedStr.toUpperCase();
      }

      if (options.removeWhitespace) {
        cleanedStr = cleanedStr.replace(/\s+/g, '');
      }

      if (options.trimNsAndGaps) {
        // Trim leading and trailing N's, n's, and gaps '-'
        cleanedStr = cleanedStr.replace(/^[Nn-]+|[Nn-]+$/g, '');
      }

      if (options.removeNonDnaChars) {
        // Keeps only A, C, G, T, N, -
        cleanedStr = cleanedStr.replace(/[^ACGTN-]/gi, '');
      }

      const length = cleanedStr.length;
      
      // Calculate gc content
      const gcCount = (cleanedStr.match(/[GCgc]/g) || []).length;
      const gcContent = length > 0 ? parseFloat(((gcCount / length) * 100).toFixed(2)) : 0;
      const nCount = (cleanedStr.match(/[Nn]/g) || []).length;

      return {
        ...seq,
        sequence: cleanedStr,
        length,
        gcContent,
        nCount
      };
    });

    // Remove sequences below minimum length
    if (options.removeShortSequences) {
      processedSeqs = processedSeqs.filter(s => s.length >= options.minSequenceLength);
    }

    const afterCount = processedSeqs.length;
    const totalBasesAfter = processedSeqs.reduce((sum, s) => sum + s.sequence.length, 0);
    const afterAvgLen = afterCount > 0 ? parseFloat((totalBasesAfter / afterCount).toFixed(1)) : 0;
    const totalBasesRemoved = Math.max(0, totalBasesBefore - totalBasesAfter);

    // Update active sequence if it was filtered out
    let newActiveId = state.activeSequenceId;
    if (newActiveId && !processedSeqs.some(s => s.id === newActiveId)) {
      newActiveId = processedSeqs[0]?.id || null;
    }

    set({
      demoSequences: isDemo ? processedSeqs : state.demoSequences,
      userSequences: !isDemo ? processedSeqs : state.userSequences,
      sequences: processedSeqs,
      activeSequenceId: newActiveId
    });

    return {
      beforeCount,
      afterCount,
      beforeAvgLen,
      afterAvgLen,
      totalBasesRemoved
    };
  },

  undoCleanSequences: () => {
    const state = get();
    if (state.originalSequences) {
      const isDemo = state.activeView === 'demo';
      const restored = state.originalSequences;
      set({
        demoSequences: isDemo ? restored : state.demoSequences,
        userSequences: !isDemo ? restored : state.userSequences,
        sequences: restored,
        originalSequences: null,
        activeSequenceId: restored[0]?.id || null
      });
    }
  },

  loadDemoDataset: (datasetId) => {
    const dataset = demoDatasets.find(d => d.id === datasetId);
    if (dataset) {
      const demoSeqs = dataset.sequences.map(s => ({ ...s, sourceType: 'demo' as const }));
      set({
        demoSequences: demoSeqs,
        sequences: demoSeqs,
        activeSequenceId: dataset.sequences[0]?.id || null,
        activeDatasetId: dataset.id,
        activeView: 'demo',
        originalSequences: null,
        isDemoMode: true
      });
    }
  },

  clearAllData: () => {
    set({
      sequences: [],
      demoSequences: [],
      userSequences: [],
      originalSequences: null,
      activeSequenceId: null,
      activeDatasetId: null,
      activeView: 'workspace',
      isDemoMode: false
    });
  },

  resetSequences: () => set({ sequences: [] }),

  updateSequence: (id, updates) => {
    set((state) => {
      const isDemo = state.activeView === 'demo';
      const currentSeqs = isDemo ? state.demoSequences : state.userSequences;
      const updated = currentSeqs.map((s) => {
        if (s.id !== id) return s;
        const metadata = {
          ...(s.metadata || {}),
          ...(updates.metadata || {}),
        };
        return {
          ...s,
          ...updates,
          metadata,
          // root-level backward compatibility fields
          location: metadata.location ?? s.location,
          species: metadata.species ?? s.species,
        };
      });

      return {
        demoSequences: isDemo ? updated : state.demoSequences,
        userSequences: !isDemo ? updated : state.userSequences,
        sequences: updated
      };
    });
  },

  enterDemoMode: () => {
    const defaultDemo = demoDatasets.find(d => d.id === 'rusa-timorensis') || demoDatasets[0];
    const demoSeqs = defaultDemo.sequences.map(s => ({ ...s, sourceType: 'demo' as const }));
    set({
      authType: 'demo',
      isDemoMode: true,
      user: { name: 'Demo Explorer', email: 'demo@student-genomics.org' },
      demoSequences: demoSeqs,
      sequences: demoSeqs,
      activeSequenceId: defaultDemo.sequences[0]?.id || null,
      activeDatasetId: defaultDemo.id,
      activeView: 'demo',
      originalSequences: null
    });
  },

  exitDemoMode: () => {
    set({
      authType: 'guest',
      isDemoMode: false,
      user: { name: localStorage.getItem('guest_name') || 'Guest User', email: 'local-session@browser' },
      demoSequences: [],
      userSequences: [],
      sequences: [],
      activeSequenceId: null,
      activeDatasetId: null,
      activeView: 'workspace',
      originalSequences: null
    });
  }
}));

