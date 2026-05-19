import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
// Ensure EXPO_PUBLIC_GEMINI_API_KEY is defined in .env
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

console.log('[GEMINI SDK] Initializing...');
console.log('[GEMINI SDK] API Key detected:', apiKey ? 'YES (length: ' + apiKey.length + ')' : 'NO');

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

export async function analyzeContent(text: string): Promise<GeminiAnalysisResponse> {
  console.log('[GEMINI SDK] analyzeContent called');
  try {
    if (!apiKey) {
      console.error('[GEMINI SDK] ERROR: API key is missing or undefined in process.env');
      throw new Error('Gemini API key is missing. Check your .env file.');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Provide fallback context if text is empty or too short
    const contentToAnalyze = text.trim().length > 10 
      ? text 
      : "The company recently experienced a 15% drop in enterprise client renewals due to support delays and increasing software bugs in the latest Q3 release.";

    const prompt = `${SYSTEM_PROMPT}\n\n"${contentToAnalyze}"`;
    
    console.log('[GEMINI SDK] Sending request to Gemini...', { 
      textLength: contentToAnalyze.length,
      model: 'gemini-1.5-flash'
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const response = await result.response;
    const responseText = response.text();
    
    console.log('[GEMINI SDK] Raw Response received:', responseText.substring(0, 100) + '...');

    const parsedData = JSON.parse(responseText.trim());
    
    console.log('[GEMINI SDK] Successfully parsed JSON data');

    // Validate minimal structure
    return {
      riskScore: parsedData.riskScore || 50,
      confidence: parsedData.confidence || 80,
      priorityLevel: parsedData.priorityLevel || 'Medium',
      estimatedImpact: parsedData.estimatedImpact || 'Analysis completed successfully',
      keyFindings: Array.isArray(parsedData.keyFindings) ? parsedData.keyFindings : ['Insight generation completed'],
      riskAssessment: Array.isArray(parsedData.riskAssessment) ? parsedData.riskAssessment : ['Risk profile evaluated'],
      recommendedActions: Array.isArray(parsedData.recommendedActions) ? parsedData.recommendedActions : ['Monitor situation closely'],
      beforeChurn: parsedData.beforeChurn || '10.0%',
      afterChurn: parsedData.afterChurn || '8.0%'
    };

  } catch (error) {
    console.error('[GEMINI SDK] ERROR in analyzeContent:', error);
    throw error;
  }
}
