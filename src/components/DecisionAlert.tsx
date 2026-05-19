import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import type { AnalysisResult } from '@/types/analysis';

interface DecisionAlertProps {
  results: AnalysisResult;
}

export function DecisionAlert({ results }: DecisionAlertProps) {
  const isCritical = results.riskScore >= 70;
  const headline = results.urgencyHeadline || results.executiveSummary.slice(0, 100);
  const stake = results.stakeAtRisk;

  return (
    <View style={[styles.wrap, isCritical ? styles.critical : styles.elevated]}>
      <View style={styles.row}>
        <AlertTriangle size={22} color={isCritical ? '#FCA5A5' : '#FCD34D'} />
        <View style={styles.body}>
          <Typography style={styles.label}>
            {isCritical ? 'Action needed now' : 'Leadership alert'}
          </Typography>
          <Typography style={styles.headline}>{headline}</Typography>
          {stake ? (
            <Typography style={styles.stake}>At stake: {stake}</Typography>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  critical: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  elevated: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  body: { flex: 1 },
  label: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#FCA5A5',
    marginBottom: 6,
  },
  headline: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 6,
  },
  stake: {
    color: '#FCD34D',
    fontSize: 15,
    fontWeight: '800',
  },
});
