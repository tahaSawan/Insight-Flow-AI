import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Sparkles, BrainCircuit, ShieldAlert, TrendingUp } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import type { AnalysisResult } from '@/types/analysis';

interface AutonomousDecisionCenterProps {
  results: AnalysisResult;
}

export function AutonomousDecisionCenter({ results }: AutonomousDecisionCenterProps) {
  // Graceful fallback if autonomousDecision is missing (backwards compatibility for old session reports)
  const decision = results.autonomousDecision || {
    primaryDecision: results.recommendedActions[0] || 'Deploy standard operational adjustments',
    reason: `Automatically prioritized to immediately address the core risks highlighted in the ${results.impactMetricLabel || 'business'} analysis.`,
    priorityLevel: results.priorityLevel || 'High',
    expectedOutcome: results.doActionOutlook || `Transition ${results.impactMetricLabel || 'key metrics'} from ${results.beforeMetric || 'current levels'} to projected target: ${results.afterMetric || 'improved levels'}.`,
    confidence: results.confidence || 85,
  };

  const isHighPriority = decision.priorityLevel.toLowerCase() === 'high';
  const isMediumPriority = decision.priorityLevel.toLowerCase() === 'medium';
  
  const priorityColor = isHighPriority 
    ? '#F87171' 
    : isMediumPriority 
      ? '#FBBF24' 
      : '#60A5FA';

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
    <Card style={styles.card}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <BrainCircuit size={22} color="#A855F7" />
          <Typography variant="h3" style={styles.title}>
            Autonomous Decision Center
          </Typography>
        </View>
        <View style={styles.activeBadge}>
          <View style={styles.activeDot} />
          <Typography style={styles.activeText}>AI CHOSEN</Typography>
        </View>
      </View>

      <Typography variant="caption" style={styles.subtitle}>
        Real-time prioritization engine selecting the single most impactful path forward.
      </Typography>

      {/* Main Focus: Primary Decision */}
      <View style={styles.decisionContainer}>
        <View style={styles.decisionHeaderRow}>
          <Sparkles size={14} color="#A855F7" />
          <Typography style={styles.decisionLabel}>PRIMARY DECISION PATH</Typography>
        </View>
        <Typography style={styles.decisionText}>
          {decision.primaryDecision}
        </Typography>
      </View>

      {/* Why This Action Was Selected (Justification) */}
      <View style={styles.section}>
        <Typography variant="caption" style={styles.sectionLabel}>
          DECISION RATIONALE
        </Typography>
        <View style={styles.reasonBox}>
          <Typography style={styles.reasonText}>
            {decision.reason}
          </Typography>
        </View>
      </View>

      {/* Expected Outcome */}
      <View style={styles.section}>
        <View style={styles.sectionLabelRow}>
          <TrendingUp size={14} color="#10B981" />
          <Typography variant="caption" style={styles.sectionLabelGreen}>
            EXPECTED OUTCOME
          </Typography>
        </View>
        <View style={styles.outcomeBox}>
          <Typography style={styles.outcomeText}>
            {decision.expectedOutcome}
          </Typography>
        </View>
      </View>

      {/* Stats Divider Line */}
      <View style={styles.divider} />

      {/* Grid: Priority and Confidence */}
      <View style={styles.grid}>
        {/* Priority Badge */}
        <View style={styles.gridCol}>
          <Typography variant="caption" style={styles.gridLabel}>
            PRIORITY
          </Typography>
          <View style={[styles.priorityBadge, { backgroundColor: priorityBg, borderColor: priorityBorder }]}>
            <ShieldAlert size={12} color={priorityColor} style={styles.priorityIcon} />
            <Typography style={[styles.priorityText, { color: priorityColor }]}>
              {decision.priorityLevel}
            </Typography>
          </View>
        </View>

        {/* Confidence Gauge */}
        <View style={[styles.gridCol, styles.rightCol]}>
          <View style={styles.confidenceHeader}>
            <Typography variant="caption" style={styles.gridLabel}>
              CONFIDENCE
            </Typography>
            <Typography style={styles.confidenceVal}>
              {decision.confidence}%
            </Typography>
          </View>
          <ProgressBar progress={decision.confidence} color="#A855F7" />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.45)', // Sleek Indigo/Purple neon border
    backgroundColor: 'rgba(20, 10, 40, 0.45)', // Premium futuristic translucent base
    shadowColor: '#A855F7',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: '#F3E8FF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#7F8EA3',
    lineHeight: 18,
    marginBottom: 16,
  },
  decisionContainer: {
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    padding: 14,
    marginBottom: 16,
  },
  decisionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  decisionLabel: {
    color: '#D8B4FE',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  decisionText: {
    color: '#FFFFFF',
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
    color: '#64748B',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sectionLabelGreen: {
    color: '#34D399',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reasonBox: {
    backgroundColor: '#13131F',
    borderLeftWidth: 3,
    borderLeftColor: '#A855F7',
    padding: 10,
    borderRadius: 6,
  },
  reasonText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
  },
  outcomeBox: {
    backgroundColor: '#13131F',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
    padding: 10,
    borderRadius: 6,
  },
  outcomeText: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 19,
  },
  divider: {
    height: 1,
    backgroundColor: '#1E1E2F',
    marginVertical: 14,
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
    color: '#64748B',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityIcon: {
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  confidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  confidenceVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  confidenceProgress: {
    height: 6,
    borderRadius: 3,
  },
});
