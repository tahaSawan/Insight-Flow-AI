import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing, radius } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';

interface ExecutivePathCompareProps {
  results: AnalysisResult;
}

export function ExecutivePathCompare({ results }: ExecutivePathCompareProps) {
  const doNothing = results.doNothingOutlook || 'Risk compounds without intervention.';
  const actNow = results.doActionOutlook || 'Plan stabilizes operations and reduces exposure.';

  return (
    <Card title={UI.results.pathCompareTitle} subtitle={UI.results.pathCompareHint} style={styles.card}>
      <View style={styles.columns}>
        <View style={[styles.pathCard, styles.pathBad]}>
          <View style={styles.pathHead}>
            <AlertTriangle size={14} color={colors.danger} />
            <Typography style={styles.pathTitleBad}>{UI.results.pathDoNothing}</Typography>
          </View>
          <Typography style={styles.pathBody} numberOfLines={3}>
            {doNothing}
          </Typography>
          <Typography variant="caption" style={styles.pathMeta}>
            {results.beforeMetric} → worsens
          </Typography>
        </View>

        <View style={[styles.pathCard, styles.pathGood]}>
          <View style={styles.pathHead}>
            <CheckCircle size={14} color={colors.success} />
            <Typography style={styles.pathTitleGood}>{UI.results.pathActNow}</Typography>
          </View>
          <Typography style={styles.pathBody} numberOfLines={3}>
            {actNow}
          </Typography>
          <Typography variant="caption" style={styles.pathMetaGood}>
            {results.beforeMetric} → {results.afterMetric}
          </Typography>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  columns: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pathCard: {
    flex: 1,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
    minWidth: 0,
  },
  pathBad: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  pathGood: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  pathHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  pathTitleBad: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  pathTitleGood: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  pathBody: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: spacing.sm,
  },
  pathMeta: {
    color: colors.dangerLight,
    fontSize: 11,
    fontWeight: '600',
  },
  pathMetaGood: {
    color: colors.successLight,
    fontSize: 11,
    fontWeight: '600',
  },
});
