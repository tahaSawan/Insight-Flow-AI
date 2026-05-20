import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing, radius } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';
import type { AnalysisResult } from '@/types/analysis';

interface ExecutivePathCompareProps {
  results: AnalysisResult;
}

export function ExecutivePathCompare({ results }: ExecutivePathCompareProps) {
  const doNothing = results.doNothingOutlook || 'Risk compounds without intervention.';
  const actNow = results.doActionOutlook || 'Plan stabilizes operations and reduces exposure.';

  return (
    <Card
      title={UI.results.pathCompareTitle}
      subtitle={UI.results.pathCompareHint}
      entranceIndex={2}
      style={styles.card}
    >
      <View style={styles.columns}>
        <View style={[styles.pathCard, styles.pathBad]}>
          <View style={styles.pathHead}>
            <AlertTriangle size={14} color={colors.danger} />
            <Typography variant="badgeText" style={styles.pathTitleBad}>
              {UI.results.pathDoNothing}
            </Typography>
          </View>
          <Typography variant="caption" numberOfLines={3}>
            {doNothing}
          </Typography>
          <Typography variant="metricValueSm" style={styles.pathMetaBad} numberOfLines={1}>
            {results.beforeMetric} → worsens
          </Typography>
        </View>

        <View style={[styles.pathCard, styles.pathGood]}>
          <View style={styles.pathHead}>
            <CheckCircle size={14} color={colors.success} />
            <Typography variant="badgeText" style={styles.pathTitleGood}>
              {UI.results.pathActNow}
            </Typography>
          </View>
          <Typography variant="caption" numberOfLines={3}>
            {actNow}
          </Typography>
          <Typography variant="metricValueSm" style={styles.pathMetaGood} numberOfLines={1}>
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
    gap: textBlock.sm,
  },
  pathBad: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.borderDanger,
  },
  pathGood: {
    backgroundColor: colors.successSoft,
    borderColor: colors.borderSuccess,
  },
  pathHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pathTitleBad: {
    color: colors.danger,
    flex: 1,
  },
  pathTitleGood: {
    color: colors.success,
    flex: 1,
  },
  pathMetaBad: {
    color: colors.dangerLight,
    fontSize: 12,
  },
  pathMetaGood: {
    color: colors.successLight,
    fontSize: 12,
  },
});
