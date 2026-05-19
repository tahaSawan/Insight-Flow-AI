import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface AnalysisResult {
  riskScore: number;
  confidence: number;
  priorityLevel: string;
  estimatedImpact: string;
  keyFindings: string[];
  riskAssessment: string[];
  recommendedActions: string[];
  beforeChurn: string;
  afterChurn: string;
}

interface AppContextType {
  uploadedText: string;
  setUploadedText: (text: string) => void;
  analysisResults: AnalysisResult | null;
  setAnalysisResults: (results: AnalysisResult | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [uploadedText, setUploadedText] = useState('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <AppContext.Provider 
      value={{ 
        uploadedText, 
        setUploadedText, 
        analysisResults, 
        setAnalysisResults,
        isAnalyzing,
        setIsAnalyzing
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
