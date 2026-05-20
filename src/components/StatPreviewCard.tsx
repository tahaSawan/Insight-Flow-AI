import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, type CardVariant } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { colors, spacing } from '@/constants/designTokens';

interface StatPreviewCardProps {
  label: string;
  value: string;
  accent: string;
  subtext?: string;
}

function variantForAccent(accent: string): CardVariant {
  if (accent === colors.danger || accent === colors.dangerLight) return 'danger';
  if (accent === colors.success || accent === colors.successLight) return 'success';
  if (accent === colors.warning) return 'alert';
  return 'default';
}

export function StatPreviewCard({ label, value, accent, subtext }: StatPreviewCardProps) {
  return (
    <Card variant={variantForAccent(accent)} style={styles.card} highlighted>
      <Typography variant="label" style={styles.label}>
        {label}
      </Typography>
      <Typography style={[styles.value, { color: accent }]}>{value}</Typography>
      {subtext ? (
        <Typography variant="caption" style={styles.subtext}>
          {subtext}
        </Typography>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 100,
    marginBottom: 0,
    padding: spacing.md,
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
