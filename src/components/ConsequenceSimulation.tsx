import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, featureSection } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';

interface ConsequenceSimulationProps {
  results: AnalysisResult;
}

function parseNumberFromString(str: string): { value: number; prefix: string; suffix: string } | null {
  if (!str) return null;
  const regex = /([^\d.-]*)([-+]?[\d.]+)([^\d]*)/;
  const match = str.match(regex);
  if (match) {
    const prefix = match[1] || '';
    const value = parseFloat(match[2]);
    const suffix = match[3] || '';
    if (!isNaN(value)) {
      return { value, prefix, suffix };
    }
  }
  return null;
}

function getRiskColor(risk: number): string {
  if (risk >= 70) return '#F87171'; // Red
  if (risk >= 40) return '#FBBF24'; // Amber
  return '#34D399'; // Emerald
}

function getRiskBg(risk: number): string {
  if (risk >= 70) return 'rgba(239, 68, 68, 0.12)';
  if (risk >= 40) return 'rgba(245, 158, 11, 0.12)';
  return 'rgba(16, 185, 129, 0.12)';
}

function getRiskBorder(risk: number): string {
  if (risk >= 70) return 'rgba(239, 68, 68, 0.3)';
  if (risk >= 40) return 'rgba(245, 158, 11, 0.3)';
  return 'rgba(16, 185, 129, 0.3)';
}

export function ConsequenceSimulation({ results }: ConsequenceSimulationProps) {
  const {
    beforeMetric = 'N/A',
    afterMetric = 'N/A',
    doNothingOutlook = 'Problems will escalate without intervention.',
    doActionOutlook = 'Following the plan will stabilize operations and reduce risks.',
    riskScore = 50,
    impactMetricLabel = 'Impact Metric',
  } = results;

  const parsedBefore = parseNumberFromString(beforeMetric);
  const parsedAfter = parseNumberFromString(afterMetric);

  // Determine if a higher number is better (e.g. Uptime) or a lower number is better (e.g. Churn)
  let higherIsBetter = false;
  if (parsedBefore && parsedAfter) {
    higherIsBetter = parsedAfter.value > parsedBefore.value;
  } else {
    const lbl = impactMetricLabel.toLowerCase();
    const positiveWords = ['uptime', 'revenue', 'retention', 'satisfaction', 'csat', 'profit', 'renewals', 'growth', 'saves'];
    higherIsBetter = positiveWords.some(w => lbl.includes(w));
  }

  // Format Helper
  const formatMetric = (val: number, prefix: string, suffix: string) => {
    return `${prefix}${val.toFixed(val % 1 === 0 ? 0 : 1)}${suffix}`;
  };

  // Trajectory Calculations - PATH A: DO NOTHING
  const doNothingDay0Val = beforeMetric;
  const doNothingDay0Risk = riskScore;
  
  let doNothingDay7Val = 'Escalating...';
  const doNothingDay7Risk = Math.min(100, riskScore + 12);
  let doNothingDay30Val = 'Critical state';
  const doNothingDay30Risk = Math.min(100, riskScore + 25);

  if (parsedBefore) {
    const { value, prefix, suffix } = parsedBefore;
    if (higherIsBetter) {
      doNothingDay7Val = formatMetric(value * 0.9, prefix, suffix);
      doNothingDay30Val = formatMetric(value * 0.75, prefix, suffix);
    } else {
      doNothingDay7Val = formatMetric(value * 1.2, prefix, suffix);
      doNothingDay30Val = formatMetric(value * 1.5, prefix, suffix);
    }
  }

  // Trajectory Calculations - PATH B: ACT NOW
  const actNowDay0Val = beforeMetric;
  const actNowDay0Risk = riskScore;

  let actNowDay7Val = 'Stabilizing...';
  const actNowDay7Risk = Math.max(10, Math.round(riskScore * 0.55));
  const actNowDay30Val = afterMetric;
  const actNowDay30Risk = Math.max(5, Math.round(riskScore * 0.18));

  if (parsedBefore && parsedAfter) {
    const { value: beforeVal } = parsedBefore;
    const { value: afterVal, prefix, suffix } = parsedAfter;
    actNowDay7Val = formatMetric(beforeVal + (afterVal - beforeVal) * 0.5, prefix, suffix);
  } else if (parsedBefore) {
    const { value, prefix, suffix } = parsedBefore;
    if (higherIsBetter) {
      actNowDay7Val = formatMetric(value * 1.05, prefix, suffix);
    } else {
      actNowDay7Val = formatMetric(value * 0.85, prefix, suffix);
    }
  }

  return (
    <Card variant="accent" style={featureSection}>
      <View style={styles.header}>
        <Clock size={20} color={colors.warning} />
        <Typography variant="h3" style={styles.title}>
          {UI.results.consequenceTitle}
        </Typography>
      </View>
      <Typography variant="caption" style={styles.subtitle}>
        {UI.results.consequenceHint}
      </Typography>

      {/* Path A: DO NOTHING */}
      <View style={styles.pathContainer}>
        <View style={[styles.pathHeader, styles.borderRed]}>
          <AlertTriangle size={15} color="#EF4444" />
          <Typography style={styles.pathTitleRed}>{UI.results.pathDoNothing}</Typography>
        </View>
        
        <View style={styles.timeline}>
          {/* Day 0 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineNode, { backgroundColor: '#EF4444' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]} />
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.nodeHeader}>
                <Typography style={styles.nodeTime}>Today (Day 0)</Typography>
                <View style={styles.badgeRow}>
                  <View style={[styles.metricBadge, styles.bgRedText]}>
                    <Typography style={styles.metricTextRed}>{doNothingDay0Val}</Typography>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskBg(doNothingDay0Risk), borderColor: getRiskBorder(doNothingDay0Risk) }]}>
                    <Typography style={[styles.riskText, { color: getRiskColor(doNothingDay0Risk) }]}>
                      Risk: {doNothingDay0Risk}%
                    </Typography>
                  </View>
                </View>
              </View>
              <Typography style={styles.nodeDesc}>Current baseline state under active stress indicators.</Typography>
            </View>
          </View>

          {/* Day 7 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineNode, { backgroundColor: '#F87171' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]} />
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.nodeHeader}>
                <Typography style={styles.nodeTime}>Day 7 Projection</Typography>
                <View style={styles.badgeRow}>
                  <View style={[styles.metricBadge, styles.bgRedText]}>
                    <Typography style={styles.metricTextRed}>{doNothingDay7Val}</Typography>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskBg(doNothingDay7Risk), borderColor: getRiskBorder(doNothingDay7Risk) }]}>
                    <Typography style={[styles.riskText, { color: getRiskColor(doNothingDay7Risk) }]}>
                      Risk: {doNothingDay7Risk}%
                    </Typography>
                  </View>
                </View>
              </View>
              <Typography style={styles.nodeDesc}>Systemic degradation spreads as early anomalies remain unresolved.</Typography>
            </View>
          </View>

          {/* Day 30 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineNode, { backgroundColor: '#B91C1C' }]} />
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.nodeHeader}>
                <Typography style={styles.nodeTime}>Day 30 Projection</Typography>
                <View style={styles.badgeRow}>
                  <View style={[styles.metricBadge, styles.bgRedText]}>
                    <Typography style={styles.metricTextRed}>{doNothingDay30Val}</Typography>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskBg(doNothingDay30Risk), borderColor: getRiskBorder(doNothingDay30Risk) }]}>
                    <Typography style={[styles.riskText, { color: getRiskColor(doNothingDay30Risk) }]}>
                      Risk: {doNothingDay30Risk}%
                    </Typography>
                  </View>
                </View>
              </View>
              <Typography style={styles.nodeDesc}>{doNothingOutlook}</Typography>
            </View>
          </View>
        </View>
      </View>

      {/* Path B: ACT NOW */}
      <View style={styles.pathContainer}>
        <View style={[styles.pathHeader, styles.borderGreen]}>
          <CheckCircle size={15} color="#10B981" />
          <Typography style={styles.pathTitleGreen}>{UI.results.pathActNow}</Typography>
        </View>

        <View style={styles.timeline}>
          {/* Day 0 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineNode, { backgroundColor: '#10B981' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]} />
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.nodeHeader}>
                <Typography style={styles.nodeTime}>Today (Day 0)</Typography>
                <View style={styles.badgeRow}>
                  <View style={[styles.metricBadge, styles.bgGreenText]}>
                    <Typography style={styles.metricTextGreen}>{actNowDay0Val}</Typography>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskBg(actNowDay0Risk), borderColor: getRiskBorder(actNowDay0Risk) }]}>
                    <Typography style={[styles.riskText, { color: getRiskColor(actNowDay0Risk) }]}>
                      Risk: {actNowDay0Risk}%
                    </Typography>
                  </View>
                </View>
              </View>
              <Typography style={styles.nodeDesc}>Deploy priority remediation actions outlined by InsightFlow.</Typography>
            </View>
          </View>

          {/* Day 7 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineNode, { backgroundColor: '#34D399' }]} />
              <View style={[styles.timelineLine, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]} />
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.nodeHeader}>
                <Typography style={styles.nodeTime}>Day 7 Projection</Typography>
                <View style={styles.badgeRow}>
                  <View style={[styles.metricBadge, styles.bgGreenText]}>
                    <Typography style={styles.metricTextGreen}>{actNowDay7Val}</Typography>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskBg(actNowDay7Risk), borderColor: getRiskBorder(actNowDay7Risk) }]}>
                    <Typography style={[styles.riskText, { color: getRiskColor(actNowDay7Risk) }]}>
                      Risk: {actNowDay7Risk}%
                    </Typography>
                  </View>
                </View>
              </View>
              <Typography style={styles.nodeDesc}>Remediation playbook initiated. Negative trend lines stabilize.</Typography>
            </View>
          </View>

          {/* Day 30 */}
          <View style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={[styles.timelineNode, { backgroundColor: '#047857' }]} />
            </View>
            <View style={styles.timelineRight}>
              <View style={styles.nodeHeader}>
                <Typography style={styles.nodeTime}>Day 30 Projection</Typography>
                <View style={styles.badgeRow}>
                  <View style={[styles.metricBadge, styles.bgGreenText]}>
                    <Typography style={styles.metricTextGreen}>{actNowDay30Val}</Typography>
                  </View>
                  <View style={[styles.riskBadge, { backgroundColor: getRiskBg(actNowDay30Risk), borderColor: getRiskBorder(actNowDay30Risk) }]}>
                    <Typography style={[styles.riskText, { color: getRiskColor(actNowDay30Risk) }]}>
                      Risk: {actNowDay30Risk}%
                    </Typography>
                  </View>
                </View>
              </View>
              <Typography style={styles.nodeDesc}>{doActionOutlook}</Typography>
            </View>
          </View>
        </View>
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
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 20,
  },
  pathContainer: {
    backgroundColor: 'rgba(10, 10, 20, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    marginBottom: 16,
  },
  pathHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    marginBottom: 14,
    borderBottomWidth: 1,
  },
  borderRed: {
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderBottomColor: 'rgba(239, 68, 68, 0.15)',
  },
  borderGreen: {
    borderColor: 'rgba(16, 185, 129, 0.15)',
    borderBottomColor: 'rgba(16, 185, 129, 0.15)',
  },
  pathTitleRed: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
  },
  pathTitleGreen: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  timelineLeft: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
  },
  timelineNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 9,
    top: 15,
    bottom: -19,
    width: 2,
    zIndex: 1,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  nodeTime: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  bgRedText: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  bgGreenText: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  metricTextRed: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F87171',
  },
  metricTextGreen: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34D399',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '800',
  },
  nodeDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
});
