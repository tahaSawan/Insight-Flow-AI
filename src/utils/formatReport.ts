import type { AnalysisResult } from '@/types/analysis';

export function formatReportAsText(results: AnalysisResult): string {
  const lines = [
    '═══════════════════════════════════',
    '       INSIGHTFLOW AI — YOUR REPORT',
    '═══════════════════════════════════',
    '',
    'QUICK SUMMARY',
    results.executiveSummary,
    '',
    `How serious (0-100): ${results.riskScore}`,
    `How sure the AI is: ${results.confidence}%`,
    `Urgency: ${results.priorityLevel}`,
    `If nothing is done: ${results.estimatedImpact}`,
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
