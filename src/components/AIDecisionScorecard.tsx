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
        color: '#10B981',
      },
      {
        id: 'urgency',
        name: UI.results.scoreUrgency,
        score: metrics.urgency,
        explanation: UI.results.scoreUrgencyHint,
        icon: Flame,
        color: '#EF4444',
      },
      {
        id: 'financial',
        name: UI.results.scoreFinancial,
        score: metrics.financialImpact,
        explanation: UI.results.scoreFinancialHint,
        icon: CircleDollarSign,
        color: '#EC4899',
      },
      {
        id: 'operational',
        name: UI.results.scoreOperational,
        score: metrics.operationalRisk,
        explanation: UI.results.scoreOperationalHint,
        icon: AlertOctagon,
        color: '#F97316',
      },
      {
        id: 'execution',
        name: UI.results.scoreExecution,
        score: metrics.executionComplexity,
        explanation: UI.results.scoreExecutionHint,
        icon: BarChart3,
        color: '#8B5CF6',
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
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <TrendingUp size={18} color="#C084FC" />
          <Typography variant="h3" style={styles.title}>
            {UI.results.scorecardTitle}
          </Typography>
        </View>
        <View style={styles.badge}>
          <Typography style={styles.badgeText}>
            {fromAi ? UI.results.scorecardBadge : 'ESTIMATED'}
          </Typography>
        </View>
      </View>

      <Typography variant="caption" style={styles.subtitle}>
        {UI.results.scorecardHint}
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
  card: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.45)',
    backgroundColor: 'rgba(20, 10, 40, 0.45)',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: '#F3E8FF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  badge: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
  },
  badgeText: {
    color: '#C084FC',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  subtitle: {
    color: '#94A3B8',
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
    color: '#E2E8F0',
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
    color: '#94A3B8',
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
    backgroundColor: '#1E1E2F',
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
