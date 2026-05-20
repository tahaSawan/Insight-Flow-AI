/**
 * InsightFlow AI — enterprise typography presets
 * Use via `<Typography variant="..." />` or `typographyStyles.heroTitle`
 */
import { Platform, TextStyle } from 'react-native';
import { colors, fontWeight } from '@/constants/designTokens';

const mono = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

function preset(style: TextStyle): TextStyle {
  return style;
}

export const typography = {
  /** Home / marketing hero */
  heroTitle: preset({
    fontSize: 28,
    lineHeight: 34,
    fontWeight: fontWeight.heavy,
    letterSpacing: -0.7,
    color: colors.text,
  }),
  heroSubtitle: preset({
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  }),

  /** Screen chrome */
  screenTitle: preset({
    fontSize: 22,
    lineHeight: 28,
    fontWeight: fontWeight.heavy,
    letterSpacing: -0.4,
    color: colors.text,
  }),
  screenSubtitle: preset({
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  }),

  /** Section & card hierarchy */
  sectionTitle: preset({
    fontSize: 17,
    lineHeight: 23,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.15,
    color: colors.text,
  }),
  sectionHint: preset({
    fontSize: 12,
    lineHeight: 17,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
  }),
  cardTitle: preset({
    fontSize: 16,
    lineHeight: 22,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.1,
    color: colors.text,
  }),
  cardSubtitle: preset({
    fontSize: 13,
    lineHeight: 19,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
  }),

  /** Leadership alert — urgent, scannable */
  alertHeadline: preset({
    fontSize: 17,
    lineHeight: 24,
    fontWeight: fontWeight.heavy,
    letterSpacing: -0.2,
    color: colors.text,
  }),
  alertStake: preset({
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeight.bold,
    color: colors.warning,
  }),

  /** AI decision — largest readable statement */
  decisionText: preset({
    fontSize: 19,
    lineHeight: 26,
    fontWeight: fontWeight.heavy,
    letterSpacing: -0.35,
    color: colors.text,
  }),
  decisionLabel: preset({
    fontSize: 11,
    lineHeight: 15,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  }),

  /** Metrics & data */
  metricValue: preset({
    fontSize: 26,
    lineHeight: 30,
    fontWeight: fontWeight.heavy,
    letterSpacing: -0.6,
    color: colors.accentText,
  }),
  metricValueSm: preset({
    fontSize: 15,
    lineHeight: 20,
    fontWeight: fontWeight.heavy,
    letterSpacing: -0.2,
    color: colors.text,
  }),
  metricLabel: preset({
    fontSize: 10,
    lineHeight: 14,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.75,
    textTransform: 'uppercase',
    color: colors.textDim,
  }),

  /** Body copy */
  body: preset({
    fontSize: 15,
    lineHeight: 22,
    fontWeight: fontWeight.regular,
    color: colors.text,
  }),
  bodyMuted: preset({
    fontSize: 14,
    lineHeight: 20,
    fontWeight: fontWeight.regular,
    color: colors.textSecondary,
  }),
  caption: preset({
    fontSize: 12,
    lineHeight: 17,
    fontWeight: fontWeight.regular,
    color: colors.textMuted,
  }),

  /** Chips, pills, status */
  badgeText: preset({
    fontSize: 10,
    lineHeight: 12,
    fontWeight: fontWeight.heavy,
    letterSpacing: 0.65,
    textTransform: 'uppercase',
    color: colors.accentText,
  }),

  /** Terminal / agent logs */
  terminalLog: preset({
    fontSize: 10,
    lineHeight: 14,
    fontWeight: fontWeight.medium,
    fontFamily: mono,
    color: colors.textSecondary,
  }),
  terminalHeader: preset({
    fontSize: 9,
    lineHeight: 12,
    fontWeight: fontWeight.heavy,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontFamily: mono,
    color: colors.textDim,
  }),
} as const;

/** Vertical rhythm between text blocks */
export const textBlock = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export type TypographyVariant = keyof typeof typography;

/** Flat styles for StyleSheet.create (no variant wrapper) */
export const typographyStyles = typography;
