/**
 * InsightFlow AI — global design system
 * AI operations dashboard · dark · cyan primary · emerald secondary
 *
 * Import: `import { colors, spacing, radius } from '@/constants/designTokens'`
 * Or:     `import { theme } from '@/constants/theme'`
 */

export const colors = {
  /** Canvas */
  bg: '#050A12',
  bgElevated: '#071018',

  /** Surfaces */
  surface: '#0B1220',
  surfaceElevated: '#111827',
  surfaceHighlight: '#151F32',

  /** Borders */
  border: 'rgba(148, 163, 184, 0.18)',
  borderStrong: 'rgba(148, 163, 184, 0.28)',
  borderAccent: 'rgba(34, 211, 238, 0.42)',

  /** Typography */
  text: '#F8FAFC',
  textSecondary: '#B8C5D6',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  /** Brand */
  accent: '#22D3EE',
  accentSecondary: '#10B981',
  accentDeep: '#06B6D4',
  accentSoft: 'rgba(34, 211, 238, 0.12)',
  accentMuted: 'rgba(34, 211, 238, 0.06)',
  accentSecondarySoft: 'rgba(16, 185, 129, 0.12)',
  accentText: '#67E8F9',
  accentGlow: 'rgba(34, 211, 238, 0.22)',

  /** Gradients (LinearGradient) */
  gradientStart: '#22D3EE',
  gradientEnd: '#10B981',

  /** Semantic */
  success: '#10B981',
  successSoft: 'rgba(16, 185, 129, 0.12)',
  warning: '#F59E0B',
  warningSoft: 'rgba(245, 158, 11, 0.12)',
  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerDeep: '#B91C1C',
  dangerSoft: 'rgba(239, 68, 68, 0.12)',
  successLight: '#34D399',
  successDeep: '#047857',
  surfaceInactive: '#1A1A24',
  info: '#22D3EE',
  infoSoft: 'rgba(34, 211, 238, 0.1)',

  /** Utility */
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.75)',
  track: '#151F32',
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

export const borders = {
  width: 1,
  widthStrong: 1.5,
} as const;

/** Elevation — primary CTA and accent cards only */
export const shadows = {
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  accent: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

export const featureSection = {
  marginBottom: spacing.md,
} as const;

/** React Navigation */
export const navigationTheme = {
  dark: {
    dark: true as const,
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

/** Single object export for `theme.colors.*` usage */
export const theme = {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  borders,
  shadows,
  featureSection,
  navigationTheme,
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof colors;
