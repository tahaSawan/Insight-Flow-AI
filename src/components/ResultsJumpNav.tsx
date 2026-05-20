import React from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius, fontSize } from '@/constants/designTokens';

export type ResultsSectionId =
  | 'alert'
  | 'decision'
  | 'consequences'
  | 'actions'
  | 'debate'
  | 'details'
  | 'more';

const CHIPS: { id: ResultsSectionId; label: string }[] = [
  { id: 'alert', label: 'Alert' },
  { id: 'decision', label: 'Decision' },
  { id: 'consequences', label: 'Impact' },
  { id: 'actions', label: 'Actions' },
  { id: 'debate', label: 'Debate' },
  { id: 'details', label: 'Details' },
  { id: 'more', label: 'More' },
];

interface ResultsJumpNavProps {
  active?: ResultsSectionId;
  onJump: (id: ResultsSectionId) => void;
}

export function ResultsJumpNav({ active, onJump }: ResultsJumpNavProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {CHIPS.map((chip) => {
        const isActive = active === chip.id;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onJump(chip.id)}
            style={({ pressed }) => [
              styles.chip,
              isActive && styles.chipActive,
              pressed && styles.chipPressed,
            ]}
          >
            <Typography style={[styles.chipText, isActive && styles.chipTextActive]}>
              {chip.label}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginBottom: spacing.md,
    flexGrow: 0,
  },
  row: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.borderAccent,
  },
  chipPressed: {
    opacity: 0.85,
  },
  chipText: {
    fontSize: fontSize.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.accentText,
    fontWeight: '800',
  },
});
