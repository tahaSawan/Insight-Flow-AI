import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UseCaseType } from '@/types/analysis';

const KEYS = {
  onboarding: '@insightflow/onboarding_complete',
  useCase: '@insightflow/use_case',
} as const;

export async function getOnboardingComplete(): Promise<boolean> {
  const v = await AsyncStorage.getItem(KEYS.onboarding);
  return v === 'true';
}

export async function setOnboardingComplete(done: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.onboarding, done ? 'true' : 'false');
}

export async function getUseCase(): Promise<UseCaseType> {
  const v = await AsyncStorage.getItem(KEYS.useCase);
  if (v === 'board' || v === 'crisis' || v === 'weekly') return v;
  return 'board';
}

export async function setUseCase(useCase: UseCaseType): Promise<void> {
  await AsyncStorage.setItem(KEYS.useCase, useCase);
}
