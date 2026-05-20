import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/designTokens';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  isLoading = false,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = isLoading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.85}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#3B82F6' : '#fff'} />
      ) : (
        <Text style={[
          styles.textBase,
          variant === 'outline' ? styles.textOutline : styles.textPrimary
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  disabled: {
    opacity: 0.45,
  },
  textBase: {
    fontWeight: '600',
    textAlign: 'center',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textOutline: {
    color: '#6366F1',
  }
});
