import type { AnalysisResult } from '@/types/analysis';
import { getDecisionScorecardScores } from '@/utils/decisionScorecard';

export function formatReportAsText(results: AnalysisResult): string {
  const scores = getDecisionScorecardScores(results);
  const lines = [
    '═══════════════════════════════════',
    '       INSIGHTFLOW AI — YOUR REPORT',
    '═══════════════════════════════════',
    '',
    'QUICK SUMMARY',
    results.executiveSummary,
    '',
    ...(results.urgencyHeadline ? [`ALERT: ${results.urgencyHeadline}`] : []),
    ...(results.stakeAtRisk ? [`AT STAKE: ${results.stakeAtRisk}`] : []),
    ...(results.doNothingOutlook
      ? ['', 'IF WE DO NOTHING:', results.doNothingOutlook]
      : []),
    ...(results.doActionOutlook ? ['IF WE ACT:', results.doActionOutlook] : []),
    '',
    `How serious (0-100): ${results.riskScore}`,
    `How sure the AI is: ${results.confidence}%`,
    `Urgency: ${results.priorityLevel}`,
    `If nothing is done: ${results.estimatedImpact}`,
    '',
    '── DECISION SCORECARD (0-100) ──',
    `Confidence: ${scores.confidence}`,
    `Urgency: ${scores.urgency}`,
    `Financial impact: ${scores.financialImpact}`,
    `Operational risk: ${scores.operationalRisk}`,
    `Execution complexity: ${scores.executionComplexity}`,
    '',
    '── MAIN POINTS ──',
    ...results.keyFindings.map((f, i) => `${i + 1}. ${f}`),
    '',
    '── WHAT COULD GO WRONG ──',
    ...results.riskAssessment.map((r, i) => `${i + 1}. ${r}`),
    '',
    '── WHAT TO DO NEXT ──',
    ...results.recommendedActions.map((a, i) => `${i + 1}. ${a}`),
    '',
    '── BEFORE VS AFTER (GUESS) ──',
    `${results.impactMetricLabel}: ${results.beforeMetric} → ${results.afterMetric}`,
    '',
    '── HOW THE AI WORKED ──',
    ...(results.agentTrace?.length
      ? results.agentTrace.map(
          (a) => `[${a.status}] ${a.agentName}: ${a.reasoning} → ${a.outputSummary}`,
        )
      : ['(No step-by-step trace)']),
    '',
    '── DEMO ACTIONS (NOT REAL) ──',
    ...results.simulatedActions.map((a) => `✓ ${a.title}: ${a.description}`),
    '',
    'Made with InsightFlow AI',
  ];
  return lines.join('\n');
}
