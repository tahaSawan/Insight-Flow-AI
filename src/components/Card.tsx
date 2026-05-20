import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/designTokens';

type CardVariant = 'default' | 'elevated' | 'accent';

interface CardProps extends ViewProps {
  variant?: CardVariant;
}

export function Card({ style, children, variant = 'default', ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'accent' && styles.accent,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
  },
  accent: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentSoft,
  },
});
