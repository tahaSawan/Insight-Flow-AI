import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, fontSize } from '@/constants/designTokens';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
}

export function Typography({ variant = 'body', style, children, ...props }: TypographyProps) {
  return (
    <Text style={[styles.base, styles[variant], style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    margin: 0,
  },
  h1: {
    fontSize: fontSize.title,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: fontSize.heading,
    fontWeight: '700',
  },
  h3: {
    fontSize: fontSize.subheading,
    fontWeight: '600',
  },
  body: {
    fontSize: fontSize.body,
    lineHeight: 22,
  },
  caption: {
    fontSize: fontSize.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  label: {
    fontSize: fontSize.label,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
});
