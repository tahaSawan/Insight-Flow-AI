import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, shadows } from '@/constants/designTokens';
import { hapticMedium } from '@/utils/haptics';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  haptic?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  isLoading = false,
  haptic = true,
  style,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = isLoading || disabled;
  const isPrimary = variant === 'primary';

  const handlePress = (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    if (haptic && !isDisabled) void hapticMedium();
    onPress?.(e);
  };

  const content = isLoading ? (
    <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.accent : '#fff'} />
  ) : (
    <Text
      style={[
        styles.textBase,
        variant === 'outline' && styles.textOutline,
        variant === 'ghost' && styles.textGhost,
        variant === 'secondary' && styles.textSecondary,
        isPrimary && styles.textPrimary,
      ]}
    >
      {title}
    </Text>
  );

  if (isPrimary) {
    return (
      <TouchableOpacity
        style={[styles.base, isDisabled && styles.disabled, shadows.accent, style]}
        disabled={isDisabled}
        activeOpacity={0.88}
        onPress={handlePress}
        {...props}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, isDisabled && styles.gradientDisabled]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      activeOpacity={0.85}
      onPress={handlePress}
      {...props}
    >
      <View style={styles.inner}>{content}</View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 50,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientDisabled: {
    opacity: 0.5,
  },
  inner: {
    minHeight: 50,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  textBase: {
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: colors.text,
  },
  textOutline: {
    color: colors.accentText,
  },
  textGhost: {
    color: colors.accentText,
  },
});
