import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '@/components/Typography';
import { ANALYSIS_MODE_OPTIONS, type AnalysisMode } from '@/types/analysis';

interface AnalysisModePickerProps {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

export function AnalysisModePicker({ value, onChange }: AnalysisModePickerProps) {
  return (
    <View style={styles.container}>
      <Typography variant="caption" style={styles.label}>
        Analysis mode
      </Typography>
      <View style={styles.row}>
        {ANALYSIS_MODE_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onChange(opt.id)}
              style={[styles.option, selected && styles.optionSelected]}
            >
              <Typography style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                {opt.label}
              </Typography>
              <Typography variant="caption" style={styles.optionDesc}>
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
  container: { marginBottom: 20 },
  label: {
    color: '#8A8D98',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  row: { flexDirection: 'row', gap: 10 },
  option: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2D2D44',
    backgroundColor: '#0A0A0F',
  },
  optionSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
  },
  optionLabel: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
    color: '#94A3B8',
  },
  optionLabelSelected: {
    color: '#C7D2FE',
  },
  optionDesc: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },
});
