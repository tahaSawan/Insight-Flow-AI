import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, radius, spacing } from '@/constants/designTokens';

const TIPS = [
  'Reading your document…',
  'Finding the main problems…',
  'Checking how serious it is…',
  'Writing next steps…',
  'Preparing action simulation…',
];

interface AnalysisLoadingPanelProps {
  active: boolean;
  isFullMode: boolean;
}

export function AnalysisLoadingPanel({ active, isFullMode }: AnalysisLoadingPanelProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const pulse = useState(() => new Animated.Value(0.4))[0];

  useEffect(() => {
    if (!active) return;
    const tipTimer = setInterval(() => {
      setTipIndex((i) => (i + 1) % TIPS.length);
    }, 2200);
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => {
      clearInterval(tipTimer);
      anim.stop();
    };
  }, [active, pulse]);

  if (!active) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.skeletonRow}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[styles.skeletonBar, { opacity: pulse, width: `${70 - i * 12}%` }]}
          />
        ))}
      </View>
      <Typography style={styles.tip}>{TIPS[tipIndex]}</Typography>
      <Typography variant="caption" style={styles.sub}>
        {isFullMode ? 'Five helpers working in order…' : 'Quick pass — same full report…'}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: spacing.md,
    backgroundColor: colors.accentMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    marginBottom: spacing.sm,
  },
  skeletonRow: { gap: 10, marginBottom: 14 },
  skeletonBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.surfaceHighlight,
  },
  tip: { color: colors.accentText, fontSize: 15, fontWeight: '600', marginBottom: 4 },
  sub: { color: colors.textDim },
});
