import { Easing } from 'react-native-reanimated';

/** Shared spring — snappy, not bouncy */
export const pressSpring = { damping: 20, stiffness: 380 };

/** Stagger cap so long lists do not delay too much */
export function entranceDelay(index: number, stepMs = 48, maxMs = 280): number {
  return Math.min(index * stepMs, maxMs);
}

export const entranceEasing = Easing.out(Easing.cubic);
