import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { PressableScale } from '@/components/PressableScale';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius } from '@/constants/designTokens';

export type ResultsSectionId =
  | 'alert'
  | 'decision'
  | 'compare'
  | 'actions'
  | 'trace'
  | 'more';

const CHIPS: { id: ResultsSectionId; label: string }[] = [
  { id: 'alert', label: 'Alert' },
  { id: 'decision', label: 'Decision' },
  { id: 'compare', label: 'Paths' },
  { id: 'actions', label: 'Actions' },
  { id: 'trace', label: 'Trace' },
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
          <PressableScale
            key={chip.id}
            onPress={() => onJump(chip.id)}
            pressedScale={0.96}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Typography
              variant="badgeText"
              style={[styles.chipText, isActive && styles.chipTextActive]}
            >
              {chip.label}
            </Typography>
          </PressableScale>
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
  chipText: {
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  chipTextActive: {
    color: colors.accentText,
  },
});
