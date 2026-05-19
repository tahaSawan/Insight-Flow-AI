import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import type { AnalysisResult } from '@/types/analysis';

interface SeverityTimelineProps {
  results: AnalysisResult;
}

const MILESTONES = [
  { day: 'Today', key: 'now' as const },
  { day: 'Day 7', key: 'week' as const },
  { day: 'Day 30', key: 'month' as const },
];

export function SeverityTimeline({ results }: SeverityTimelineProps) {
  const bad = results.doNothingOutlook || results.estimatedImpact;
  const good = results.doActionOutlook || `Improve toward ${results.afterMetric}`;

  return (
    <View style={styles.wrap}>
      <Typography variant="h3" style={styles.title}>
        What happens over time
      </Typography>
      <Typography variant="caption" style={styles.hint}>
        Same decision — two paths on a simple timeline.
      </Typography>
      {MILESTONES.map((m, i) => (
        <View key={m.day} style={styles.row}>
          <View style={styles.rail}>
            <View style={[styles.dot, i === 0 && styles.dotActive]} />
            {i < MILESTONES.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.content}>
            <Typography style={styles.day}>{m.day}</Typography>
            <View style={styles.dual}>
              <View style={styles.miniBad}>
                <Typography style={styles.miniLabel}>No action</Typography>
                <Typography style={styles.miniText} numberOfLines={m.key === 'month' ? 4 : 2}>
                  {m.key === 'now' ? bad : m.key === 'week' ? 'Problems spread to more teams.' : bad}
                </Typography>
              </View>
              <View style={styles.miniGood}>
                <Typography style={[styles.miniLabel, styles.goodLabel]}>If we act</Typography>
                <Typography style={styles.miniText} numberOfLines={m.key === 'month' ? 4 : 2}>
                  {m.key === 'now'
                    ? 'Plan starts — teams notified.'
                    : m.key === 'week'
                      ? 'Early wins on support and quality.'
                      : good}
                </Typography>
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  title: { color: '#E2E8F0', fontSize: 17, marginBottom: 4 },
  hint: { color: '#64748B', marginBottom: 16, lineHeight: 18 },
  row: { flexDirection: 'row', marginBottom: 4 },
  rail: { width: 20, alignItems: 'center', marginRight: 12 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#475569',
    marginTop: 6,
  },
  dotActive: { backgroundColor: '#6366F1' },
  line: { flex: 1, width: 2, backgroundColor: '#2D2D44', minHeight: 48 },
  content: { flex: 1, paddingBottom: 16 },
  day: { fontWeight: '800', fontSize: 13, color: '#A5B4FC', marginBottom: 8 },
  dual: { gap: 8 },
  miniBad: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  miniGood: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  miniLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#F87171',
    marginBottom: 4,
  },
  goodLabel: { color: '#34D399' },
  miniText: { color: '#CBD5E1', fontSize: 12, lineHeight: 17 },
});
