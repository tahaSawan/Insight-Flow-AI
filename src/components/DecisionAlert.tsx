import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { colors, featureSection, radius, spacing } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';

interface DecisionAlertProps {
  results: AnalysisResult;
}

export function DecisionAlert({ results }: DecisionAlertProps) {
  const isCritical = results.riskScore >= 70;
  const headline = results.urgencyHeadline || results.executiveSummary.slice(0, 100);
  const stake = results.stakeAtRisk;

  return (
    <View
      style={[
        styles.wrap,
        featureSection,
        isCritical ? styles.critical : styles.elevated,
      ]}
    >
      <View style={styles.iconWrap}>
        <AlertTriangle size={22} color={isCritical ? colors.danger : colors.warning} />
      </View>
      <View style={styles.body}>
        <Typography variant="label" style={isCritical ? styles.labelCritical : styles.labelWarn}>
          {isCritical ? 'Action needed now' : 'Leadership alert'}
        </Typography>
        <Typography style={styles.headline}>{headline}</Typography>
        {stake ? (
          <Typography style={styles.stake}>At stake: {stake}</Typography>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  critical: {
    backgroundColor: colors.dangerSoft,
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  elevated: {
    backgroundColor: colors.warningSoft,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  labelCritical: {
    color: colors.danger,
    marginBottom: 6,
  },
  labelWarn: {
    color: colors.warning,
    marginBottom: 6,
  },
  headline: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 23,
    marginBottom: 6,
  },
  stake: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: '700',
  },
});
