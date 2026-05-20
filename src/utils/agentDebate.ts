import type {
  AgentDebate,
  AgentDebateViewpoint,
  AnalysisResult,
} from '@/types/analysis';

export function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseViewpoint(raw: unknown): AgentDebateViewpoint | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const recommendedApproach = String(
    o.recommendedApproach || o.approach || '',
  ).trim();
  if (!recommendedApproach) return null;
  return {
    recommendedApproach,
    concern: String(o.concern || '').trim(),
    confidence: clampConfidence(Number(o.confidence) || 0),
  };
}

export function parseAgentDebate(raw: unknown): AgentDebate | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  const growth = parseViewpoint(o.growth);
  const risk = parseViewpoint(o.risk);
  const finance = parseViewpoint(o.finance);
  const finalConclusion = String(o.finalConclusion || o.conclusion || '').trim();
  const balanceExplanation = String(
    o.balanceExplanation || o.balance || '',
  ).trim();

  if (!growth || !risk || !finance || !finalConclusion) return undefined;

  return {
    growth,
    risk,
    finance,
    finalConclusion,
    balanceExplanation:
      balanceExplanation ||
      'The final plan balances speed, safety, and cost based on the report.',
  };
}

function hasUsableDebate(debate: AgentDebate): boolean {
  return (
    debate.growth.recommendedApproach.length > 0 &&
    debate.risk.recommendedApproach.length > 0 &&
    debate.finance.recommendedApproach.length > 0 &&
    debate.finalConclusion.length > 8
  );
}

function trimSentence(text: string, max = 140): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

export function buildFallbackAgentDebate(results: AnalysisResult): AgentDebate {
  const chosenAction =
    results.autonomousDecision?.primaryDecision ||
    results.recommendedActions[0] ||
    'Fix the main problem from the report first.';

  const risk1 = results.riskAssessment[0] || 'Problems could keep getting worse.';
  const risk2 =
    results.riskAssessment[1] || 'Teams may struggle if we move without a clear plan.';
  const risk3 =
    results.riskAssessment[2] || 'Costs could rise if we spend without limits.';

  const stake = results.stakeAtRisk?.trim();
  const nothing = results.doNothingOutlook || results.estimatedImpact;
  const ifAct = results.doActionOutlook || results.autonomousDecision?.expectedOutcome;
  const sure = clampConfidence(
    results.autonomousDecision?.confidence ?? results.confidence ?? 75,
  );
  const serious = clampConfidence(results.riskScore);

  const growth: AgentDebateViewpoint = {
    recommendedApproach: trimSentence(
      `Move fast: ${chosenAction}. Protect customers and stop the slide while attention is high.`,
    ),
    concern: trimSentence(
      `If we wait, ${nothing}`,
    ),
    confidence: clampConfidence(sure + 4),
  };

  const risk: AgentDebateViewpoint = {
    recommendedApproach: trimSentence(
      `Stage the work: verify data, owners, and checkpoints before fully rolling out — still aim for "${chosenAction.slice(0, 60)}".`,
    ),
    concern: trimSentence(
      `Rushing could trigger: ${risk2}`,
    ),
    confidence: clampConfidence(58 + (100 - serious) * 0.25),
  };

  const finance: AgentDebateViewpoint = {
    recommendedApproach: trimSentence(
      stake
        ? `Approve "${chosenAction}" with a capped budget and clear ROI review tied to ${stake}.`
        : `Approve "${chosenAction}" with spending limits and weekly cost check-ins.`,
    ),
    concern: trimSentence(
      `Without guardrails: ${risk3}`,
    ),
    confidence: clampConfidence(sure - 3),
  };

  const finalConclusion = trimSentence(
    results.autonomousDecision?.primaryDecision
      ? results.autonomousDecision.primaryDecision
      : chosenAction,
    160,
  );

  const balanceExplanation = trimSentence(
    results.autonomousDecision?.reason
      ? `${results.autonomousDecision.reason} Growth wanted speed, Risk wanted controls, and Finance wanted limits — this plan does all three.`
      : `Growth pushed for quick customer action, Risk asked for staged checks, and Finance asked for spending caps. The final pick "${finalConclusion}" reflects that mix.${ifAct ? ` Expected result: ${ifAct}` : ''}`,
    280,
  );

  return {
    growth,
    risk,
    finance,
    finalConclusion,
    balanceExplanation,
  };
}

export function getAgentDebate(results: AnalysisResult): {
  debate: AgentDebate;
  fromAi: boolean;
} {
  const parsed = results.agentDebate;
  if (parsed && hasUsableDebate(parsed)) {
    return { debate: parsed, fromAi: true };
  }
  return { debate: buildFallbackAgentDebate(results), fromAi: false };
}
