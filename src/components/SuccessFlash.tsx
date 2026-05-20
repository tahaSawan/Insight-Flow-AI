import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Typography } from '@/components/Typography';
import { colors, radius, spacing } from '@/constants/designTokens';
import { pressSpring } from '@/utils/microAnimations';

interface SuccessFlashProps {
  message: string;
  onComplete?: () => void;
}

/** Brief success pulse when simulation completes */
export function SuccessFlash({ message, onComplete }: SuccessFlashProps) {
  const scale = useSharedValue(0.92);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 220 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 280 }),
    );
    scale.value = withSequence(
      withSpring(1, pressSpring),
      withTiming(1, { duration: 900 }),
      withSpring(0.98, pressSpring),
    );
    const t = setTimeout(() => onComplete?.(), 1500);
    return () => clearTimeout(t);
  }, [opacity, scale, onComplete]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, animStyle]}>
      <CheckCircle size={18} color={colors.success} />
      <Typography variant="bodyMuted" style={styles.text}>
        {message}
      </Typography>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.borderSuccess,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  text: {
    flex: 1,
    color: colors.success,
    fontWeight: '600',
  },
});
