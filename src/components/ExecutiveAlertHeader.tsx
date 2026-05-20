import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertTriangle, Gauge } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';
import type { AnalysisResult } from '@/types/analysis';

interface ExecutiveAlertHeaderProps {
  results: AnalysisResult;
}

function severityMeta(score: number) {
  if (score >= 70) return { label: 'Critical', color: colors.danger, bg: colors.dangerSoft };
  if (score >= 45) return { label: 'Elevated', color: colors.warning, bg: colors.warningSoft };
  return { label: 'Moderate', color: colors.success, bg: colors.successSoft };
}

export function ExecutiveAlertHeader({ results }: ExecutiveAlertHeaderProps) {
  const isCritical = results.riskScore >= 70;
  const severity = severityMeta(results.riskScore);
  const headline = results.urgencyHeadline || results.executiveSummary.slice(0, 120);

  return (
    <Card
      variant={isCritical ? 'danger' : 'alert'}
      highlighted
      icon={<AlertTriangle size={20} color={isCritical ? colors.danger : colors.warning} />}
      title="Leadership Alert"
      style={styles.card}
    >
      <Typography variant="alertHeadline">{headline}</Typography>
      {results.stakeAtRisk ? (
        <Typography variant="alertStake" style={styles.stake}>
          At stake: {results.stakeAtRisk}
        </Typography>
      ) : null}

      <View style={styles.metricsRow}>
        <View style={[styles.metricPill, { backgroundColor: severity.bg, borderColor: `${severity.color}55` }]}>
          <Gauge size={14} color={severity.color} />
          <View style={styles.metricText}>
            <Typography variant="metricLabel">Severity</Typography>
            <Typography variant="metricValueSm" style={{ color: severity.color }}>
              {severity.label} · {results.riskScore}
            </Typography>
          </View>
        </View>

        <View style={[styles.metricPill, styles.confidencePill]}>
          <View style={styles.metricText}>
            <Typography variant="metricLabel">Confidence</Typography>
            <Typography variant="metricValue" style={styles.confidenceValue}>
              {results.confidence}%
            </Typography>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  stake: {
    marginTop: textBlock.sm,
    marginBottom: textBlock.md,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 0,
  },
  confidencePill: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderAccent,
  },
  metricText: {
    flex: 1,
    gap: textBlock.xs,
    minWidth: 0,
  },
  confidenceValue: {
    fontSize: 22,
    lineHeight: 26,
  },
});
