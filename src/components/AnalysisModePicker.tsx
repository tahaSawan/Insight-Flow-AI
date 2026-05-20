import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '@/components/Typography';
import { ANALYSIS_MODE_OPTIONS, type AnalysisMode } from '@/types/analysis';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing, radius } from '@/constants/designTokens';

interface AnalysisModePickerProps {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
}

export function AnalysisModePicker({ value, onChange }: AnalysisModePickerProps) {
  return (
    <View style={styles.container}>
      <Typography variant="caption" style={styles.label}>
        {UI.modePicker.label}
      </Typography>
      <View style={styles.row}>
        {ANALYSIS_MODE_OPTIONS.map((opt) => {
          const selected = value === opt.id;
          return (
            <Pressable
              key={opt.id}
              onPress={() => onChange(opt.id)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}
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
  container: { marginBottom: spacing.lg },
  label: {
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  row: { flexDirection: 'row', gap: 10 },
  option: {
    flex: 1,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  optionSelected: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentSoft,
  },
  pressed: { opacity: 0.85 },
  optionLabel: {
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
    color: colors.textSecondary,
  },
  optionLabelSelected: {
    color: colors.accentText,
  },
  optionDesc: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
});
