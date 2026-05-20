import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type {
  AnalysisResult,
  HistoryEntry,
  IndustryType,
  AnalysisMode,
  UseCaseType,
} from '@/types/analysis';
import {
  loadHistory,
  saveHistoryEntry,
  clearAllHistory,
  deleteHistoryEntry,
} from '@/services/historyStorage';
import { getUseCase, setUseCase as persistUseCase } from '@/services/appPreferences';

interface AppContextType {
  uploadedText: string;
  setUploadedText: (text: string) => void;
  sourceFileName: string | null;
  setSourceFileName: (name: string | null) => void;
  industry: IndustryType;
  setIndustry: (industry: IndustryType) => void;
  analysisMode: AnalysisMode;
  setAnalysisMode: (mode: AnalysisMode) => void;
  analysisResults: AnalysisResult | null;
  setAnalysisResults: (results: AnalysisResult | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  history: HistoryEntry[];
  refreshHistory: () => Promise<void>;
  persistAnalysisToHistory: () => Promise<void>;
  loadHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => Promise<void>;
  removeHistoryEntry: (id: string) => Promise<void>;
  resetSession: () => void;
  useCase: UseCaseType;
  setUseCase: (useCase: UseCaseType) => Promise<void>;
  preferencesLoaded: boolean;
  historyHydrating: boolean;
  setHistoryHydrating: (value: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [uploadedText, setUploadedText] = useState('');
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [industry, setIndustry] = useState<IndustryType>('general');
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('full');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [useCase, setUseCaseState] = useState<UseCaseType>('board');
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const [historyHydrating, setHistoryHydrating] = useState(false);

  const refreshHistory = useCallback(async () => {
    const entries = await loadHistory();
    setHistory(entries);
  }, []);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  useEffect(() => {
    (async () => {
      const uc = await getUseCase();
      setUseCaseState(uc);
      setPreferencesLoaded(true);
    })();
  }, []);

  const setUseCase = useCallback(async (uc: UseCaseType) => {
    setUseCaseState(uc);
    await persistUseCase(uc);
  }, []);

  const persistAnalysisToHistory = useCallback(async () => {
    if (!analysisResults || !uploadedText.trim()) return;

    const entry: HistoryEntry = {
      id: `${Date.now()}`,
      createdAt: new Date().toISOString(),
      industry,
      analysisMode,
      title:
        analysisResults.keyFindings[0]?.slice(0, 56) ||
        analysisResults.executiveSummary.slice(0, 56) ||
        'Business Analysis',
      sourceFileName: sourceFileName ?? undefined,
      documentText: uploadedText,
      documentPreview: uploadedText.slice(0, 160).replace(/\s+/g, ' '),
      results: analysisResults,
    };

    await saveHistoryEntry(entry);
    await refreshHistory();
  }, [analysisResults, uploadedText, industry, analysisMode, sourceFileName, refreshHistory]);

  const loadHistoryEntry = useCallback((entry: HistoryEntry) => {
    setHistoryHydrating(true);
    setUploadedText(entry.documentText);
    setSourceFileName(entry.sourceFileName ?? null);
    setIndustry(entry.industry);
    if (entry.analysisMode) setAnalysisMode(entry.analysisMode);
    setAnalysisResults(entry.results);
    setIsAnalyzing(false);
  }, []);

  const clearHistory = useCallback(async () => {
    await clearAllHistory();
    await refreshHistory();
  }, [refreshHistory]);

  const removeHistoryEntry = useCallback(
    async (id: string) => {
      await deleteHistoryEntry(id);
      await refreshHistory();
    },
    [refreshHistory],
  );

  const resetSession = () => {
    setUploadedText('');
    setSourceFileName(null);
    setAnalysisResults(null);
    setIsAnalyzing(false);
  };

  return (
    <AppContext.Provider
      value={{
        uploadedText,
        setUploadedText,
        sourceFileName,
        setSourceFileName,
        industry,
        setIndustry,
        analysisMode,
        setAnalysisMode,
        analysisResults,
        setAnalysisResults,
        isAnalyzing,
        setIsAnalyzing,
        history,
        refreshHistory,
        persistAnalysisToHistory,
        loadHistoryEntry,
        clearHistory,
        removeHistoryEntry,
        resetSession,
        useCase,
        setUseCase,
        preferencesLoaded,
        historyHydrating,
        setHistoryHydrating,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

export type { AnalysisResult, HistoryEntry } from '@/types/analysis';
