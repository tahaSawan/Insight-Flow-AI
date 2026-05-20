import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';
import { UI } from '@/constants/plainLanguage';
import { WINNING_DEMO_INPUT_LABEL } from '@/constants/winningDemoScenario';
import type { AnalysisResult } from '@/types/analysis';
import { colors, spacing, radius } from '@/constants/designTokens';

interface DemoSummaryCardProps {
  results: AnalysisResult;
}

function SummaryRow({
  label,
  value,
  done,
}: {
  label: string;
  value: string;
  done: boolean;
}) {
  const Icon = done ? CheckCircle2 : Circle;
  const iconColor = done ? colors.accentSecondary : colors.textDim;

  return (
    <View style={styles.row}>
      <Icon size={18} color={iconColor} />
      <View style={styles.rowBody}>
        <Typography variant="caption" style={styles.rowLabel}>
          {label}
        </Typography>
        <Typography style={styles.rowValue} numberOfLines={3}>
          {value}
        </Typography>
      </View>
    </View>
  );
}

export function DemoSummaryCard({ results }: DemoSummaryCardProps) {
  const { demoMode, demoActionExecuted, sourceFileName } = useAppContext();
  if (!demoMode) return null;

  const inputLabel =
    sourceFileName?.replace(/\.[^.]+$/, '').replace(/-/g, ' ') ||
    WINNING_DEMO_INPUT_LABEL;

  const riskLine =
    results.urgencyHeadline ||
    `Risk score ${results.riskScore} — ${results.priorityLevel} priority`;

  const actionLine =
    results.autonomousDecision?.primaryDecision ||
    results.recommendedActions[0] ||
    'Recovery plan selected';

  const outcomeLine = `${results.beforeMetric} → ${results.afterMetric}`;

  return (
    <Card
      variant="success"
      title={UI.demo.summaryTitle}
      subtitle={UI.demo.summaryHint}
      entranceIndex={5}
      glowActive={demoActionExecuted}
      style={styles.card}
    >
      <SummaryRow label={UI.demo.summaryInput} value={inputLabel} done />
      <SummaryRow label={UI.demo.summaryRisk} value={riskLine} done />
      <SummaryRow
        label={UI.demo.summaryAction}
        value={demoActionExecuted ? actionLine : UI.demo.summaryActionPending}
        done={demoActionExecuted}
      />
      <SummaryRow
        label={UI.demo.summaryOutcome}
        value={demoActionExecuted ? outcomeLine : UI.demo.summaryOutcomePending}
        done={demoActionExecuted}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  rowValue: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
});
