import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, type CardVariant } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { colors, spacing } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';

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
      <Typography variant="metricLabel" style={styles.label}>
        {label}
      </Typography>
      <Typography variant="metricValue" style={{ color: accent, fontSize: 22, lineHeight: 26 }}>
        {value}
      </Typography>
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
    gap: textBlock.xs,
  },
  label: {
    marginBottom: 0,
  },
  subtext: {
    marginTop: textBlock.xs,
  },
});
