/**
 * InsightFlow design system — executive dark theme.
 * Use these tokens everywhere; avoid one-off hex in screens.
 */
export const colors = {
  /** App canvas */
  bg: '#050508',
  bgElevated: '#0A0A12',

  /** Surfaces */
  surface: '#0F0F18',
  surfaceElevated: '#161625',
  surfaceHighlight: '#1C1C2E',

  /** Borders */
  border: 'rgba(148, 163, 184, 0.1)',
  borderStrong: 'rgba(148, 163, 184, 0.2)',
  borderAccent: 'rgba(139, 124, 246, 0.45)',

  /** Text */
  text: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',

  /** Brand — violet-indigo */
  accent: '#8B7CF8',
  accentDeep: '#6366F1',
  accentSoft: 'rgba(139, 124, 246, 0.14)',
  accentMuted: 'rgba(99, 102, 241, 0.08)',
  accentText: '#C4B5FD',
  accentGlow: 'rgba(139, 124, 246, 0.35)',

  /** Gradient stops (for LinearGradient) */
  gradientStart: '#6366F1',
  gradientEnd: '#A78BFA',

  /** Semantic */
  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.12)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.12)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.12)',
  info: '#38BDF8',
  infoSoft: 'rgba(56, 189, 248, 0.12)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const fontSize = {
  display: 30,
  title: 26,
  heading: 20,
  subheading: 17,
  body: 15,
  caption: 13,
  label: 11,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,
};

/** Subtle elevation — use sparingly (CTA + accent cards only). */
export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  accent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

/** Shared layout for feature blocks on Results. */
export const featureSection = {
  marginBottom: spacing.md,
} as const;

/** React Navigation dark theme overrides */
export const navigationTheme = {
  dark: {
    dark: true,
    colors: {
      primary: colors.accent,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  },
};
