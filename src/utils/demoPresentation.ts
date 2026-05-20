import { isRetryableGeminiError } from '@/services/gemini';

/** Scale durations down in demo mode — subtle, not frantic. */
export function scaleDemoMs(ms: number, demoMode: boolean): number {
  return demoMode ? Math.max(120, Math.round(ms * 0.55)) : ms;
}

/** User-facing copy — never expose API keys, stack traces, or raw HTTP bodies. */
export function getDemoFriendlyAnalysisMessage(error: unknown): string {
  if (isRetryableGeminiError(error)) {
    return 'Our AI service is busy right now. Your curated Lahore storyline is ready — analysis will continue in a moment.';
  }
  return 'We could not reach the AI service. Your prepared demo storyline is still available below.';
}

export function shouldUseDemoFallback(demoMode: boolean, error: unknown): boolean {
  if (!demoMode) return false;
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  if (msg.includes('add at least') || msg.includes('too short')) return false;
  if (msg.includes('api key') || msg.includes('gemini_api')) return false;
  return true;
}
