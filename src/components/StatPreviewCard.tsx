import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';

interface StatPreviewCardProps {
  label: string;
  value: string;
  accent: string;
  subtext?: string;
}

export function StatPreviewCard({ label, value, accent, subtext }: StatPreviewCardProps) {
  return (
    <View style={[styles.card, { borderColor: `${accent}33` }]}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Typography variant="caption" style={styles.label}>
        {label}
      </Typography>
      <Typography style={[styles.value, { color: accent }]}>{value}</Typography>
      {subtext ? (
        <Typography variant="caption" style={styles.subtext}>
          {subtext}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#12121A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    minWidth: 100,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 10,
  },
  label: {
    color: '#8A8D98',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  subtext: {
    color: '#64748B',
    fontSize: 11,
  },
});
