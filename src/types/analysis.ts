import type { AgentTraceEntry } from '@/types/agents';

export type IndustryType = 'general' | 'finance' | 'healthcare' | 'technology';

export type UseCaseType = 'board' | 'crisis' | 'weekly';

/** `full` = 5-agent pipeline (hackathon showcase). `fast` = single Gemini call (~15s). */
export type AnalysisMode = 'fast' | 'full';

export const ANALYSIS_MODE_OPTIONS: {
  id: AnalysisMode;
  label: string;
  description: string;
}[] = [
  {
    id: 'full',
    label: 'Step by step (5 helpers)',
    description: 'Easier to follow · takes about 1 minute',
  },
  {
    id: 'fast',
    label: 'Quick mode',
    description: 'One pass · same report · about 20 seconds',
  },
];

export type ActionChannel = 'slack' | 'email' | 'crm' | 'dashboard';

export interface SimulatedAction {
  title: string;
  description: string;
  icon: string;
  /** Mock system channel for live simulation UI */
  channel?: ActionChannel;
  /** One-line preview shown when action "runs" (e.g. Slack message body) */
  notificationPreview?: string;
}

export interface AnalysisResult {
  executiveSummary: string;
  /** One-line alert for executives, e.g. "Enterprise revenue down 12% — renewals at risk" */
  urgencyHeadline?: string;
  /** Quantified stake, e.g. "$2.1M ARR" or "~500 customers" */
  stakeAtRisk?: string;
  /** If team does nothing (one sentence) */
  doNothingOutlook?: string;
  /** If team follows the plan (one sentence) */
  doActionOutlook?: string;
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
