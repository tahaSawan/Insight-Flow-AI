import { GoogleGenerativeAI } from '@google/generative-ai';
import { MIN_CONTENT_LENGTH } from '@/constants/sampleReport';
import { PLAIN_LANGUAGE_AI_RULES } from '@/constants/plainLanguage';
import type { AnalysisResult, IndustryType, SimulatedAction, UseCaseType } from '@/types/analysis';
import { parseAgentDebate } from '@/utils/agentDebate';
import { getUseCaseHint } from '@/constants/useCases';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

/** Lite / stable IDs first — best chance on free-tier keys. */
const GEMINI_MODEL =
  process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-flash-lite-latest';

/** Fallback order when the primary model fails (404, quota, denied, or overload). */
const MODEL_POOL = [
  'gemini-flash-lite-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.5-flash',
  'gemini-flash-latest',
];

const MODEL_BLOCKLIST = /tts|image|preview-tts|nano-banana/i;

let cachedAvailableModels: string[] | null = null;

const MAX_RETRIES_PER_MODEL = 3;

const RETRYABLE_HINTS = [
  '503',
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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function getGeminiModelLabel(): string {
  return GEMINI_MODEL;
}

export function isQuotaExceededError(error: unknown): boolean {
  const message = errorMessage(error).toLowerCase();
  return (
    message.includes('quota') ||
    message.includes('exceeded your current') ||
    message.includes('billing') ||
    message.includes('limit: 0')
  );
}

export function isAccessDeniedError(error: unknown): boolean {
  const message = errorMessage(error).toLowerCase();
  return message.includes('denied access') || message.includes('permission denied');
}

export function isInvalidApiKeyError(error: unknown): boolean {
  const message = errorMessage(error).toLowerCase();
  return (
    message.includes('api key not valid') ||
    message.includes('api_key_invalid') ||
    message.includes('invalid api key')
  );
}

export function isRetryableGeminiError(error: unknown): boolean {
  if (
    isQuotaExceededError(error) ||
    isInvalidApiKeyError(error) ||
    isAccessDeniedError(error)
  ) {
    return false;
  }
  const message = errorMessage(error).toLowerCase();
  if (message.includes('429') && !message.includes('quota')) {
    return true;
  }
  return RETRYABLE_HINTS.some((hint) => message.includes(hint));
}

export function toFriendlyGeminiError(error: unknown): string {
  if (isInvalidApiKeyError(error)) {
    return 'Invalid Gemini API key. Check EXPO_PUBLIC_GEMINI_API_KEY in .env and restart Expo (npx expo start -c).';
  }
  if (isAccessDeniedError(error)) {
    return 'Google blocked this project from using Gemini models. Create a new API key at aistudio.google.com/apikey (try a different Google account), update .env, then restart Expo.';
  }
  if (isQuotaExceededError(error)) {
    return 'Gemini free quota is exhausted (limit 0). Create a new key at aistudio.google.com/apikey, use another Google account, or enable billing — then restart Expo with npx expo start -c.';
  }
  if (isRetryableGeminiError(error)) {
    return 'Gemini is temporarily busy. Tap Retry — we try alternate models automatically.';
  }
  const raw = errorMessage(error);
  if (raw.length > 180) {
    return 'Analysis failed. Check Settings → Gemini API, then try again.';
  }
  return raw || 'Analysis failed. Please try again.';
}

function isModelUnavailableError(error: unknown): boolean {
  const message = errorMessage(error);
  return message.includes('404') || message.includes('not found');
}

async function fetchAvailableModelIds(): Promise<string[]> {
  if (cachedAvailableModels) return cachedAvailableModels;
  if (!apiKey.trim()) return [];

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    const json = (await res.json()) as {
      models?: { name: string; supportedGenerationMethods?: string[] }[];
      error?: { message?: string };
    };
    if (!res.ok) {
      throw new Error(json.error?.message || `Models list failed (${res.status})`);
    }
    cachedAvailableModels = (json.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => m.name.replace('models/', ''))
      .filter((name) => !MODEL_BLOCKLIST.test(name));
    return cachedAvailableModels;
  } catch {
    return [];
  }
}

async function resolveModelsToTry(): Promise<string[]> {
  const preferred = [GEMINI_MODEL, ...MODEL_POOL.filter((m) => m !== GEMINI_MODEL)];
  const available = await fetchAvailableModelIds();
  if (!available.length) return preferred;

  const liteFirst = available.filter((m) => /lite/i.test(m));
  const rest = available.filter((m) => !/lite/i.test(m));
  const merged = [...preferred, ...liteFirst, ...rest];
  return [...new Set(merged)].filter((m) => available.includes(m));
}

/** Quick health check — used in Settings to show whether the key can generate text. */
export async function probeGeminiApi(): Promise<{
  ok: boolean;
  message: string;
  workingModel?: string;
}> {
  const configError = getGeminiConfigError();
  if (configError) return { ok: false, message: configError };

  let lastError: unknown;
  for (const modelName of await resolveModelsToTry()) {
    try {
      await invokeGeminiModel(modelName, [{ text: 'Reply with exactly: OK' }], false);
      return { ok: true, message: `Connected (${modelName})`, workingModel: modelName };
    } catch (error) {
      lastError = error;
      if (isInvalidApiKeyError(error)) {
        return { ok: false, message: toFriendlyGeminiError(error) };
      }
    }
  }
  return { ok: false, message: toFriendlyGeminiError(lastError) };
}

type GeminiPart = { text: string } | { inlineData: { mimeType: string; data: string } };

async function invokeGeminiModel(
  modelName: string,
  parts: GeminiPart[],
  jsonMode: boolean,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(jsonMode ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
  });
  const result = await model.generateContent({
    contents: [{ role: 'user', parts }],
  });
  return (await result.response).text();
}

async function generateWithModelPool(
  parts: GeminiPart[],
  jsonMode: boolean,
): Promise<string> {
  let lastError: unknown;

  for (const modelName of await resolveModelsToTry()) {
    for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        return await invokeGeminiModel(modelName, parts, jsonMode);
      } catch (error) {
        lastError = error;

        if (isInvalidApiKeyError(error)) {
          throw new Error(toFriendlyGeminiError(error));
        }

        if (
          isModelUnavailableError(error) ||
          isQuotaExceededError(error) ||
          isAccessDeniedError(error)
        ) {
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
- autonomousDecision: object containing keys:
  - primaryDecision: string (the single most important action to take first, start with a verb)
  - reason: string (one clear sentence explaining why this specific action was selected over others, plain English)
  - priorityLevel: string ("High" | "Medium" | "Low")
  - expectedOutcome: string (one sentence: the specific positive result of this action)
  - confidence: number (0-100)
- decisionScores: object with five numbers 0-100 (plain estimates from the document):
  - confidence: how sure the recommended plan is correct
  - urgency: how fast leadership must act
  - financialImpact: money, revenue, or customers at stake
  - operationalRisk: how much day-to-day operations could suffer
  - executionComplexity: how hard the plan is to carry out (people, tools, time)
- agentDebate: object — three advisors disagree, then one final pick (plain English, short sentences):
  - growth: { recommendedApproach, concern, confidence 0-100 } — favors speed, customers, revenue
  - risk: { recommendedApproach, concern, confidence 0-100 } — favors safety, checks, compliance
  - finance: { recommendedApproach, concern, confidence 0-100 } — favors budget control and ROI
  - finalConclusion: string — the single action leadership should take (match autonomousDecision.primaryDecision)
  - balanceExplanation: string — 2-3 short sentences on why the final plan balances all three views
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
  return generateWithModelPool([{ text: prompt }], jsonMode);
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

  let autonomousDecision: import('@/types/analysis').AutonomousDecision | undefined;
  if (parsedData.autonomousDecision && typeof parsedData.autonomousDecision === 'object') {
    const ad = parsedData.autonomousDecision as Record<string, unknown>;
    autonomousDecision = {
      primaryDecision: String(ad.primaryDecision || ''),
      reason: String(ad.reason || ''),
      priorityLevel: String(ad.priorityLevel || 'High'),
      expectedOutcome: String(ad.expectedOutcome || ''),
      confidence: Number(ad.confidence) || 80,
    };
  }

  let decisionScores: import('@/types/analysis').DecisionScorecardScores | undefined;
  if (parsedData.decisionScores && typeof parsedData.decisionScores === 'object') {
    const ds = parsedData.decisionScores as Record<string, unknown>;
    decisionScores = {
      confidence: Math.min(100, Math.max(0, Number(ds.confidence) || 0)),
      urgency: Math.min(100, Math.max(0, Number(ds.urgency) || 0)),
      financialImpact: Math.min(100, Math.max(0, Number(ds.financialImpact) || 0)),
      operationalRisk: Math.min(100, Math.max(0, Number(ds.operationalRisk) || 0)),
      executionComplexity: Math.min(100, Math.max(0, Number(ds.executionComplexity) || 0)),
    };
  }

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
    autonomousDecision,
    decisionScores,
    agentDebate: parseAgentDebate(parsedData.agentDebate),
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
function buildUseCaseBlock(useCase: UseCaseType): string {
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

  const prompt = `${ANALYSIS_PROMPT}\n\nIndustry context: ${INDUSTRY_CONTEXT[industry]}\n${buildUseCaseBlock(useCase)}\n\nDocument:\n"""${text.trim()}"""`;

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

export async function extractTextFromPdf(base64Pdf: string): Promise<string> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const extracted = (
    await generateWithModelPool(
      [
        { inlineData: { mimeType: 'application/pdf', data: base64Pdf } },
        {
          text: 'Extract ALL readable text from this PDF. Return only the extracted text with paragraph breaks. No commentary.',
        },
      ],
      false,
    )
  ).trim();

  if (extracted.length < 50) {
    throw new Error('Could not extract enough text from this PDF.');
  }
  return extracted;
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
