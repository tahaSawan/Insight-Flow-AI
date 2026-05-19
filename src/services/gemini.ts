import { GoogleGenerativeAI } from '@google/generative-ai';
import { MIN_CONTENT_LENGTH } from '@/constants/sampleReport';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export interface GeminiAnalysisResponse {
  riskScore: number;
  confidence: number;
  priorityLevel: string;
  estimatedImpact: string;
  keyFindings: string[];
  riskAssessment: string[];
  recommendedActions: string[];
  beforeChurn: string;
  afterChurn: string;
}

const SYSTEM_PROMPT = `
You are an advanced autonomous AI orchestrator designed to analyze corporate data, reports, and news.
Analyze the following text and return a structured JSON object.
Do NOT wrap the response in markdown blocks (e.g. \`\`\`json). Return ONLY the raw JSON string.

The JSON object must have exactly the following keys and data types:
- riskScore: number (0-100)
- confidence: number (0-100)
- priorityLevel: string (e.g., "High", "Medium", "Low")
- estimatedImpact: string (a short 1-sentence summary of the impact)
- keyFindings: array of strings (exactly 3 items, concise)
- riskAssessment: array of strings (exactly 3 items, concise)
- recommendedActions: array of strings (exactly 3 items, actionable)
- beforeChurn: string (e.g., "14.2%")
- afterChurn: string (e.g., "8.5%")

Text to analyze:
`;

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

export async function analyzeContent(text: string): Promise<GeminiAnalysisResponse> {
  const configError = getGeminiConfigError();
  if (configError) {
    throw new Error(configError);
  }

  const inputError = validateAnalysisInput(text);
  if (inputError) {
    throw new Error(inputError);
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `${SYSTEM_PROMPT}\n\n"${text.trim()}"`;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const response = await result.response;
  const responseText = response.text();

  let parsedData: Record<string, unknown>;
  try {
    parsedData = JSON.parse(responseText.trim());
  } catch {
    throw new Error('AI returned an invalid response. Please try again.');
  }

  return {
    riskScore: Number(parsedData.riskScore) || 50,
    confidence: Number(parsedData.confidence) || 80,
    priorityLevel: String(parsedData.priorityLevel || 'Medium'),
    estimatedImpact: String(parsedData.estimatedImpact || 'Analysis completed successfully'),
    keyFindings: Array.isArray(parsedData.keyFindings)
      ? parsedData.keyFindings.map(String)
      : ['Insight generation completed'],
    riskAssessment: Array.isArray(parsedData.riskAssessment)
      ? parsedData.riskAssessment.map(String)
      : ['Risk profile evaluated'],
    recommendedActions: Array.isArray(parsedData.recommendedActions)
      ? parsedData.recommendedActions.map(String)
      : ['Monitor situation closely'],
    beforeChurn: String(parsedData.beforeChurn || '10.0%'),
    afterChurn: String(parsedData.afterChurn || '8.0%'),
  };
}
