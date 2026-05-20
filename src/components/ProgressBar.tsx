import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/designTokens';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

export function ProgressBar({ progress, color = colors.accent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  fill: {
    height: '100%',
    borderRadius: radius.sm,
  },
});
