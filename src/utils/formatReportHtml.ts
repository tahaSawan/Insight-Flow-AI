import type { AnalysisResult } from '@/types/analysis';
import { getDecisionScorecardScores } from '@/utils/decisionScorecard';
import { getAgentDebate } from '@/utils/agentDebate';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function listItems(items: string[]): string {
  if (!items.length) return '<p class="muted">None listed</p>';
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

/** Print-friendly HTML for PDF export and submission. */
export function formatReportAsHtml(results: AnalysisResult): string {
  const scores = getDecisionScorecardScores(results);
  const { debate } = getAgentDebate(results);
  const decision = results.autonomousDecision;
  const generatedAt = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const alertBlock = results.urgencyHeadline
    ? `<div class="alert-box">
        <p class="label">Leadership alert</p>
        <p class="alert-headline">${escapeHtml(results.urgencyHeadline)}</p>
        ${results.stakeAtRisk ? `<p class="stake">At stake: ${escapeHtml(results.stakeAtRisk)}</p>` : ''}
      </div>`
    : '';

  const decisionBlock = decision
    ? `<div class="card">
        <p class="label">Autonomous decision</p>
        <p class="decision">${escapeHtml(decision.primaryDecision)}</p>
        <p class="body">${escapeHtml(decision.reason)}</p>
        <p class="meta">Priority: ${escapeHtml(decision.priorityLevel)} · Confidence: ${decision.confidence}%</p>
        <p class="body"><strong>Expected outcome:</strong> ${escapeHtml(decision.expectedOutcome)}</p>
      </div>`
    : '';

  const pathBlock =
    results.doNothingOutlook || results.doActionOutlook
      ? `<div class="two-col">
          <div class="path bad">
            <p class="label">If we do nothing</p>
            <p>${escapeHtml(results.doNothingOutlook || 'Risk compounds without intervention.')}</p>
            <p class="metric">${escapeHtml(results.beforeMetric)} → worsens</p>
          </div>
          <div class="path good">
            <p class="label">If we act</p>
            <p>${escapeHtml(results.doActionOutlook || 'Metrics stabilize with the recommended plan.')}</p>
            <p class="metric">${escapeHtml(results.beforeMetric)} → ${escapeHtml(results.afterMetric)}</p>
          </div>
        </div>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @page { margin: 48px 40px; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      color: #0f172a;
      font-size: 11pt;
      line-height: 1.45;
      margin: 0;
    }
    h1 { font-size: 20pt; margin: 0 0 4px; color: #0e7490; }
    .subtitle { color: #64748b; font-size: 10pt; margin: 0 0 20px; }
    .label {
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #64748b;
      font-weight: 700;
      margin: 0 0 6px;
    }
    .card, .alert-box {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 14px;
      background: #f8fafc;
    }
    .alert-box { border-color: #f59e0b; background: #fffbeb; }
    .alert-headline { font-size: 13pt; font-weight: 700; margin: 0 0 6px; }
    .stake { color: #b45309; font-weight: 600; margin: 0; }
    .decision { font-size: 12pt; font-weight: 700; margin: 0 0 8px; }
    .body { margin: 0 0 8px; }
    .meta { font-size: 9pt; color: #64748b; margin: 0 0 8px; }
    .metrics {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }
    .metric-pill {
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      min-width: 100px;
    }
    .metric-pill strong { display: block; font-size: 14pt; color: #0e7490; }
    .two-col { display: flex; gap: 12px; margin-bottom: 14px; }
    .path {
      flex: 1;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid #e2e8f0;
    }
    .path.bad { background: #fef2f2; border-color: #fecaca; }
    .path.good { background: #ecfdf5; border-color: #a7f3d0; }
    .path .metric { font-weight: 700; font-size: 10pt; margin: 8px 0 0; }
    h2 {
      font-size: 11pt;
      color: #0e7490;
      border-bottom: 2px solid #22d3ee;
      padding-bottom: 4px;
      margin: 18px 0 10px;
    }
    ul { margin: 0; padding-left: 18px; }
    li { margin-bottom: 6px; }
    .muted { color: #94a3b8; font-size: 9pt; }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 9pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <h1>InsightFlow AI</h1>
  <p class="subtitle">Executive decision report · Generated ${escapeHtml(generatedAt)}</p>

  <div class="metrics">
    <div class="metric-pill"><span class="label">Risk score</span><strong>${results.riskScore}</strong></div>
    <div class="metric-pill"><span class="label">Confidence</span><strong>${results.confidence}%</strong></div>
    <div class="metric-pill"><span class="label">Priority</span><strong>${escapeHtml(results.priorityLevel)}</strong></div>
  </div>

  ${alertBlock}

  <h2>Executive summary</h2>
  <p>${escapeHtml(results.executiveSummary)}</p>
  <p class="muted">${escapeHtml(results.estimatedImpact)}</p>

  ${decisionBlock}
  ${pathBlock}

  <h2>Key findings</h2>
  ${listItems(results.keyFindings)}

  <h2>Risk assessment</h2>
  ${listItems(results.riskAssessment)}

  <h2>Recommended actions</h2>
  ${listItems(results.recommendedActions)}

  <h2>Decision scorecard</h2>
  <p>Confidence ${scores.confidence} · Urgency ${scores.urgency} · Financial ${scores.financialImpact} · Operational ${scores.operationalRisk} · Execution ${scores.executionComplexity}</p>

  <h2>AI advisor debate</h2>
  <p><strong>Growth:</strong> ${escapeHtml(debate.growth.recommendedApproach)}</p>
  <p><strong>Risk:</strong> ${escapeHtml(debate.risk.recommendedApproach)}</p>
  <p><strong>Finance:</strong> ${escapeHtml(debate.finance.recommendedApproach)}</p>
  <p><strong>Final:</strong> ${escapeHtml(debate.finalConclusion)}</p>

  <h2>Impact projection</h2>
  <p><strong>${escapeHtml(results.impactMetricLabel)}:</strong> ${escapeHtml(results.beforeMetric)} → ${escapeHtml(results.afterMetric)}</p>

  <p class="muted">Simulated actions (Slack, email, CRM) are illustrative only and were not sent to live systems.</p>

  <div class="footer">InsightFlow AI · Multi-agent analysis powered by Gemini</div>
</body>
</html>`;
}
