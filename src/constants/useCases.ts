import type { UseCaseType } from '@/types/analysis';

export const USE_CASE_OPTIONS: {
  id: UseCaseType;
  label: string;
  description: string;
  aiHint: string;
}[] = [
  {
    id: 'board',
    label: 'Board meeting',
    description: 'Clear summary + stakes for executives',
    aiHint: 'Frame for a board audience: revenue, risk, 30-day plan.',
  },
  {
    id: 'crisis',
    label: 'Crisis response',
    description: 'Urgent problems and fast actions',
    aiHint: 'Treat as urgent: prioritize severity, immediate steps, escalation.',
  },
  {
    id: 'weekly',
    label: 'Weekly ops',
    description: 'Steady improvements and team tasks',
    aiHint: 'Operational weekly review: metrics, blockers, practical next steps.',
  },
];

export function getUseCaseHint(id: UseCaseType): string {
  return USE_CASE_OPTIONS.find((o) => o.id === id)?.aiHint ?? USE_CASE_OPTIONS[0].aiHint;
}
