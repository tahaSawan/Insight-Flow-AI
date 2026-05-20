import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, BrainCircuit, ShieldAlert, TrendingUp } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import { UI } from '@/constants/plainLanguage';
import { colors, featureSection, spacing, radius } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';

interface AutonomousDecisionCenterProps {
  results: AnalysisResult;
}

export function AutonomousDecisionCenter({ results }: AutonomousDecisionCenterProps) {
  const decision = results.autonomousDecision || {
    primaryDecision: results.recommendedActions[0] || 'Deploy standard operational adjustments',
    reason: `Automatically prioritized to immediately address the core risks highlighted in the ${results.impactMetricLabel || 'business'} analysis.`,
    priorityLevel: results.priorityLevel || 'High',
    expectedOutcome:
      results.doActionOutlook ||
      `Improve ${results.impactMetricLabel || 'key metrics'} from ${results.beforeMetric || 'current levels'} toward ${results.afterMetric || 'target levels'}.`,
    confidence: results.confidence || 85,
  };

  const priority = decision.priorityLevel.toLowerCase();
  const isHighPriority = priority === 'high';
  const isMediumPriority = priority === 'medium';

  const priorityColor = isHighPriority ? colors.danger : isMediumPriority ? colors.warning : colors.info;
  const priorityBg = isHighPriority
    ? 'rgba(239, 68, 68, 0.12)'
    : isMediumPriority
      ? 'rgba(245, 158, 11, 0.12)'
      : 'rgba(59, 130, 246, 0.12)';
  const priorityBorder = isHighPriority
    ? 'rgba(239, 68, 68, 0.35)'
    : isMediumPriority
      ? 'rgba(245, 158, 11, 0.35)'
      : 'rgba(59, 130, 246, 0.35)';

  return (
    <Card variant="accent" style={featureSection}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <BrainCircuit size={20} color={colors.accent} />
          <Typography variant="h3" style={styles.title}>
            {UI.results.decisionCenterTitle}
          </Typography>
        </View>
        <View style={styles.pickBadge}>
          <Typography style={styles.pickBadgeText}>{UI.results.decisionTopPick}</Typography>
        </View>
      </View>

      <Typography variant="caption" style={styles.subtitle}>
        {UI.results.decisionCenterHint}
      </Typography>

      <View style={styles.decisionContainer}>
        <View style={styles.decisionHeaderRow}>
          <Sparkles size={14} color={colors.accent} />
          <Typography style={styles.decisionLabel}>{UI.results.decisionTopAction}</Typography>
        </View>
        <Typography style={styles.decisionText}>{decision.primaryDecision}</Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="caption" style={styles.sectionLabel}>
          {UI.results.decisionWhy}
        </Typography>
        <View style={styles.reasonBox}>
          <Typography style={styles.reasonText}>{decision.reason}</Typography>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <TrendingUp size={14} color={colors.success} />
          <Typography variant="caption" style={styles.sectionLabelGreen}>
            {UI.results.decisionExpected}
          </Typography>
        </View>
        <View style={styles.outcomeBox}>
          <Typography style={styles.outcomeText}>{decision.expectedOutcome}</Typography>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.grid}>
        <View style={styles.gridCol}>
          <Typography variant="caption" style={styles.gridLabel}>
            Priority
          </Typography>
          <View style={[styles.priorityBadge, { backgroundColor: priorityBg, borderColor: priorityBorder }]}>
            <ShieldAlert size={12} color={priorityColor} style={styles.priorityIcon} />
            <Typography style={[styles.priorityText, { color: priorityColor }]}>
              {decision.priorityLevel}
            </Typography>
          </View>
        </View>

        <View style={[styles.gridCol, styles.rightCol]}>
          <View style={styles.confidenceHeader}>
            <Typography variant="caption" style={styles.gridLabel}>
              Confidence
            </Typography>
            <Typography style={styles.confidenceVal}>{decision.confidence}%</Typography>
          </View>
          <ProgressBar progress={decision.confidence} color={colors.accent} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  pickBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  pickBadgeText: {
    color: colors.accentText,
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  decisionContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  decisionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  decisionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  decisionText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  section: {
    marginBottom: 12,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 6,
  },
  sectionLabelGreen: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 6,
  },
  reasonBox: {
    backgroundColor: colors.bg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: 10,
    borderRadius: radius.sm,
  },
  reasonText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
  outcomeBox: {
    backgroundColor: colors.bg,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    padding: 10,
    borderRadius: radius.sm,
  },
  outcomeText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridCol: {
    flex: 1,
  },
  rightCol: {
    flex: 1.2,
    marginLeft: 20,
  },
  gridLabel: {
    color: colors.textMuted,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  priorityIcon: {
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  confidenceVal: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
  },
});
