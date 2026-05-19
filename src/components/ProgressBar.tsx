import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number;
  color?: string;
}

export function ProgressBar({ progress, color = '#6366F1' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: '#1F1F2E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
