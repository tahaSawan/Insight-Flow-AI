import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius, fontSize } from '@/constants/designTokens';

export type DemoStepId = 'document' | 'analyze' | 'decide' | 'act';

const STEPS: { id: DemoStepId; label: string }[] = [
  { id: 'document', label: 'Document' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'decide', label: 'Decide' },
  { id: 'act', label: 'Act' },
];

interface DemoStepBarProps {
  current: DemoStepId;
}

export function DemoStepBar({ current }: DemoStepBarProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <View style={styles.wrap}>
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = step.id === current;
        return (
          <View key={step.id} style={styles.step}>
            <View
              style={[
                styles.dot,
                done && styles.dotDone,
                active && styles.dotActive,
              ]}
            >
              {done ? (
                <Check size={10} color={colors.text} strokeWidth={3} />
              ) : (
                <Typography style={[styles.dotNum, active && styles.dotNumActive]}>
                  {index + 1}
                </Typography>
              )}
            </View>
            <Typography
              style={[styles.label, active && styles.labelActive, done && styles.labelDone]}
              numberOfLines={1}
            >
              {step.label}
            </Typography>
            {index < STEPS.length - 1 ? (
              <View style={[styles.connector, done && styles.connectorDone]} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  dotDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  dotNum: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  dotNumActive: {
    color: colors.text,
  },
  label: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelActive: {
    color: colors.accentText,
    fontWeight: '800',
  },
  labelDone: {
    color: colors.textSecondary,
  },
  connector: {
    position: 'absolute',
    top: 12,
    left: '58%',
    right: '-42%',
    height: 2,
    backgroundColor: colors.border,
    zIndex: -1,
  },
  connectorDone: {
    backgroundColor: colors.success,
    opacity: 0.45,
  },
});
