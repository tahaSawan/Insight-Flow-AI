import { PDFDocument, StandardFonts, rgb, type PDFPage, type PDFFont } from 'pdf-lib';
import type { AnalysisResult } from '@/types/analysis';
import { getDecisionScorecardScores } from '@/utils/decisionScorecard';
import { getAgentDebate } from '@/utils/agentDebate';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const BODY_SIZE = 10;
const BODY_LINE = 14;
const H2_SIZE = 12;
const TITLE_SIZE = 18;

const TEXT_COLOR = rgb(0.06, 0.09, 0.15);
const MUTED_COLOR = rgb(0.39, 0.45, 0.55);
const ACCENT_COLOR = rgb(0.05, 0.45, 0.56);

/** Keep PDF fonts happy (Helvetica WinAnsi). */
function sanitizeForPdf(text: string): string {
  return text
    .replace(/\u2022/g, '- ')
    .replace(/\u2192/g, '->')
    .replace(/\u2014/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, ' ');
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const safe = sanitizeForPdf(text);
  const words = safe.split(/\s+/).filter(Boolean);
  if (!words.length) return [''];

  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(candidate, size);
    if (width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

type PdfWriter = {
  drawLines: (
    text: string,
    opts?: { bold?: boolean; size?: number; color?: ReturnType<typeof rgb>; gapAfter?: number },
  ) => void;
  section: (title: string) => void;
  bullets: (items: string[]) => void;
};

function createPdfWriter(
  page: PDFPage,
  font: PDFFont,
  bold: PDFFont,
  addPage: () => PDFPage,
): { writer: PdfWriter; getPage: () => PDFPage } {
  let currentPage = page;
  let y = PAGE_HEIGHT - MARGIN;
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  const ensureSpace = (need: number) => {
    if (y - need < MARGIN) {
      currentPage = addPage();
      y = PAGE_HEIGHT - MARGIN;
    }
  };

  const drawLines: PdfWriter['drawLines'] = (text, opts) => {
    const size = opts?.size ?? BODY_SIZE;
    const f = opts?.bold ? bold : font;
    const color = opts?.color ?? TEXT_COLOR;
    for (const line of wrapText(text, f, size, maxWidth)) {
      ensureSpace(BODY_LINE);
      currentPage.drawText(line, {
        x: MARGIN,
        y: y - size,
        size,
        font: f,
        color,
      });
      y -= BODY_LINE;
    }
    y -= opts?.gapAfter ?? 6;
  };

  const section: PdfWriter['section'] = (title) => {
    ensureSpace(28);
    y -= 4;
    currentPage.drawText(sanitizeForPdf(title), {
      x: MARGIN,
      y: y - H2_SIZE,
      size: H2_SIZE,
      font: bold,
      color: ACCENT_COLOR,
    });
    y -= H2_SIZE + 6;
    currentPage.drawLine({
      start: { x: MARGIN, y: y },
      end: { x: PAGE_WIDTH - MARGIN, y: y },
      thickness: 1,
      color: rgb(0.13, 0.83, 0.93),
    });
    y -= 14;
  };

  const bullets: PdfWriter['bullets'] = (items) => {
    for (const item of items) {
      for (const line of wrapText(item, font, BODY_SIZE, maxWidth - 14)) {
        ensureSpace(BODY_LINE);
        currentPage.drawText(`- ${line}`, {
          x: MARGIN + 8,
          y: y - BODY_SIZE,
          size: BODY_SIZE,
          font,
          color: TEXT_COLOR,
        });
        y -= BODY_LINE;
      }
      y -= 2;
    }
    y -= 4;
  };

  return {
    writer: { drawLines, section, bullets },
    getPage: () => currentPage,
  };
}

function buildReportContent(writer: PdfWriter, results: AnalysisResult): void {
  const scores = getDecisionScorecardScores(results);
  const { debate } = getAgentDebate(results);
  const decision = results.autonomousDecision;
  const generatedAt = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  writer.drawLines('InsightFlow AI', { bold: true, size: TITLE_SIZE, gapAfter: 4 });
  writer.drawLines(`Executive Decision Report - ${generatedAt}`, {
    size: 9,
    color: MUTED_COLOR,
    gapAfter: 10,
  });
  writer.drawLines(
    `Risk score ${results.riskScore} · Confidence ${results.confidence}% · Priority ${results.priorityLevel}`,
    { gapAfter: 8 },
  );

  if (results.urgencyHeadline) {
    writer.section('Leadership alert');
    writer.drawLines(results.urgencyHeadline, { bold: true, size: 11 });
    if (results.stakeAtRisk) writer.drawLines(`At stake: ${results.stakeAtRisk}`);
  }

  writer.section('Executive summary');
  writer.drawLines(results.executiveSummary);
  writer.drawLines(`If nothing is done: ${results.estimatedImpact}`, { gapAfter: 6 });

  if (decision) {
    writer.section('Autonomous decision');
    writer.drawLines(decision.primaryDecision, { bold: true, size: 11 });
    writer.drawLines(decision.reason);
    writer.drawLines(
      `Priority: ${decision.priorityLevel} · Confidence: ${decision.confidence}%`,
    );
    writer.drawLines(`Expected outcome: ${decision.expectedOutcome}`);
  }

  if (results.doNothingOutlook || results.doActionOutlook) {
    writer.section('Consequence paths');
    writer.drawLines(`Path A - Do nothing: ${results.doNothingOutlook || 'Risk compounds.'}`);
    writer.drawLines(
      `Path B - Act now: ${results.doActionOutlook || 'Metrics improve with the plan.'}`,
    );
    writer.drawLines(
      `${results.impactMetricLabel}: ${results.beforeMetric} -> ${results.afterMetric}`,
    );
  }

  writer.section('Key findings');
  writer.bullets(results.keyFindings);

  writer.section('Risk assessment');
  writer.bullets(results.riskAssessment);

  writer.section('Recommended actions');
  writer.bullets(results.recommendedActions);

  writer.section('Decision scorecard (0-100)');
  writer.drawLines(
    `Confidence ${scores.confidence} · Urgency ${scores.urgency} · Financial impact ${scores.financialImpact}`,
  );
  writer.drawLines(
    `Operational risk ${scores.operationalRisk} · Execution complexity ${scores.executionComplexity}`,
  );

  writer.section('AI advisor debate');
  writer.drawLines(`Growth: ${debate.growth.recommendedApproach}`);
  writer.drawLines(`Growth concern: ${debate.growth.concern}`);
  writer.drawLines(`Risk: ${debate.risk.recommendedApproach}`);
  writer.drawLines(`Risk concern: ${debate.risk.concern}`);
  writer.drawLines(`Finance: ${debate.finance.recommendedApproach}`);
  writer.drawLines(`Finance concern: ${debate.finance.concern}`);
  writer.drawLines(`Final decision: ${debate.finalConclusion}`);
  writer.drawLines(debate.balanceExplanation);

  if (results.agentTrace?.length) {
    writer.section('Agent workflow trace');
    for (const entry of results.agentTrace) {
      writer.drawLines(
        `${entry.agentName} [${entry.status}]: ${entry.outputSummary || entry.reasoning}`,
        { size: 9 },
      );
    }
  }

  writer.section('Simulated actions (demo only)');
  for (const action of results.simulatedActions) {
    writer.drawLines(`${action.title}: ${action.description}`, { size: 9 });
  }
}

/** Builds and downloads a text-based executive report PDF in the browser. */
export async function downloadReportPdfWeb(
  results: AnalysisResult,
  filename: string,
): Promise<void> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('PDF export is only available in the browser.');
  }

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const { writer, getPage } = createPdfWriter(page, font, bold, () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    return page;
  });

  buildReportContent(writer, results);

  const footer = sanitizeForPdf(
    'InsightFlow AI · Analysis powered by Gemini · Simulated channels were not sent to live systems.',
  );
  getPage().drawText(footer, {
    x: MARGIN,
    y: MARGIN - 8,
    size: 8,
    font,
    color: MUTED_COLOR,
  });

  const bytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
