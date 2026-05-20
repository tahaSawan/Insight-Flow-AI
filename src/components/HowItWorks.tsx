import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UploadCloud, BrainCircuit, Target } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius } from '@/constants/designTokens';

const STEPS = [
  { icon: UploadCloud, label: 'Upload', color: colors.accent, bg: colors.accentSoft },
  { icon: BrainCircuit, label: 'Analyze', color: colors.info, bg: colors.infoSoft },
  { icon: Target, label: 'Decide & act', color: colors.success, bg: colors.successSoft },
] as const;

export function HowItWorks() {
  return (
    <View style={styles.wrap}>
      <Typography variant="label">How it works</Typography>
      <View style={styles.row}>
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <View key={step.label} style={styles.step}>
              <View style={[styles.iconCircle, { backgroundColor: step.bg, borderColor: `${step.color}44` }]}>
                <Icon size={20} color={step.color} />
              </View>
              <Typography style={styles.stepLabel}>{step.label}</Typography>
              {index < STEPS.length - 1 ? (
                <View style={styles.connector} />
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
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  connector: {
    position: 'absolute',
    top: 20,
    right: -12,
    width: 24,
    height: 2,
    backgroundColor: colors.borderStrong,
    borderRadius: 1,
  },
});
