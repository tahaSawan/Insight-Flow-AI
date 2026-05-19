import { GoogleGenerativeAI } from '@google/generative-ai';
import { MIN_CONTENT_LENGTH } from '@/constants/sampleReport';
import type { AnalysisResult, IndustryType, SimulatedAction } from '@/types/analysis';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

const GEMINI_MODEL =
  process.env.EXPO_PUBLIC_GEMINI_MODEL?.trim() || 'gemini-2.5-flash';

const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];

const INDUSTRY_CONTEXT: Record<IndustryType, string> = {
  general: 'Analyze from a general business leadership perspective.',
  finance: 'Analyze from a finance and compliance perspective. Emphasize revenue, risk exposure, and regulatory factors.',
  healthcare: 'Analyze from a healthcare operations perspective. Emphasize patient outcomes, compliance (HIPAA), and care delivery.',
  technology: 'Analyze from a technology and product perspective. Emphasize engineering quality, uptime, security, and customer adoption.',
};

const ANALYSIS_PROMPT = `
You are InsightFlow AI — an executive decision-support orchestrator.
Analyze the provided business text and return ONLY a raw JSON object (no markdown).

Required JSON keys:
- executiveSummary: string (2-3 sentences for a CEO)
- riskScore: number (0-100)
- confidence: number (0-100)
- priorityLevel: string ("High", "Medium", or "Low")
- estimatedImpact: string (one sentence)
- keyFindings: string[] (exactly 3 concise bullets)
- riskAssessment: string[] (exactly 3 concise bullets)
- recommendedActions: string[] (exactly 3 actionable items starting with verbs)
- impactMetricLabel: string (e.g. "Churn Rate", "Revenue at Risk", "NPS Score" — pick the most relevant KPI for this content)
- beforeMetric: string (current state, e.g. "14.2%")
- afterMetric: string (projected state after recommended actions, e.g. "8.5%")
- simulatedActions: array of exactly 3 objects, each with:
  - title: string (action taken, e.g. "Alert Triggered")
  - description: string (what happened)
  - icon: string (single emoji)
- executionLog: string[] (exactly 6 log lines; each line is plain text WITHOUT timestamps — we add timestamps in the app)

Base insights on the actual content provided. Do not invent unrelated metrics.
`;

async function generateWithGemini(prompt: string, jsonMode = true): Promise<string> {
  const modelsToTry = [GEMINI_MODEL, ...FALLBACK_MODELS.filter((m) => m !== GEMINI_MODEL)];
  let lastError: unknown;

  for (const modelName of modelsToTry) {
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
      if (!message.includes('404') && !message.includes('not found')) {
        throw error;
      }
    }
  }

  throw new Error(
    lastError instanceof Error ? lastError.message : 'All Gemini models failed.',
  );
}

function parseSimulatedActions(raw: unknown): SimulatedAction[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 3).map((item, i) => {
    const obj = item as Record<string, unknown>;
    return {
      title: String(obj.title || `Action ${i + 1}`),
      description: String(obj.description || 'Executed successfully'),
      icon: String(obj.icon || '✅'),
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
  }));

  const simulatedActions = parseSimulatedActions(parsedData.simulatedActions);
  const actions = simulatedActions.length >= 3 ? simulatedActions : defaultActions;

  const executionLog = Array.isArray(parsedData.executionLog)
    ? parsedData.executionLog.map(String)
    : [
        'Content parsed and indexed',
        'Risk models applied to document',
        `Identified ${Array.isArray(parsedData.riskAssessment) ? parsedData.riskAssessment.length : 3} risk factors`,
        'Mitigation strategies generated',
        'Automated actions dispatched',
        'Insight-to-Action pipeline complete',
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

export async function analyzeContent(
  text: string,
  industry: IndustryType = 'general',
): Promise<AnalysisResult> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const inputError = validateAnalysisInput(text);
  if (inputError) throw new Error(inputError);

  const prompt = `${ANALYSIS_PROMPT}\n\nIndustry context: ${INDUSTRY_CONTEXT[industry]}\n\nDocument:\n"""${text.trim()}"""`;

  const responseText = await generateWithGemini(prompt, true);

  let parsedData: Record<string, unknown>;
  try {
    parsedData = JSON.parse(responseText.trim());
  } catch {
    throw new Error('AI returned an invalid response. Please try again.');
  }

  return parseAnalysisResponse(parsedData);
}

export async function extractTextFromPdf(base64Pdf: string): Promise<string> {
  const configError = getGeminiConfigError();
  if (configError) throw new Error(configError);

  const modelsToTry = [GEMINI_MODEL, ...FALLBACK_MODELS.filter((m) => m !== GEMINI_MODEL)];
  let lastError: unknown;

  for (const modelName of modelsToTry) {
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
      const text = (await result.response).text().trim();
      if (text.length < 50) {
        throw new Error('Could not extract enough text from this PDF.');
      }
      return text;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('404') && !message.includes('not found')) {
        throw error;
      }
    }
  }

  throw new Error(
    lastError instanceof Error ? lastError.message : 'PDF extraction failed.',
  );
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
You are InsightFlow AI. Explain this ${insightType} in 2-3 sentences for an executive.
Be specific to the document. Explain WHY it matters and WHAT to do next.

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
You are InsightFlow AI assistant. Answer based ONLY on the document and analysis below.
Be concise (2-4 sentences). Be specific and actionable.

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
Based on this business document and analysis, create a 30-second CEO briefing.
Return ONLY a JSON object: { "bullets": string[] } with exactly 4 punchy bullets (max 15 words each).

DOCUMENT (excerpt):
${documentText.slice(0, 2000)}

ANALYSIS:
${analysis.executiveSummary}
Priority: ${analysis.priorityLevel} | Risk: ${analysis.riskScore}/100
`;

  const responseText = await generateWithGemini(prompt, true);
  const parsed = JSON.parse(responseText.trim()) as { bullets?: string[] };
  if (Array.isArray(parsed.bullets) && parsed.bullets.length > 0) {
    return parsed.bullets.map(String).slice(0, 4);
  }
  return [
    analysis.executiveSummary,
    `Priority: ${analysis.priorityLevel} — Risk score ${analysis.riskScore}/100`,
    `Top action: ${analysis.recommendedActions[0]}`,
    `Projected ${analysis.impactMetricLabel}: ${analysis.beforeMetric} → ${analysis.afterMetric}`,
  ];
}

// Re-export type for convenience
export type { AnalysisResult } from '@/types/analysis';
