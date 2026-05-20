import React from 'react';
import {
  TouchableOpacity,
  Text,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { colors, radius, spacing } from '@/constants/designTokens';
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

  const handlePress = (e: Parameters<NonNullable<TouchableOpacityProps['onPress']>>[0]) => {
    if (haptic && !isDisabled) void hapticMedium();
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
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
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.accent : '#fff'} />
      ) : (
        <Text
          style={[
            styles.textBase,
            variant === 'outline' && styles.textOutline,
            variant === 'ghost' && styles.textGhost,
            (variant === 'primary' || variant === 'secondary') && styles.textPrimary,
          ]}
        >
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
  ghost: {
    backgroundColor: 'transparent',
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
    color: colors.accent,
  },
  textGhost: {
    color: colors.accentText,
  },
});
