import type { AgentTraceEntry } from '@/types/agents';

export type IndustryType = 'general' | 'finance' | 'healthcare' | 'technology';

/** `full` = 5-agent pipeline (hackathon showcase). `fast` = single Gemini call (~15s). */
export type AnalysisMode = 'fast' | 'full';

export const ANALYSIS_MODE_OPTIONS: {
  id: AnalysisMode;
  label: string;
  description: string;
}[] = [
  {
    id: 'full',
    label: 'Full Agents',
    description: '5 specialized agents · traceable pipeline · ~45–90s',
  },
  {
    id: 'fast',
    label: 'Fast Mode',
    description: 'Single AI pass · same report output · ~15–25s',
  },
];

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
  agentTrace: AgentTraceEntry[];
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
  analysisMode?: AnalysisMode;
  title: string;
  sourceFileName?: string;
  documentText: string;
  documentPreview: string;
  results: AnalysisResult;
}
