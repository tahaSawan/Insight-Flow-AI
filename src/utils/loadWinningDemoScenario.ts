import type { Router } from 'expo-router';
import {
  WINNING_DEMO_FILE_LABEL,
  WINNING_DEMO_REPORT,
} from '@/constants/winningDemoScenario';
import type { AnalysisMode, IndustryType, UseCaseType } from '@/types/analysis';

export interface WinningDemoContextActions {
  setDemoMode: (on: boolean) => Promise<void>;
  setUploadedText: (text: string) => void;
  setSourceFileName: (name: string | null) => void;
  setIndustry: (industry: IndustryType) => void;
  setUseCase: (useCase: UseCaseType) => Promise<void>;
  setAnalysisMode: (mode: AnalysisMode) => void;
  setAnalysisResults: (results: null) => void;
  setDemoActionExecuted: (value: boolean) => void;
  setAnalysisUsedFallback: (value: boolean) => void;
}

/** One-tap hackathon path: demo mode on + Lahore scenario + jump to analysis. */
export async function loadWinningDemoScenario(
  actions: WinningDemoContextActions,
  router: Router,
): Promise<void> {
  await actions.setDemoMode(true);
  actions.setIndustry('general');
  await actions.setUseCase('crisis');
  actions.setAnalysisMode('full');
  actions.setUploadedText(WINNING_DEMO_REPORT);
  actions.setSourceFileName(WINNING_DEMO_FILE_LABEL);
  actions.setAnalysisResults(null);
  actions.setDemoActionExecuted(false);
  actions.setAnalysisUsedFallback(false);
  router.push('/analysis');
}
