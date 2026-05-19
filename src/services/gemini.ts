import { GoogleGenerativeAI } from '@google/generative-ai';
import { MIN_CONTENT_LENGTH } from '@/constants/sampleReport';
import { PLAIN_LANGUAGE_AI_RULES } from '@/constants/plainLanguage';
import type { AnalysisResult, IndustryType, SimulatedAction, UseCaseType } from '@/types/analysis';
import { getUseCaseHint } from '@/constants/useCases';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

const GEMINI_MODEL =
  process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-2.0-flash';

/** Ordered by reliability when API traffic is high (503). */
const MODEL_POOL = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-2.0-flash-lite',
];

const MAX_RETRIES_PER_MODEL = 3;

const RETRYABLE_HINTS = [
  '503',
  '429',
  '500',
  '502',
  '504',
  'high demand',
  'overloaded',
  'rate limit',
  'resource exhausted',
  'try again',
  'unavailable',
];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableGeminiError(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return RETRYABLE_HINTS.some((hint) => message.includes(hint));
}

export function toFriendlyGeminiError(error: unknown): string {
  if (isRetryableGeminiError(error)) {
    return 'Gemini is temporarily busy (high demand). Tap Retry — we auto-switch models and retry.';
  }
  return error instanceof Error ? error.message : 'Analysis failed. Please try again.';
}

const INDUSTRY_CONTEXT: Record<IndustryType, string> = {
  general: 'Analyze from a general business leadership perspective.',
  finance: 'Analyze from a finance and compliance perspective. Emphasize revenue, risk exposure, and regulatory factors.',
  healthcare: 'Analyze from a healthcare operations perspective. Emphasize patient outcomes, compliance (HIPAA), and care delivery.',
  technology: 'Analyze from a technology and product perspective. Emphasize engineering quality, uptime, security, and customer adoption.',
};

const ANALYSIS_PROMPT = `
You are InsightFlow AI. Use very simple English anyone can understand.
Analyze the document and return ONLY a raw JSON object (no markdown).

${PLAIN_LANGUAGE_AI_RULES}

Required JSON keys:
- executiveSummary: string (2-3 short sentences, plain English)
- riskScore: number (0-100) — how serious the main problem is
- confidence: number (0-100) — how sure you are
- priorityLevel: string ("High", "Medium", or "Low") — how urgent
- estimatedImpact: string (one simple sentence: what could happen if nobody acts)
- urgencyHeadline: string (max 12 words — the one thing a CEO must know today)
- stakeAtRisk: string (a number from the doc: dollars, %, customers, hours — e.g. "$2.1M ARR" or "41h support wait")
- doNothingOutlook: string (one sentence: worst realistic outcome if no action in 30 days)
- doActionOutlook: string (one sentence: realistic outcome if recommended actions run)
- keyFindings: string[] (exactly 3 short bullets — main points)
- riskAssessment: string[] (exactly 3 short bullets — what could go wrong)
- recommendedActions: string[] (exactly 3 short bullets — what to do next, start with a verb)
- impactMetricLabel: string (simple name, max 4 words, e.g. "Lost customers")
- beforeMetric: string (situation now, e.g. "25% drop")
- afterMetric: string (situation after fixes, e.g. "10% drop")
- simulatedActions: array of exactly 3 objects: { title, description, icon, channel: "slack"|"email"|"crm"|"dashboard", notificationPreview: string (short mock message body) }
- executionLog: string[] (exactly 6 short log lines, no timestamps, plain English)
`;

export async function generateJson<T>(prompt: string): Promise<T> {
  const text = await generateWithGemini(prompt, true);
  try {
    return JSON.parse(text.trim()) as T;
  } catch {
    throw new Error('AI returned an invalid response. Please try again.');
  }
}

async function generateWithGemini(prompt: string, jsonMode = true): Promise<string> {
  const modelsToTry = [
    GEMINI_MODEL,
    ...MODEL_POOL.filter((m) => m !== GEMINI_MODEL),
  ];
  let lastError: unknown;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          ...(jsonMode
            ? { generationConfig: { responseMimeType: 'application/json' } }
            : {}),
        });
        return (await result.response).text();
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        const is404 = message.includes('404') || message.includes('not found');

        if (is404) {
          break;
        }

        if (isRetryableGeminiError(error) && attempt < MAX_RETRIES_PER_MODEL - 1) {
          await sleep(1200 * 2 ** attempt);
          continue;
        }

        if (isRetryableGeminiError(error)) {
          break;
        }

        throw error;
      }
    }
  }

  throw new Error(toFriendlyGeminiError(lastError));
}

const CHANNELS: SimulatedAction['channel'][] = ['slack', 'email', 'crm', 'dashboard'];

function parseSimulatedActions(raw: unknown): SimulatedAction[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 3).map((item, i) => {
    const obj = item as Record<string, unknown>;
    const ch = String(obj.channel || CHANNELS[i] || 'system');
    const channel = (CHANNELS.includes(ch as SimulatedAction['channel'])
      ? ch
      : CHANNELS[i]) as SimulatedAction['channel'];
    return {
      title: String(obj.title || `Action ${i + 1}`),
      description: String(obj.description || 'Executed successfully'),
      icon: String(obj.icon || '✅'),
      channel,
      notificationPreview: String(
        obj.notificationPreview || obj.description || 'Action completed in demo mode.',
      ),
    };
  });
}

function parseAnalysisResponse(parsedData: Record<string, unknown>): AnalysisResult {
  const recommended = Array.isArray(parsedData.recommendedActions)
    ? parsedData.recommendedActions.map(String)
    : ['Monitor situation closely'];

  const defaultActions: SimulatedAction[] = recommended.slice(0, 3).map((action, i) => ({
    title: ['Dashboard Updated', 'Alert Triggered', 'Stakeholder Brief'][i] || 'Action Executed',
    description: action,
    icon: ['📊', '🔔', '✉️'][i] || '✅',
    channel: CHANNELS[i],
    notificationPreview: action,
  }));

  const simulatedActions = parseSimulatedActions(parsedData.simulatedActions);
  const actions = simulatedActions.length >= 3 ? simulatedActions : defaultActions;

  const executionLog = Array.isArray(parsedData.executionLog)
    ? parsedData.executionLog.map(String)
    : [
        'Read the document',
        'Checked how serious the problems are',
        `Found ${Array.isArray(parsedData.riskAssessment) ? parsedData.riskAssessment.length : 3} things that could go wrong`,
        'Wrote next steps',
        'Ran pretend demo actions',
        'Report ready',
      ];

  return {
    executiveSummary: String(
      parsedData.executiveSummary ||
        parsedData.estimatedImpact ||
        'Analysis completed successfully.',
    ),
    riskScore: Math.min(100, Math.max(0, Number(parsedData.riskScore) || 50)),
    confidence: Math.min(100, Math.max(0, Number(parsedData.confidence) || 80)),
    priorityLevel: String(parsedData.priorityLevel || 'Medium'),
    estimatedImpact: String(parsedData.estimatedImpact || 'Operational improvement possible'),
    urgencyHeadline: String(
      parsedData.urgencyHeadline ||
        parsedData.executiveSummary?.toString().slice(0, 80) ||
        'Review required',
    ),
    stakeAtRisk: String(parsedData.stakeAtRisk || 'Impact under review'),
    doNothingOutlook: String(
      parsedData.doNothingOutlook ||
        parsedData.estimatedImpact ||
        'Problems may get worse without action.',
    ),
    doActionOutlook: String(
      parsedData.doActionOutlook || 'Following the plan should improve key metrics.',
    ),
    keyFindings: Array.isArray(parsedData.keyFindings)
      ? parsedData.keyFindings.map(String)
      : ['Insight generation completed'],
    riskAssessment: Array.isArray(parsedData.riskAssessment)
      ? parsedData.riskAssessment.map(String)
      : ['Risk profile evaluated'],
    recommendedActions: recommended,
    impactMetricLabel: String(
      parsedData.impactMetricLabel ||
        (parsedData.beforeChurn ? 'Churn Rate' : 'Key Metric'),
    ),
    beforeMetric: String(
      parsedData.beforeMetric || parsedData.beforeChurn || 'N/A',
    ),
    afterMetric: String(parsedData.afterMetric || parsedData.afterChurn || 'N/A'),
    simulatedActions: actions,
    executionLog: executionLog.slice(0, 8),
    agentTrace: [],
  };
}

export function getGeminiConfigError(): string | null {
  if (!apiKey.trim()) {
    return 'Gemini API key is missing. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env file and restart Expo.';
  }
  return null;
}

export function validateAnalysisInput(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) {
    return 'Please paste a report or load the sample report before analyzing.';
  }
  if (trimmed.length < MIN_CONTENT_LENGTH) {
    return `Please provide at least ${MIN_CONTENT_LENGTH} characters of content for meaningful analysis.`;
  }
  return null;
}

function buildFastModeTrace(): import('@/types/agents').AgentTraceEntry[] {
  const completedAt = new Date().toISOString();
  return [
    {
      agentId: 'ingestion',
      agentName: 'Quick mode',
      status: 'complete',
      startedAt: completedAt,
      completedAt,
      reasoning: 'Quick mode: one AI pass did all steps at once (read, find points, spot problems, suggest fixes).',
      outputSummary: 'Done in one go — same report as step-by-step mode.',
    },
  ];
}

/** Single API call — faster, fewer 503 failures. Same report structure as full mode. */
function useCaseBlock(useCase: UseCaseType): string {
  return `Scenario: ${getUseCaseHint(useCase)}`;
}

export async function analyzeContentFast(
  text: string,
  industry: IndustryType = 'general',
  useCase: UseCaseType = 'board',
): Promise<AnalysisResult> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const inputError = validateAnalysisInput(text);
  if (inputError) throw new Error(inputError);

  const prompt = `${ANALYSIS_PROMPT}\n\nIndustry context: ${INDUSTRY_CONTEXT[industry]}\n${useCaseBlock(useCase)}\n\nDocument:\n"""${text.trim()}"""`;

  const responseText = await generateWithGemini(prompt, true);
  let parsedData: Record<string, unknown>;
  try {
    parsedData = JSON.parse(responseText.trim());
  } catch {
    throw new Error('AI returned an invalid response. Please try again.');
  }

  const result = parseAnalysisResponse(parsedData);
  result.agentTrace = buildFastModeTrace();
  return result;
}

export async function analyzeContent(
  text: string,
  industry: IndustryType = 'general',
): Promise<AnalysisResult> {
  const { runAgentOrchestration } = await import('@/services/agentOrchestrator');
  return runAgentOrchestration(text, industry);
}

export async function extractTextFromPdf(base64Pdf: string): Promise<string> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const modelsToTry = [GEMINI_MODEL, ...MODEL_POOL.filter((m) => m !== GEMINI_MODEL)];
  let lastError: unknown;

  for (const modelName of modelsToTry) {
    for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent({
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
                {
                  text: 'Extract ALL readable text from this PDF. Return only the extracted text with paragraph breaks. No commentary.',
                },
              ],
            },
          ],
        });
        const extracted = (await result.response).text().trim();
        if (extracted.length < 50) {
          throw new Error('Could not extract enough text from this PDF.');
        }
        return extracted;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('404') || message.includes('not found')) break;
        if (isRetryableGeminiError(error) && attempt < MAX_RETRIES_PER_MODEL - 1) {
          await sleep(1200 * 2 ** attempt);
          continue;
        }
        if (isRetryableGeminiError(error)) break;
        throw error;
      }
    }
  }

  throw new Error(toFriendlyGeminiError(lastError));
}

export async function explainInsight(
  documentText: string,
  analysis: AnalysisResult,
  insightText: string,
  insightType: 'finding' | 'risk' | 'action',
): Promise<string> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const prompt = `
Explain this in 2-3 very simple sentences (no jargon). Say why it matters and what to do.
${PLAIN_LANGUAGE_AI_RULES}

DOCUMENT (excerpt):
${documentText.slice(0, 2500)}

CONTEXT: ${analysis.executiveSummary}

${insightType.toUpperCase()} TO EXPLAIN: ${insightText}
`;

  return (await generateWithGemini(prompt, false)).trim();
}

export async function askFollowUp(
  documentText: string,
  analysis: AnalysisResult,
  question: string,
): Promise<string> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const trimmedQuestion = question.trim();
  if (!trimmedQuestion) {
    throw new Error('Please enter a question.');
  }

  const context = `
Answer in plain, simple English (2-4 short sentences). Only use the document and analysis below.
${PLAIN_LANGUAGE_AI_RULES}

DOCUMENT (excerpt):
${documentText.slice(0, 3000)}

ANALYSIS SUMMARY:
${analysis.executiveSummary}
Key findings: ${analysis.keyFindings.join('; ')}
Risks: ${analysis.riskAssessment.join('; ')}
Recommended actions: ${analysis.recommendedActions.join('; ')}

USER QUESTION: ${trimmedQuestion}
`;

  return (await generateWithGemini(context, false)).trim();
}

export async function generateExecutiveBrief(
  documentText: string,
  analysis: AnalysisResult,
): Promise<string[]> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const prompt = `
Create 4 very simple bullets anyone can say in a presentation (max 12 words each).
${PLAIN_LANGUAGE_AI_RULES}
Return ONLY JSON: { "bullets": string[] }

DOCUMENT (excerpt):
${documentText.slice(0, 2000)}

ANALYSIS:
${analysis.executiveSummary}
Urgency: ${analysis.priorityLevel} | How serious: ${analysis.riskScore}/100
`;

  const responseText = await generateWithGemini(prompt, true);
  const parsed = JSON.parse(responseText.trim()) as { bullets?: string[] };
  if (Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
    return parsed.bullets.map(String).slice(0, 4);
  }
  return [
    analysis.executiveSummary,
    `Urgency: ${analysis.priorityLevel} — seriousness ${analysis.riskScore}/100`,
    `First step: ${analysis.recommendedActions[0]}`,
    `${analysis.impactMetricLabel}: ${analysis.beforeMetric} → ${analysis.afterMetric}`,
  ];
}

// Re-export type for convenience
export type { AnalysisResult } from '@/types/analysis';
