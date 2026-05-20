/**
 * InsightFlow global theme — re-exports design tokens as the single source of truth.
 * Legacy Expo template `Colors` kept below for unused scaffold components only.
 */
export {
  colors,
  spacing,
  radius,
  fontSize,
  fontWeight,
  borders,
  shadows,
  featureSection,
  navigationTheme,
  theme,
  type Theme,
  type ThemeColors,
} from './designTokens';

import { Platform } from 'react-native';
import { colors as ds } from './designTokens';

/** @deprecated Use `colors` from designTokens in app screens */
export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: ds.text,
    background: ds.bg,
    backgroundElement: ds.surface,
    backgroundSelected: ds.surfaceElevated,
    textSecondary: ds.textMuted,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
