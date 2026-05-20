import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import {
  ShieldCheck,
  Flame,
  CircleDollarSign,
  AlertOctagon,
  BarChart3,
  TrendingUp,
} from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, featureSection } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';
import {
  getDecisionScorecardScores,
  scoreSeverityLabel,
} from '@/utils/decisionScorecard';

interface AIDecisionScorecardProps {
  results: AnalysisResult;
}

interface ScoreItem {
  id: string;
  name: string;
  score: number;
  explanation: string;
  icon: React.ComponentType<{ size?: number; color?: string; style?: object }>;
  color: string;
}

const SCORE_COUNT = 5;

export function AIDecisionScorecard({ results }: AIDecisionScorecardProps) {
  const metrics = useMemo(() => getDecisionScorecardScores(results), [results]);
  const fromAi = Boolean(results.decisionScores);

  const scores = useMemo<ScoreItem[]>(
    () => [
      {
        id: 'confidence',
        name: UI.results.scoreConfidence,
        score: metrics.confidence,
        explanation: UI.results.scoreConfidenceHint,
        icon: ShieldCheck,
        color: colors.accentSecondary,
      },
      {
        id: 'urgency',
        name: UI.results.scoreUrgency,
        score: metrics.urgency,
        explanation: UI.results.scoreUrgencyHint,
        icon: Flame,
        color: colors.danger,
      },
      {
        id: 'financial',
        name: UI.results.scoreFinancial,
        score: metrics.financialImpact,
        explanation: UI.results.scoreFinancialHint,
        icon: CircleDollarSign,
        color: colors.accent,
      },
      {
        id: 'operational',
        name: UI.results.scoreOperational,
        score: metrics.operationalRisk,
        explanation: UI.results.scoreOperationalHint,
        icon: AlertOctagon,
        color: colors.warning,
      },
      {
        id: 'execution',
        name: UI.results.scoreExecution,
        score: metrics.executionComplexity,
        explanation: UI.results.scoreExecutionHint,
        icon: BarChart3,
        color: colors.accentDeep,
      },
    ],
    [metrics],
  );

  const animatedScores = useRef(
    Array.from({ length: SCORE_COUNT }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    animatedScores.forEach((anim) => anim.setValue(0));

    Animated.parallel(
      scores.map((item, index) =>
        Animated.timing(animatedScores[index], {
          toValue: item.score,
          duration: 1200,
          delay: index * 80,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, [results, scores, animatedScores]);

  return (
    <Card style={featureSection}>
      <View style={styles.header}>
        <TrendingUp size={18} color={colors.accent} />
        <Typography variant="h3" style={styles.title}>
          {UI.results.scorecardTitle}
        </Typography>
      </View>

      <Typography variant="caption" style={styles.subtitle}>
        {UI.results.scorecardHint}
        {!fromAi ? ' (estimated)' : ''}
      </Typography>

      <View style={styles.scoreList}>
        {scores.map((item, index) => {
          const ScoreIcon = item.icon;
          const animValue = animatedScores[index];
          const level = scoreSeverityLabel(item.score);

          return (
            <View key={item.id} style={styles.itemContainer}>
              <View style={styles.itemHeader}>
                <View style={styles.itemLabelRow}>
                  <ScoreIcon size={14} color={item.color} style={styles.itemIcon} />
                  <Typography style={styles.itemName}>{item.name}</Typography>
                </View>
                <View
                  style={[
                    styles.scoreValueContainer,
                    {
                      borderColor: `${item.color}55`,
                      backgroundColor: `${item.color}18`,
                    },
                  ]}
                >
                  <Typography style={[styles.scoreValueText, { color: item.color }]}>
                    {item.score}
                  </Typography>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Typography variant="caption" style={styles.itemDesc}>
                  {item.explanation}
                </Typography>
                <View style={[styles.levelPill, { borderColor: `${item.color}40` }]}>
                  <Typography style={[styles.levelText, { color: item.color }]}>
                    {level}
                  </Typography>
                </View>
              </View>

              <View style={styles.track}>
                <Animated.View
                  style={[
                    styles.fill,
                    {
                      backgroundColor: item.color,
                      width: animValue.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
    fontSize: 12,
  },
  scoreList: {
    gap: 14,
  },
  itemContainer: {
    width: '100%',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  itemIcon: {
    marginRight: 6,
  },
  itemName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  scoreValueContainer: {
    minWidth: 36,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  scoreValueText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 8,
  },
  itemDesc: {
    color: colors.textMuted,
    fontSize: 11.5,
    lineHeight: 16,
    flex: 1,
  },
  levelPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 12, 35, 0.6)',
  },
  levelText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  track: {
    height: 8,
    backgroundColor: colors.track,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
