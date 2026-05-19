import { AGENT_PIPELINE, getAgentDefinition } from '@/constants/agents';
import type { AgentId, AgentTraceEntry } from '@/types/agents';
import type { AnalysisResult, IndustryType, SimulatedAction } from '@/types/analysis';
import {
  generateJson,
  getGeminiConfigError,
  validateAnalysisInput,
  toFriendlyGeminiError,
} from '@/services/gemini';

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
  trace: AgentTraceEntry[],
  onProgress?: OrchestratorCallback,
): Promise<{ documentType: string; signals: string[] }> {
  const def = getAgentDefinition('ingestion');
  const entry: AgentTraceEntry = {
    agentId: 'ingestion',
    agentName: def.name,
    status: 'running',
    startedAt: now(),
    reasoning: 'Scanning document structure and extracting signals...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  await sleep(600);

  const parsed = await generateJson<{ documentType: string; signals: string[] }>(`
You are the Ingestion Agent in a multi-agent insight-to-action system.
Analyze this document excerpt and return ONLY JSON:
{ "documentType": string, "signals": string[] }
- documentType: e.g. "Q3 Sales Report", "Policy Brief", "Incident Report"
- signals: exactly 3 short factual signals detected (not insights yet)

Industry: ${INDUSTRY_CONTEXT[industry]}
Document excerpt:
"""${text.slice(0, 2500)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: `Identified document as "${parsed.documentType}" with ${wordCount} words. Flagged ${parsed.signals.length} raw signals for downstream agents.`,
    outputSummary: parsed.signals.join(' · '),
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

async function runInsightAgent(
  text: string,
  industry: IndustryType,
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
    reasoning: 'Moving beyond summary — extracting non-trivial patterns...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const parsed = await generateJson<{ executiveSummary: string; keyFindings: string[] }>(`
You are the Insight Agent. Do NOT write a generic summary.
Extract meaningful, non-obvious insights tied to the document.
Return ONLY JSON:
{
  "executiveSummary": "2-3 sentences for a CEO",
  "keyFindings": ["exactly 3 specific findings"]
}

Industry: ${INDUSTRY_CONTEXT[industry]}
Signals from Ingestion Agent: ${signals.join('; ')}

Document:
"""${text.slice(0, 4000)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: 'Synthesized patterns into executive-level findings. Passed context to Risk Agent.',
    outputSummary: parsed.keyFindings[0] || parsed.executiveSummary.slice(0, 80),
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

async function runRiskAgent(
  text: string,
  industry: IndustryType,
  insight: { executiveSummary: string; keyFindings: string[] },
  trace: AgentTraceEntry[],
  onProgress?: OrchestratorCallback,
): Promise<{
  riskAssessment: string[];
  riskScore: number;
  confidence: number;
  priorityLevel: string;
  estimatedImpact: string;
}> {
  const def = getAgentDefinition('risk');
  const entry: AgentTraceEntry = {
    agentId: 'risk',
    agentName: def.name,
    status: 'running',
    startedAt: now(),
    reasoning: 'Connecting insights to real-world consequences and exposure...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const parsed = await generateJson<{
    riskAssessment: string[];
    riskScore: number;
    confidence: number;
    priorityLevel: string;
    estimatedImpact: string;
  }>(`
You are the Risk Agent. Analyze implications — WHY this matters operationally.
Return ONLY JSON:
{
  "riskAssessment": ["exactly 3 risks"],
  "riskScore": number 0-100,
  "confidence": number 0-100,
  "priorityLevel": "High"|"Medium"|"Low",
  "estimatedImpact": "one sentence on business impact"
}

Industry: ${INDUSTRY_CONTEXT[industry]}
Insights: ${insight.executiveSummary}
Findings: ${insight.keyFindings.join('; ')}

Document:
"""${text.slice(0, 3000)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: `Risk score ${parsed.riskScore}/100 at ${parsed.priorityLevel} priority. Impact: ${parsed.estimatedImpact}`,
    outputSummary: `Risk ${parsed.riskScore}/100 · ${parsed.priorityLevel} priority`,
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

async function runActionAgent(
  text: string,
  industry: IndustryType,
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
    reasoning: 'Generating realistic, domain-specific actionable recommendations...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const parsed = await generateJson<{ recommendedActions: string[] }>(`
You are the Action Agent. Generate clear, executable recommendations (verbs first).
Return ONLY JSON: { "recommendedActions": ["exactly 3 actions"] }

Industry: ${INDUSTRY_CONTEXT[industry]}
Prior analysis: ${context}

Document:
"""${text.slice(0, 2500)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: 'Validated actions against risk profile. Handoff to Execution Agent for simulation.',
    outputSummary: parsed.recommendedActions[0] || 'Actions ready',
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

async function runExecutionAgent(
  text: string,
  industry: IndustryType,
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
}> {
  const def = getAgentDefinition('execution');
  const entry: AgentTraceEntry = {
    agentId: 'execution',
    agentName: def.name,
    status: 'running',
    startedAt: now(),
    reasoning: 'Simulating workflow triggers: notifications, dashboard, pricing updates...',
    outputSummary: '',
  };
  updateTrace(trace, entry, onProgress);

  const parsed = await generateJson<{
    simulatedActions: SimulatedAction[];
    executionLog: string[];
    impactMetricLabel: string;
    beforeMetric: string;
    afterMetric: string;
  }>(`
You are the Execution Agent. SIMULATE executing the recommended actions in a business system.
Return ONLY JSON:
{
  "simulatedActions": [{ "title": string, "description": string, "icon": "single emoji" }],
  "executionLog": ["exactly 6 plain log lines, no timestamps"],
  "impactMetricLabel": "relevant KPI name",
  "beforeMetric": "current value e.g. 14.2%",
  "afterMetric": "projected value after actions"
}
- simulatedActions: exactly 3 items mapping to the recommended actions

Industry: ${INDUSTRY_CONTEXT[industry]}
Risk context: ${riskSummary}
Actions to simulate: ${actions.join('; ')}

Document:
"""${text.slice(0, 2000)}"""
`);

  const completed: AgentTraceEntry = {
    ...entry,
    status: 'complete',
    completedAt: now(),
    reasoning: `Simulated ${parsed.simulatedActions.length} system actions. Projected ${parsed.impactMetricLabel}: ${parsed.beforeMetric} → ${parsed.afterMetric}`,
    outputSummary: `${parsed.beforeMetric} → ${parsed.afterMetric}`,
  };
  updateTrace(trace, completed, onProgress);
  return parsed;
}

/** Run the full 5-agent insight-to-action pipeline with live trace updates. */
export async function runAgentOrchestration(
  text: string,
  industry: IndustryType = 'general',
  onProgress?: OrchestratorCallback,
): Promise<AnalysisResult> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const inputError = validateAnalysisInput(text);
  if (inputError) throw new Error(inputError);

  const trimmed = text.trim();
  const trace: AgentTraceEntry[] = AGENT_PIPELINE.map((a) => ({
    agentId: a.id,
    agentName: a.name,
    status: 'pending' as const,
    reasoning: 'Waiting for orchestrator...',
    outputSummary: '',
  }));
  onProgress?.([...trace]);

  try {
    const ingestion = await runIngestionAgent(trimmed, industry, trace, onProgress);
    const insight = await runInsightAgent(trimmed, industry, ingestion.signals, trace, onProgress);
    const risk = await runRiskAgent(trimmed, industry, insight, trace, onProgress);
    const action = await runActionAgent(
      trimmed,
      industry,
      `${insight.executiveSummary} Risks: ${risk.riskAssessment.join('; ')}`,
      trace,
      onProgress,
    );
    const execution = await runExecutionAgent(
      trimmed,
      industry,
      action.recommendedActions,
      `Risk ${risk.riskScore}, ${risk.estimatedImpact}`,
      trace,
      onProgress,
    );

    return {
      executiveSummary: insight.executiveSummary,
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
