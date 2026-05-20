import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radius } from '@/constants/designTokens';

interface SkeletonBarProps {
  width?: `${number}%` | number;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBar({ width = '100%', height = 12, style }: SkeletonBarProps) {
  const opacity = useRef(new Animated.Value(0.38)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.72, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.38, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.bar,
        { height, opacity },
        typeof width === 'string' ? { width } : { width },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
});
