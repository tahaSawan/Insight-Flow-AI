import React from 'react';
import {
  Pressable,
  Text,
  PressableProps,
  ActivityIndicator,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, spacing, shadows } from '@/constants/designTokens';
import { hapticMedium } from '@/utils/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

/** @deprecated Use `secondary` or `ghost` */
export type LegacyButtonVariant = ButtonVariant | 'outline';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  variant?: LegacyButtonVariant;
  isLoading?: boolean;
  haptic?: boolean;
  icon?: React.ReactNode;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function resolveVariant(variant: LegacyButtonVariant): ButtonVariant {
  if (variant === 'outline') return 'secondary';
  return variant;
}

export function Button({
  title,
  variant = 'primary',
  isLoading = false,
  haptic = true,
  icon,
  iconLeft,
  iconRight,
  fullWidth = false,
  style,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const resolved = resolveVariant(variant);
  const isDisabled = isLoading || !!disabled;
  const isPrimary = resolved === 'primary';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: PressableProps['onPressIn'] = (e) => {
    if (!isDisabled) scale.value = withSpring(0.96, { damping: 18, stiffness: 320 });
    onPressIn?.(e);
  };

  const handlePressOut: PressableProps['onPressOut'] = (e) => {
    scale.value = withSpring(1, { damping: 18, stiffness: 320 });
    onPressOut?.(e);
  };

  const handlePress: PressableProps['onPress'] = (e) => {
    if (haptic && !isDisabled) void hapticMedium();
    onPress?.(e);
  };

  const spinnerColor =
    resolved === 'primary' || resolved === 'danger'
      ? colors.white
      : colors.accentText;

  const leftIcon = iconLeft ?? icon;
  const textStyle = [
    styles.textBase,
    resolved === 'primary' && styles.textPrimary,
    resolved === 'secondary' && styles.textSecondary,
    resolved === 'danger' && styles.textDanger,
    resolved === 'ghost' && styles.textGhost,
    isDisabled && styles.textDisabled,
  ];

  const content = (
    <View style={[styles.row, fullWidth && styles.rowFull]}>
      {isLoading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <>
          {leftIcon ? <View style={styles.iconSlot}>{leftIcon}</View> : null}
          <Text style={textStyle} numberOfLines={1}>
            {title}
          </Text>
          {iconRight ? <View style={styles.iconSlot}>{iconRight}</View> : null}
        </>
      )}
    </View>
  );

  const pressableStyle = [
    styles.base,
    fullWidth && styles.fullWidth,
    resolved === 'secondary' && styles.secondary,
    resolved === 'danger' && styles.danger,
    resolved === 'ghost' && styles.ghost,
    isDisabled && styles.disabled,
    isPrimary && styles.primaryShell,
    isPrimary && shadows.accent,
    style,
  ];

  if (isPrimary) {
    return (
      <AnimatedPressable
        style={[animatedStyle, pressableStyle]}
        disabled={isDisabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: isLoading }}
        {...props}
      >
        <View style={[styles.glowRing, isDisabled && styles.glowDisabled]} pointerEvents="none" />
        <LinearGradient
          colors={
            isDisabled
              ? [colors.surfaceHighlight, colors.surfaceHighlight]
              : [colors.gradientStart, colors.gradientEnd]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[animatedStyle, pressableStyle]}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      {...props}
    >
      <View style={styles.inner}>{content}</View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  primaryShell: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  glowRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accentGlow,
    opacity: 0.85,
  },
  glowDisabled: {
    opacity: 0,
  },
  gradient: {
    minHeight: 50,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    minHeight: 50,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  rowFull: {
    width: '100%',
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  ghost: {
    backgroundColor: 'transparent',
    minHeight: 44,
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
    color: colors.white,
  },
  textSecondary: {
    color: colors.accentText,
  },
  textDanger: {
    color: colors.danger,
  },
  textGhost: {
    color: colors.accentText,
  },
  textDisabled: {
    opacity: 0.9,
  },
});
