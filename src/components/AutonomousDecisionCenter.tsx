import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, BrainCircuit, ShieldAlert, TrendingUp } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, featureSection, spacing, radius } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';
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
    <Card
      variant="elevated"
      highlighted
      style={[featureSection, styles.prominentCard]}
      icon={<BrainCircuit size={22} color={colors.accent} />}
      title={UI.results.decisionCenterTitle}
      subtitle={UI.results.decisionCenterHint}
    >
      <View style={styles.headerBadgeRow}>
        <View style={styles.pickBadge}>
          <Typography variant="badgeText">{UI.results.decisionTopPick}</Typography>
        </View>
      </View>

      <View style={styles.decisionContainer}>
        <View style={styles.decisionHeaderRow}>
          <Sparkles size={14} color={colors.accent} />
          <Typography variant="decisionLabel">{UI.results.decisionTopAction}</Typography>
        </View>
        <Typography variant="decisionText">{decision.primaryDecision}</Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="metricLabel" style={styles.sectionLabel}>
          {UI.results.decisionWhy}
        </Typography>
        <View style={styles.reasonBox}>
          <Typography variant="bodyMuted" numberOfLines={4}>
            {decision.reason}
          </Typography>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <TrendingUp size={14} color={colors.success} />
          <Typography variant="metricLabel" style={styles.sectionLabelGreen}>
            {UI.results.decisionExpected}
          </Typography>
        </View>
        <View style={styles.outcomeBox}>
          <Typography variant="bodyMuted" numberOfLines={3}>
            {decision.expectedOutcome}
          </Typography>
        </View>
      </View>

      <View style={styles.priorityRow}>
        <Typography variant="metricLabel">Priority</Typography>
        <View style={[styles.priorityBadge, { backgroundColor: priorityBg, borderColor: priorityBorder }]}>
          <ShieldAlert size={12} color={priorityColor} style={styles.priorityIcon} />
          <Typography variant="badgeText" style={{ color: priorityColor }}>
            {decision.priorityLevel}
          </Typography>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  prominentCard: {
    padding: spacing.lg,
    borderWidth: 1.5,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 10,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  pickBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderAccent,
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
  section: {
    marginBottom: textBlock.md,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabel: {
    marginBottom: textBlock.sm,
  },
  sectionLabelGreen: {
    color: colors.success,
    marginBottom: textBlock.sm,
  },
  reasonBox: {
    backgroundColor: colors.bg,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    padding: 10,
    borderRadius: radius.sm,
  },
  outcomeBox: {
    backgroundColor: colors.bg,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
    padding: 10,
    borderRadius: radius.sm,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
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
});
