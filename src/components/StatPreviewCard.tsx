import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, radius, spacing } from '@/constants/designTokens';

interface StatPreviewCardProps {
  label: string;
  value: string;
  accent: string;
  subtext?: string;
}

export function StatPreviewCard({ label, value, accent, subtext }: StatPreviewCardProps) {
  return (
    <View style={[styles.card, { borderColor: `${accent}33`, backgroundColor: `${accent}0A` }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Typography variant="label" style={styles.label}>
        {label}
      </Typography>
      <Typography style={[styles.value, { color: accent }]}>{value}</Typography>
      {subtext ? (
        <Typography variant="caption" style={styles.subtext}>
          {subtext}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    minWidth: 100,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  label: {
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subtext: {
    fontSize: 11,
  },
});
