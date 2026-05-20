import React from 'react';
import { Text, TextProps, StyleSheet, TextStyle } from 'react-native';
import { colors } from '@/constants/designTokens';
import { typography, type TypographyVariant } from '@/constants/typography';

/** Legacy variants map to enterprise presets */
type LegacyVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';

const LEGACY_MAP: Record<LegacyVariant, TypographyVariant> = {
  display: 'heroTitle',
  h1: 'screenTitle',
  h2: 'sectionTitle',
  h3: 'cardTitle',
  body: 'body',
  caption: 'caption',
  label: 'metricLabel',
};

export type TypographyProps = TextProps & {
  variant?: TypographyVariant | LegacyVariant;
  muted?: boolean;
};

function resolveVariant(variant: TypographyVariant | LegacyVariant): TypographyVariant {
  if (variant in LEGACY_MAP) return LEGACY_MAP[variant as LegacyVariant];
  return variant as TypographyVariant;
}

export function Typography({
  variant = 'body',
  muted = false,
  style,
  children,
  ...props
}: TypographyProps) {
  const key = resolveVariant(variant);
  const preset = typography[key];

  return (
    <Text
      style={[
        styles.base,
        preset,
        muted && styles.mutedOverride,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

/** Use in StyleSheet when Typography wrapper is not ideal */
export function textStyle(variant: TypographyVariant): TextStyle {
  return typography[variant];
}

const styles = StyleSheet.create({
  base: {
    margin: 0,
    padding: 0,
  },
  mutedOverride: {
    color: colors.textMuted,
  },
});
