/** Shared visual tokens — use these instead of one-off hex values. */
export const colors = {
  bg: '#0A0A0F',
  surface: '#12121A',
  surfaceElevated: '#1A1A24',
  border: 'rgba(148, 163, 184, 0.18)',
  borderAccent: 'rgba(99, 102, 241, 0.45)',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#6366F1',
  accentSoft: 'rgba(99, 102, 241, 0.12)',
  accentText: '#A5B4FC',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#38BDF8',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const fontSize = {
  title: 28,
  heading: 20,
  subheading: 16,
  body: 15,
  caption: 13,
  label: 11,
} as const;

/** Shared layout for feature blocks on Results (no glow/shadow). */
export const featureSection = {
  marginBottom: spacing.md,
} as const;
