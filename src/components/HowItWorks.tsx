import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UploadCloud, BrainCircuit, Target } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius } from '@/constants/designTokens';

const STEPS = [
  { icon: UploadCloud, label: 'Upload', color: colors.accent },
  { icon: BrainCircuit, label: 'Analyze', color: colors.info },
  { icon: Target, label: 'Decide & act', color: colors.success },
] as const;

export function HowItWorks() {
  return (
    <View style={styles.wrap}>
      <Typography style={styles.title}>How it works</Typography>
      <View style={styles.row}>
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <View key={step.label} style={styles.step}>
              <View style={[styles.iconCircle, { borderColor: `${step.color}55` }]}>
                <Icon size={18} color={step.color} />
              </View>
              <Typography style={styles.stepLabel}>{step.label}</Typography>
              {index < STEPS.length - 1 ? (
                <Typography style={styles.arrow}>→</Typography>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  arrow: {
    position: 'absolute',
    right: -8,
    top: 10,
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
