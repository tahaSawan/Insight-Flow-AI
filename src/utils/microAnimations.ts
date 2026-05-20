import { Easing } from 'react-native-reanimated';

/** Shared spring — snappy, not bouncy */
export const pressSpring = { damping: 20, stiffness: 380 };

/** Stagger cap so long lists do not delay too much */
export function entranceDelay(
  index: number,
  stepMs = 48,
  maxMs = 280,
  demoMode = false,
): number {
  const step = demoMode ? Math.round(stepMs * 0.55) : stepMs;
  const cap = demoMode ? Math.round(maxMs * 0.55) : maxMs;
  return Math.min(index * step, cap);
}

export function entranceDurationMs(demoMode: boolean): number {
  return demoMode ? 220 : 360;
}

export const entranceEasing = Easing.out(Easing.cubic);
