import type { AnalysisResult, DecisionScorecardScores } from '@/types/analysis';

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/** Turn stake text like "$2.1M ARR" into a 0–25 boost for financial impact. */
function stakeFinancialBoost(stake?: string): number {
  if (!stake?.trim()) return 0;
  const text = stake.toLowerCase();

  const million = text.match(/([\d.]+)\s*m(?:illion)?/);
  if (million) return clampScore(parseFloat(million[1]) * 10);

  const thousand = text.match(/([\d.]+)\s*k/);
  if (thousand) return clampScore(parseFloat(thousand[1]) * 0.4);

  const dollars = text.match(/\$\s*([\d,]+(?:\.\d+)?)/);
  if (dollars) {
    const raw = parseFloat(dollars[1].replace(/,/g, ''));
    if (raw >= 1_000_000) return clampScore((raw / 1_000_000) * 10);
    if (raw >= 10_000) return clampScore((raw / 100_000) * 8);
  }

  if (/%/.test(text)) {
    const pct = text.match(/([\d.]+)\s*%/);
    if (pct) return clampScore(parseFloat(pct[1]) * 1.2);
  }

  return 5;
}

function priorityUrgencyBase(priority: string): number {
  const level = priority.toLowerCase();
  if (level === 'high') return 88;
  if (level === 'medium') return 58;
  if (level === 'low') return 32;
  return 55;
}

function computeFallbackScores(results: AnalysisResult): DecisionScorecardScores {
  const risk = clampScore(results.riskScore);
  const priority =
    results.autonomousDecision?.priorityLevel || results.priorityLevel || 'Medium';
  const confidence = clampScore(
    results.autonomousDecision?.confidence ?? results.confidence ?? 80,
  );

  const urgency = clampScore(priorityUrgencyBase(priority) * 0.55 + risk * 0.45);

  const stakeBoost = stakeFinancialBoost(results.stakeAtRisk);
  const financialImpact = clampScore(risk * 0.62 + stakeBoost + (results.estimatedImpact ? 6 : 0));

  const operationalRisk = risk;

  const actionCount = results.recommendedActions?.length ?? 3;
  const channelCount = new Set(
    (results.simulatedActions ?? []).map((a) => a.channel).filter(Boolean),
  ).size;
  const executionComplexity = clampScore(
    24 + actionCount * 9 + channelCount * 6 + (risk >= 70 ? 14 : risk >= 45 ? 6 : 0),
  );

  return {
    confidence,
    urgency,
    financialImpact,
    operationalRisk,
    executionComplexity,
  };
}

function hasUsableAiScores(scores: DecisionScorecardScores): boolean {
  return Object.values(scores).some((value) => value > 0);
}

export function getDecisionScorecardScores(results: AnalysisResult): DecisionScorecardScores {
  const fromAi = results.decisionScores;
  if (fromAi) {
    const normalized = {
      confidence: clampScore(fromAi.confidence),
      urgency: clampScore(fromAi.urgency),
      financialImpact: clampScore(fromAi.financialImpact),
      operationalRisk: clampScore(fromAi.operationalRisk),
      executionComplexity: clampScore(fromAi.executionComplexity),
    };
    if (hasUsableAiScores(normalized)) {
      return normalized;
    }
  }
  return computeFallbackScores(results);
}

export function scoreSeverityLabel(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}
