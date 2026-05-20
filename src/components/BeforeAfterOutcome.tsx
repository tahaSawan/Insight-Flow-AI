import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing, radius } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';

interface BeforeAfterOutcomeProps {
  results: AnalysisResult;
}

export function BeforeAfterOutcome({ results }: BeforeAfterOutcomeProps) {
  const label = results.impactMetricLabel || 'Outcome';

  return (
    <Card variant="success" highlighted title={UI.results.beforeAfterTitle} style={styles.card}>
      <Typography variant="caption" style={styles.hint}>
        {UI.results.beforeAfterHint}
      </Typography>
      <View style={styles.row}>
        <View style={styles.box}>
          <Typography variant="caption" style={styles.boxLabel}>
            Before
          </Typography>
          <Typography style={styles.boxValue}>{results.beforeMetric}</Typography>
          <Typography variant="caption" style={styles.boxSub}>
            {label}
          </Typography>
        </View>

        <ArrowRight size={20} color={colors.accentText} />

        <View style={[styles.box, styles.boxAfter]}>
          <Typography variant="caption" style={[styles.boxLabel, styles.boxLabelAfter]}>
            After
          </Typography>
          <Typography style={styles.boxValueAfter}>{results.afterMetric}</Typography>
          <Typography variant="caption" style={styles.boxSubAfter}>
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
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
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
  },
  boxAfter: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  boxLabel: {
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  boxLabelAfter: {
    color: colors.success,
  },
  boxValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  boxValueAfter: {
    color: colors.success,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  boxSub: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  boxSubAfter: {
    color: colors.successLight,
    fontSize: 11,
    textAlign: 'center',
  },
});
