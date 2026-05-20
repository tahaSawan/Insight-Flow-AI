import { jsPDF } from 'jspdf';
import type { AnalysisResult } from '@/types/analysis';
import { getDecisionScorecardScores } from '@/utils/decisionScorecard';
import { getAgentDebate } from '@/utils/agentDebate';

const MARGIN = 54;
const BODY = 13;
const H2 = 12;
const TITLE = 18;

/** Builds and downloads a text-based executive report PDF in the browser. */
export function downloadReportPdfWeb(results: AnalysisResult, filename: string): void {
  const pdf = new jsPDF({ unit: 'pt', format: 'letter', orientation: 'portrait' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const maxW = pageW - MARGIN * 2;
  let y = MARGIN;

  const ensureSpace = (extra = BODY) => {
    if (y + extra > pageH - MARGIN) {
      pdf.addPage();
      y = MARGIN;
    }
  };

  const writeLines = (
    content: string,
    opts?: { bold?: boolean; size?: number; gapAfter?: number },
  ) => {
    const size = opts?.size ?? 10;
    pdf.setFontSize(size);
    pdf.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    pdf.setTextColor(15, 23, 42);
    const lines = pdf.splitTextToSize(content, maxW) as string[];
    for (const line of lines) {
      ensureSpace();
      pdf.text(line, MARGIN, y);
      y += BODY;
    }
    y += opts?.gapAfter ?? 4;
  };

  const section = (title: string) => {
    ensureSpace(H2 + 16);
    y += 6;
    pdf.setFontSize(H2);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(14, 116, 144);
    pdf.text(title, MARGIN, y);
    y += 10;
    pdf.setDrawColor(34, 211, 238);
    pdf.setLineWidth(0.75);
    pdf.line(MARGIN, y, pageW - MARGIN, y);
    y += 12;
  };

  const bullets = (items: string[]) => {
    for (const item of items) {
      const lines = pdf.splitTextToSize(`• ${item}`, maxW - 12) as string[];
      for (let i = 0; i < lines.length; i++) {
        ensureSpace();
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(30, 41, 59);
        pdf.text(lines[i], MARGIN + (i === 0 ? 0 : 12), y);
        y += BODY;
      }
      y += 2;
    }
    y += 4;
  };

  const scores = getDecisionScorecardScores(results);
  const { debate } = getAgentDebate(results);
  const decision = results.autonomousDecision;
  const generatedAt = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  writeLines('InsightFlow AI', { bold: true, size: TITLE, gapAfter: 2 });
  writeLines(`Executive Decision Report · ${generatedAt}`, { size: 9, gapAfter: 10 });
  writeLines(
    `Risk score ${results.riskScore} · Confidence ${results.confidence}% · Priority ${results.priorityLevel}`,
    { gapAfter: 8 },
  );

  if (results.urgencyHeadline) {
    section('Leadership alert');
    writeLines(results.urgencyHeadline, { bold: true, size: 11 });
    if (results.stakeAtRisk) writeLines(`At stake: ${results.stakeAtRisk}`);
  }

  section('Executive summary');
  writeLines(results.executiveSummary);
  writeLines(`If nothing is done: ${results.estimatedImpact}`, { gapAfter: 6 });

  if (decision) {
    section('Autonomous decision');
    writeLines(decision.primaryDecision, { bold: true, size: 11 });
    writeLines(decision.reason);
    writeLines(
      `Priority: ${decision.priorityLevel} · Confidence: ${decision.confidence}%`,
    );
    writeLines(`Expected outcome: ${decision.expectedOutcome}`);
  }

  if (results.doNothingOutlook || results.doActionOutlook) {
    section('Consequence paths');
    writeLines(`Path A — Do nothing: ${results.doNothingOutlook || 'Risk compounds.'}`);
    writeLines(
      `Path B — Act now: ${results.doActionOutlook || 'Metrics improve with the plan.'}`,
    );
    writeLines(
      `${results.impactMetricLabel}: ${results.beforeMetric} → ${results.afterMetric}`,
    );
  }

  section('Key findings');
  bullets(results.keyFindings);

  section('Risk assessment');
  bullets(results.riskAssessment);

  section('Recommended actions');
  bullets(results.recommendedActions);

  section('Decision scorecard (0–100)');
  writeLines(
    `Confidence ${scores.confidence} · Urgency ${scores.urgency} · Financial impact ${scores.financialImpact}`,
  );
  writeLines(
    `Operational risk ${scores.operationalRisk} · Execution complexity ${scores.executionComplexity}`,
  );

  section('AI advisor debate');
  writeLines(`Growth: ${debate.growth.recommendedApproach}`);
  writeLines(`Growth concern: ${debate.growth.concern}`);
  writeLines(`Risk: ${debate.risk.recommendedApproach}`);
  writeLines(`Risk concern: ${debate.risk.concern}`);
  writeLines(`Finance: ${debate.finance.recommendedApproach}`);
  writeLines(`Finance concern: ${debate.finance.concern}`);
  writeLines(`Final decision: ${debate.finalConclusion}`);
  writeLines(debate.balanceExplanation);

  if (results.agentTrace?.length) {
    section('Agent workflow trace');
    for (const entry of results.agentTrace) {
      writeLines(
        `${entry.agentName} [${entry.status}]: ${entry.outputSummary || entry.reasoning}`,
        { size: 9 },
      );
    }
  }

  section('Simulated actions (demo only)');
  for (const action of results.simulatedActions) {
    writeLines(`${action.title}: ${action.description}`, { size: 9 });
  }

  ensureSpace(24);
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    'InsightFlow AI · Analysis powered by Gemini · Simulated channels were not sent to live systems.',
    MARGIN,
    pageH - MARGIN,
  );

  pdf.save(filename);
}
