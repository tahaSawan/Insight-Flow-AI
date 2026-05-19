import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '@/components/Typography';
import { USE_CASE_OPTIONS } from '@/constants/useCases';
import type { UseCaseType } from '@/types/analysis';

interface UseCasePickerProps {
  value: UseCaseType;
  onChange: (v: UseCaseType) => void;
}

export function UseCasePicker({ value, onChange }: UseCasePickerProps) {
  return (
    <View style={styles.container}>
      <Typography variant="caption" style={styles.label}>
        Why are you analyzing this?
      </Typography>
      <View style={styles.row}>
        {USE_CASE_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onChange(opt.id)}
              style={[styles.chip, selected && styles.chipSelected]}
            >
              <Typography style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {opt.label}
              </Typography>
              <Typography variant="caption" style={styles.chipDesc}>
                {opt.description}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    color: '#8A8D98',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  row: { gap: 8 },
  chip: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2D2D44',
    backgroundColor: '#0A0A0F',
  },
  chipSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  chipLabel: { fontWeight: '700', fontSize: 14, color: '#94A3B8', marginBottom: 4 },
  chipLabelSelected: { color: '#C7D2FE' },
  chipDesc: { color: '#64748B', fontSize: 12, lineHeight: 16 },
});
