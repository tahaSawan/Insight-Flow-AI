import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing, radius } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';
import type { AnalysisResult } from '@/types/analysis';

interface BeforeAfterOutcomeProps {
  results: AnalysisResult;
}

export function BeforeAfterOutcome({ results }: BeforeAfterOutcomeProps) {
  const label = results.impactMetricLabel || 'Outcome';

  return (
    <Card variant="success" highlighted title={UI.results.beforeAfterTitle} style={styles.card}>
      <Typography variant="sectionHint" style={styles.hint}>
        {UI.results.beforeAfterHint}
      </Typography>
      <View style={styles.row}>
        <View style={styles.box}>
          <Typography variant="metricLabel">Before</Typography>
          <Typography variant="metricValue" style={styles.boxValue}>
            {results.beforeMetric}
          </Typography>
          <Typography variant="caption">{label}</Typography>
        </View>

        <ArrowRight size={20} color={colors.accentText} />

        <View style={[styles.box, styles.boxAfter]}>
          <Typography variant="metricLabel" style={styles.labelAfter}>
            After
          </Typography>
          <Typography variant="metricValue" style={styles.valueAfter}>
            {results.afterMetric}
          </Typography>
          <Typography variant="caption" style={styles.subAfter}>
            {label}
          </Typography>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
    marginBottom: 0,
  },
  hint: {
    marginBottom: textBlock.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: textBlock.xs,
  },
  boxAfter: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  boxValue: {
    fontSize: 22,
    lineHeight: 26,
  },
  labelAfter: {
    color: colors.success,
  },
  valueAfter: {
    color: colors.success,
    fontSize: 22,
    lineHeight: 26,
  },
  subAfter: {
    color: colors.successLight,
  },
});
