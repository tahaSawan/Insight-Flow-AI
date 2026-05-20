import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Typography } from '@/components/Typography';
import { USE_CASE_OPTIONS } from '@/constants/useCases';
import type { UseCaseType } from '@/types/analysis';
import { colors, spacing, radius } from '@/constants/designTokens';

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
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
              ]}
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
  container: { marginBottom: spacing.md },
  label: {
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  row: { gap: 8 },
  chip: {
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  chipSelected: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentSoft,
  },
  pressed: { opacity: 0.85 },
  chipLabel: { fontWeight: '700', fontSize: 14, color: colors.textSecondary, marginBottom: 4 },
  chipLabelSelected: { color: colors.accentText },
  chipDesc: { color: colors.textMuted, fontSize: 12, lineHeight: 16 },
});
