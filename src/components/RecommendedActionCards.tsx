import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, spacing, radius } from '@/constants/designTokens';
import { textBlock } from '@/constants/typography';
import type { AnalysisResult } from '@/types/analysis';

interface RecommendedActionCardsProps {
  results: AnalysisResult;
}

function priorityForIndex(index: number, overall: string): { label: string; color: string; bg: string; border: string } {
  if (index === 0) {
    const p = overall.toLowerCase();
    if (p === 'high' || p === 'critical')
      return { label: 'P1', color: colors.danger, bg: colors.dangerSoft, border: colors.borderDanger };
    return { label: 'P1', color: colors.warning, bg: colors.warningSoft, border: colors.borderWarning };
  }
  if (index === 1) return { label: 'P2', color: colors.accent, bg: colors.accentSoft, border: colors.borderAccent };
  return { label: 'P3', color: colors.textMuted, bg: colors.surfaceHighlight, border: colors.border };
}

export function RecommendedActionCards({ results }: RecommendedActionCardsProps) {
  /** P1 lives in Autonomous Decision Center — list supporting steps only */
  const actions = results.recommendedActions.slice(1, 4);
  if (!actions.length) return null;

  return (
    <View style={styles.wrap}>
      {actions.map((action, index) => {
        const pri = priorityForIndex(index, results.priorityLevel);
        return (
          <View
            key={`rec-${index}`}
            style={[styles.card, { backgroundColor: pri.bg, borderColor: pri.border }]}
          >
            <View style={[styles.badge, { borderColor: pri.border }]}>
              <Typography variant="badgeText" style={{ color: pri.color }}>
                {pri.label}
              </Typography>
            </View>
            <Typography variant="bodyMuted" style={styles.actionText} numberOfLines={3}>
              {action}
            </Typography>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: textBlock.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    backgroundColor: colors.surfaceElevated,
  },
  actionText: {
    flex: 1,
    fontWeight: '600',
  },
});
