import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card } from '@/components/Card';
import { colors, spacing, radius } from '@/constants/designTokens';

function SkeletonBar({ width }: { width: `${number}%` | number }) {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.bar,
        typeof width === 'string' ? { width } : { width },
        { opacity },
      ]}
    />
  );
}

export function ResultsSkeleton() {
  return (
    <View style={styles.wrap}>
      <Card style={styles.block}>
        <SkeletonBar width="40%" />
        <SkeletonBar width="95%" />
        <SkeletonBar width="80%" />
      </Card>
      <Card variant="alert" style={styles.block}>
        <SkeletonBar width="35%" />
        <SkeletonBar width="100%" />
        <SkeletonBar width="70%" />
      </Card>
      <Card style={styles.block}>
        <SkeletonBar width="50%" />
        <SkeletonBar width="90%" />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md, paddingVertical: spacing.sm },
  block: { gap: spacing.sm, padding: spacing.md },
  bar: {
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
});
