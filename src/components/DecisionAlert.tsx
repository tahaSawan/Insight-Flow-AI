import React from 'react';
import { StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { colors, featureSection } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';

interface DecisionAlertProps {
  results: AnalysisResult;
}

export function DecisionAlert({ results }: DecisionAlertProps) {
  const isCritical = results.riskScore >= 70;
  const headline = results.urgencyHeadline || results.executiveSummary.slice(0, 100);
  const stake = results.stakeAtRisk;

  return (
    <Card
      variant={isCritical ? 'danger' : 'alert'}
      highlighted
      style={featureSection}
      icon={<AlertTriangle size={22} color={isCritical ? colors.danger : colors.warning} />}
      title={isCritical ? 'Action needed now' : 'Leadership alert'}
    >
      <Typography style={styles.headline}>{headline}</Typography>
      {stake ? (
        <Typography style={styles.stake}>At stake: {stake}</Typography>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
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
