import React, { useEffect } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '@/constants/designTokens';
import { platformShadow } from '@/utils/platformStyles';

interface GlowBorderProps extends ViewProps {
  active?: boolean;
  borderRadius?: number;
  children: React.ReactNode;
}

/** Animated accent ring — only when `active` (running step, hero CTA, etc.) */
export function GlowBorder({
  active = false,
  borderRadius = radius.lg,
  children,
  style,
  ...props
}: GlowBorderProps) {
  const glow = useSharedValue(0.35);

  useEffect(() => {
    if (!active) {
      glow.value = 0.35;
      return;
    }
    glow.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [active, glow]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: active ? 0.4 + glow.value * 0.45 : 0,
  }));

  return (
    <View style={[styles.wrap, { borderRadius }, style]} {...props}>
      {active ? (
        <Animated.View
          style={[
            styles.ring,
            { borderRadius: borderRadius + 1 },
            ringStyle,
          ]}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: colors.accent,
    pointerEvents: 'none',
    ...platformShadow({
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 4,
    }),
  },
});
