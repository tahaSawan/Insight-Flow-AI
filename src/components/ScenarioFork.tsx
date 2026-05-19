import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import type { AnalysisResult } from '@/types/analysis';

interface ScenarioForkProps {
  results: AnalysisResult;
}

export function ScenarioFork({ results }: ScenarioForkProps) {
  const nothing = results.doNothingOutlook || results.estimatedImpact;
  const action = results.doActionOutlook || `Target: ${results.afterMetric} on ${results.impactMetricLabel}`;

  return (
    <View style={styles.wrap}>
      <Typography variant="h3" style={styles.title}>
        Two futures (30 days)
      </Typography>
      <Typography variant="caption" style={styles.hint}>
        Same report — different path. This is why action matters.
      </Typography>
      <View style={styles.row}>
        <View style={[styles.box, styles.bad]}>
          <Typography style={styles.boxLabel}>If we do nothing</Typography>
          <Typography style={styles.boxText}>{nothing}</Typography>
        </View>
        <View style={[styles.box, styles.good]}>
          <Typography style={[styles.boxLabel, styles.goodLabel]}>If we act</Typography>
          <Typography style={styles.boxText}>{action}</Typography>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  title: { color: '#E2E8F0', fontSize: 18, marginBottom: 4 },
  hint: { color: '#64748B', marginBottom: 14, lineHeight: 18 },
  row: { gap: 10 },
  box: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  bad: {
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  good: {
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  boxLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#F87171',
    marginBottom: 8,
  },
  goodLabel: { color: '#34D399' },
  boxText: { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },
});
