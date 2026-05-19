export type IndustryType = 'general' | 'finance' | 'healthcare' | 'technology';

export interface SimulatedAction {
  title: string;
  description: string;
  icon: string;
}

export interface AnalysisResult {
  executiveSummary: string;
  riskScore: number;
  confidence: number;
  priorityLevel: string;
  estimatedImpact: string;
  keyFindings: string[];
  riskAssessment: string[];
  recommendedActions: string[];
  impactMetricLabel: string;
  beforeMetric: string;
  afterMetric: string;
  simulatedActions: SimulatedAction[];
  executionLog: string[];
}

export const INDUSTRY_OPTIONS: { id: IndustryType; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'finance', label: 'Finance' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'technology', label: 'Technology' },
];

export interface HistoryEntry {
  id: string;
  createdAt: string;
  industry: IndustryType;
  title: string;
  sourceFileName?: string;
  documentText: string;
  documentPreview: string;
  results: AnalysisResult;
}
