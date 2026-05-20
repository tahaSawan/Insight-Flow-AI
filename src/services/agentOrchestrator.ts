import { AGENT_PIPELINE, getAgentDefinition } from '@/constants/agents';
import { PLAIN_LANGUAGE_AI_RULES } from '@/constants/plainLanguage';
import type { AgentTraceEntry } from '@/types/agents';
import type { AnalysisResult, IndustryType, SimulatedAction, UseCaseType } from '@/types/analysis';
import { getUseCaseHint } from '@/constants/useCases';
import {
  generateJson,
  getGeminiConfigError,
  validateAnalysisInput,
  toFriendlyGeminiError,
} from '@/services/gemini';
import { parseAgentDebate } from '@/utils/agentDebate';

const INDUSTRY_CONTEXT: Record<IndustryType, string> = {
  general: 'general business leadership',
  finance: 'finance and compliance',
  healthcare: 'healthcare operations and HIPAA compliance',
  technology: 'technology product and engineering',
};

export type OrchestratorCallback = (trace: AgentTraceEntry[]) => void;

function now() {
  return new Date().toISOString();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateTrace(
  trace: AgentTraceEntry[],
  entry: AgentTraceEntry,
  onProgress?: OrchestratorCallback,
) {
  const idx = trace.findIndex((t) => t.agentId === entry.agentId);
  if (idx >= 0) trace[idx] = entry;
  else trace.push(entry);
  onProgress?.([...trace]);
}

async function runIngestionAgent(
  text: string,
  industry: IndustryType,
  scenarioHint: string,
  trace: AgentTraceEntry[],
  onProgress?: OrchestratorCallback,
): Promise<{ documentType: string; signals: string[] }> {
  const def = getAgentDefinition('ingestion');
  const entry: AgentTraceEntry = {
    agentId: 'ingestion',
    agentName: def.name,
    status: 'running',
    startedAt: now(),
    reasoning: 'Reading your document...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  await sleep(600);

  const parsed = await generateJson<{ documentType: string; signals: string[] }>(`
You are the Reader helper. Use very simple English.
${PLAIN_LANGUAGE_AI_RULES}
Return ONLY JSON: { "documentType": string, "signals": string[] }
- documentType: short plain label (e.g. "Sales report", "Resume", "Team update")
- signals: exactly 3 short facts from the text (not advice yet)

Industry: ${INDUSTRY_CONTEXT[industry]}
Scenario: ${scenarioHint}
Document:
"""${text.slice(0, 2500)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: `Read your ${parsed.documentType} (${wordCount} words). Picked out ${parsed.signals.length} key facts.`,
    outputSummary: parsed.signals.join(' · '),
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

async function runInsightAgent(
  text: string,
  industry: IndustryType,
  scenarioHint: string,
  signals: string[],
  trace: AgentTraceEntry[],
  onProgress?: OrchestratorCallback,
): Promise<{ executiveSummary: string; keyFindings: string[] }> {
  const def = getAgentDefinition('insight');
  const entry: AgentTraceEntry = {
    agentId: 'insight',
    agentName: def.name,
    status: 'running',
    startedAt: now(),
    reasoning: 'Finding the main points...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const parsed = await generateJson<{ executiveSummary: string; keyFindings: string[] }>(`
You are the Main Points helper. Use very simple English.
${PLAIN_LANGUAGE_AI_RULES}
Return ONLY JSON:
{
  "executiveSummary": "2-3 short sentences anyone can understand",
  "keyFindings": ["exactly 3 main points in plain English"]
}

Industry: ${INDUSTRY_CONTEXT[industry]}
Scenario: ${scenarioHint}
Facts from Reader: ${signals.join('; ')}

Document:
"""${text.slice(0, 4000)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: 'Wrote a short summary and 3 main points. Sending to Problems helper.',
    outputSummary: parsed.keyFindings[0] || parsed.executiveSummary.slice(0, 80),
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

async function runRiskAgent(
  text: string,
  industry: IndustryType,
  scenarioHint: string,
  insight: { executiveSummary: string; keyFindings: string[] },
  trace: AgentTraceEntry[],
  onProgress?: OrchestratorCallback,
): Promise<{
  riskAssessment: string[];
  riskScore: number;
  confidence: number;
  priorityLevel: string;
  estimatedImpact: string;
  urgencyHeadline: string;
  stakeAtRisk: string;
  doNothingOutlook: string;
  doActionOutlook: string;
}> {
  const def = getAgentDefinition('risk');
  const entry: AgentTraceEntry = {
    agentId: 'risk',
    agentName: def.name,
    status: 'running',
    startedAt: now(),
    reasoning: 'Checking how serious the problems are...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const parsed = await generateJson<{
    riskAssessment: string[];
    riskScore: number;
    confidence: number;
    priorityLevel: string;
    estimatedImpact: string;
    urgencyHeadline: string;
    stakeAtRisk: string;
    doNothingOutlook: string;
    doActionOutlook: string;
  }>(`
You are the Problems helper. Use very simple English.
${PLAIN_LANGUAGE_AI_RULES}
Return ONLY JSON:
{
  "riskAssessment": ["exactly 3 things that could go wrong — plain English"],
  "riskScore": number 0-100 (how serious the main problem is),
  "confidence": number 0-100 (how sure you are),
  "priorityLevel": "High"|"Medium"|"Low" (how urgent),
  "estimatedImpact": "one simple sentence: what happens if nobody acts",
  "urgencyHeadline": "max 12 words — top alert for leadership",
  "stakeAtRisk": "number from doc: $, %, customers, etc.",
  "doNothingOutlook": "one sentence: worst case in ~30 days if no action",
  "doActionOutlook": "one sentence: realistic outcome if plan runs"
}

Industry: ${INDUSTRY_CONTEXT[industry]}
Scenario: ${scenarioHint}
Summary: ${insight.executiveSummary}
Main points: ${insight.keyFindings.join('; ')}

Document:
"""${text.slice(0, 3000)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: `Seriousness: ${parsed.riskScore}/100. Urgency: ${parsed.priorityLevel}. ${parsed.estimatedImpact}`,
    outputSummary: `Seriousness ${parsed.riskScore}/100 · ${parsed.priorityLevel} urgency`,
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

async function runActionAgent(
  text: string,
  industry: IndustryType,
  scenarioHint: string,
  context: string,
  trace: AgentTraceEntry[],
  onProgress?: OrchestratorCallback,
): Promise<{ recommendedActions: string[] }> {
  const def = getAgentDefinition('action');
  const entry: AgentTraceEntry = {
    agentId: 'action',
    agentName: def.name,
    status: 'running',
    startedAt: now(),
    reasoning: 'Writing clear next steps...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const parsed = await generateJson<{ recommendedActions: string[] }>(`
You are the Next Steps helper. Use very simple English.
${PLAIN_LANGUAGE_AI_RULES}
Return ONLY JSON: { "recommendedActions": ["exactly 3 things to do — start each with a verb"] }

Industry: ${INDUSTRY_CONTEXT[industry]}
Scenario: ${scenarioHint}
So far: ${context}

Document:
"""${text.slice(0, 2500)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: 'Listed 3 next steps. Showing a demo of what could happen.',
    outputSummary: parsed.recommendedActions[0] || 'Actions ready',
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

async function runExecutionAgent(
  text: string,
  industry: IndustryType,
  scenarioHint: string,
  actions: string[],
  riskSummary: string,
  trace: AgentTraceEntry[],
  onProgress?: OrchestratorCallback,
): Promise<{
  simulatedActions: SimulatedAction[];
  executionLog: string[];
  impactMetricLabel: string;
  beforeMetric: string;
  afterMetric: string;
  autonomousDecision?: import('@/types/analysis').AutonomousDecision;
  agentDebate?: import('@/types/analysis').AgentDebate;
}> {
  const def = getAgentDefinition('execution');
  const entry: AgentTraceEntry = {
    agentId: 'execution',
    agentName: def.name,
    status: 'running',
    startedAt: now(),
    reasoning: 'Building a pretend before/after picture (demo only)...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const parsed = await generateJson<{
    simulatedActions: SimulatedAction[];
    executionLog: string[];
    impactMetricLabel: string;
    beforeMetric: string;
    afterMetric: string;
    autonomousDecision?: {
      primaryDecision: string;
      reason: string;
      priorityLevel: string;
      expectedOutcome: string;
      confidence: number;
    };
    agentDebate?: unknown;
  }>(`
You are the Results helper. This is a DEMO — pretend actions only, simple words.
${PLAIN_LANGUAGE_AI_RULES}
Return ONLY JSON:
{
  "simulatedActions": [{ "title": string, "description": string, "icon": "single emoji", "channel": "slack"|"email"|"crm"|"dashboard", "notificationPreview": string }],
  "executionLog": ["exactly 6 short log lines, no timestamps, plain English"],
  "impactMetricLabel": "simple name, max 4 words",
  "beforeMetric": "situation now",
  "afterMetric": "situation after fixes (guess)",
  "autonomousDecision": {
    "primaryDecision": "the single most important action to take first, start with a verb",
    "reason": "one clear sentence explaining why this specific action was selected over others, plain English",
    "priorityLevel": "High"|"Medium"|"Low",
    "expectedOutcome": "one sentence: the specific positive result of this action",
    "confidence": number 0-100
  },
  "agentDebate": {
    "growth": { "recommendedApproach": string, "concern": string, "confidence": number },
    "risk": { "recommendedApproach": string, "concern": string, "confidence": number },
    "finance": { "recommendedApproach": string, "concern": string, "confidence": number },
    "finalConclusion": string,
    "balanceExplanation": string
  }
}
- simulatedActions: exactly 3 pretend steps (e.g. "Team emailed")
- agentDebate: three short viewpoints in plain English, then finalConclusion matching primaryDecision

Industry: ${INDUSTRY_CONTEXT[industry]}
Scenario: ${scenarioHint}
Problems: ${riskSummary}
Next steps: ${actions.join('; ')}

Document:
"""${text.slice(0, 2000)}"""
`);

  let autonomousDecision: import('@/types/analysis').AutonomousDecision | undefined;
  if (parsed.autonomousDecision && typeof parsed.autonomousDecision === 'object') {
    const ad = parsed.autonomousDecision as Record<string, unknown>;
    autonomousDecision = {
      primaryDecision: String(ad.primaryDecision || ''),
      reason: String(ad.reason || ''),
      priorityLevel: String(ad.priorityLevel || 'High'),
      expectedOutcome: String(ad.expectedOutcome || ''),
      confidence: Number(ad.confidence) || 80,
    };
  }

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: `Demo: ${parsed.simulatedActions.length} pretend actions. ${parsed.impactMetricLabel}: ${parsed.beforeMetric} → ${parsed.afterMetric}`,
    outputSummary: `${parsed.beforeMetric} → ${parsed.afterMetric}`,
  };
  updateTrace(trace, completed, onProgress);
  return {
    ...parsed,
    autonomousDecision,
    agentDebate: parseAgentDebate(parsed.agentDebate),
  };
}

/** Run the full 5-agent insight-to-action pipeline with live trace updates. */
export async function runAgentOrchestration(
  text: string,
  industry: IndustryType = 'general',
  onProgress?: OrchestratorCallback,
  useCase: UseCaseType = 'board',
): Promise<AnalysisResult> {
  const scenarioHint = getUseCaseHint(useCase);
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const inputError = validateAnalysisInput(text);
  if (inputError) throw new Error(inputError);

  const trimmed = text.trim();
  const trace: AgentTraceEntry[] = AGENT_PIPELINE.map((a) => ({
    agentId: a.id,
    agentName: a.name,
    status: 'pending' as const,
    reasoning: 'Waiting to start...',
    outputSummary: '',
  }));
  onProgress?.([...trace]);

  try {
    const ingestion = await runIngestionAgent(trimmed, industry, scenarioHint, trace, onProgress);
    const insight = await runInsightAgent(
      trimmed,
      industry,
      scenarioHint,
      ingestion.signals,
      trace,
      onProgress,
    );
    const risk = await runRiskAgent(trimmed, industry, scenarioHint, insight, trace, onProgress);
    const action = await runActionAgent(
      trimmed,
      industry,
      scenarioHint,
      `${insight.executiveSummary} Risks: ${risk.riskAssessment.join('; ')}`,
      trace,
      onProgress,
    );
    const execution = await runExecutionAgent(
      trimmed,
      industry,
      scenarioHint,
      action.recommendedActions,
      `Risk ${risk.riskScore}, ${risk.estimatedImpact}`,
      trace,
      onProgress,
    );

    return {
      executiveSummary: insight.executiveSummary,
      urgencyHeadline: risk.urgencyHeadline,
      stakeAtRisk: risk.stakeAtRisk,
      doNothingOutlook: risk.doNothingOutlook,
      doActionOutlook: risk.doActionOutlook,
      riskScore: Math.min(100, Math.max(0, risk.riskScore)),
      confidence: Math.min(100, Math.max(0, risk.confidence)),
      priorityLevel: risk.priorityLevel,
      estimatedImpact: risk.estimatedImpact,
      keyFindings: insight.keyFindings,
      riskAssessment: risk.riskAssessment,
      recommendedActions: action.recommendedActions,
      impactMetricLabel: execution.impactMetricLabel,
      beforeMetric: execution.beforeMetric,
      afterMetric: execution.afterMetric,
      simulatedActions: execution.simulatedActions.slice(0, 3),
      executionLog: execution.executionLog.slice(0, 8),
      agentTrace: [...trace],
      autonomousDecision: execution.autonomousDecision,
      agentDebate: execution.agentDebate,
    };
  } catch (error) {
    const running = trace.find((t) => t.status === 'running');
    if (running) {
      updateTrace(
        trace,
        {
          ...running,
          status: 'error',
          completedAt: now(),
          reasoning: toFriendlyGeminiError(error),
          outputSummary: 'Failed',
        },
        onProgress,
      );
    }
    throw error;
  }
}
