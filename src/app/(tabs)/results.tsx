import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';

export default function ResultsScreen() {
  const router = useRouter();
  const { analysisResults, uploadedText } = useAppContext();
  const [exportMessage, setExportMessage] = useState('');

  useEffect(() => {
    if (!analysisResults) {
      if (uploadedText.trim()) {
        router.replace('/analysis');
      } else {
        router.replace('/upload');
      }
    }
  }, [analysisResults, uploadedText, router]);

  if (!analysisResults) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.emptyState}>
          <Typography variant="h2">No results yet</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Run an analysis from Upload to see your AI decision report.
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const results = analysisResults;

  const handleExport = () => {
    setExportMessage('Report exported successfully');
    setTimeout(() => {
      setExportMessage('');
    }, 3000);
  };

  const renderMetricBar = (label: string, value: string, percentage: number, colorStyle: any) => (
    <View style={styles.metricContainer}>
      <View style={styles.metricHeader}>
        <Typography variant="caption" style={styles.metricLabel}>{label}</Typography>
        <Typography style={styles.metricValue}>{value}</Typography>
      </View>
      <View style={styles.metricBarBg}>
        <View style={[styles.metricBarFill, colorStyle, { width: `${percentage}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>AI Decision Report</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Generated insights and recommended actions.
          </Typography>
        </View>

        {/* Executive Summary */}
        <Card style={styles.summaryCard}>
          <Typography variant="h2" style={styles.cardTitle}>Executive Summary</Typography>
          
          <View style={styles.metricsGroup}>
            {renderMetricBar('Risk Score', `${results.riskScore}/100`, results.riskScore, styles.bgRed)}
            {renderMetricBar('Confidence', `${results.confidence}%`, results.confidence, styles.bgEmerald)}
          </View>
          
          <View style={styles.summaryRow}>
            <Typography variant="caption">Priority Level:</Typography>
            <View style={styles.priorityBadge}>
              <Typography style={styles.priorityText}>{results.priorityLevel}</Typography>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Typography variant="caption">Estimated Impact:</Typography>
            <Typography style={styles.impactText}>{results.estimatedImpact}</Typography>
          </View>
        </Card>

        {/* Key Findings */}
        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitleIndigo}>Key Findings</Typography>
          {results.keyFindings.map((finding, index) => (
            <View key={`finding-${index}`} style={styles.listItem}>
              <View style={styles.bulletIndigo} />
              <Typography style={styles.listText}>{finding}</Typography>
            </View>
          ))}
        </Card>

        {/* Risk Assessment */}
        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitleAmber}>Risk Assessment</Typography>
          {results.riskAssessment.map((risk, index) => (
            <View key={`risk-${index}`} style={styles.listItem}>
              <View style={styles.bulletAmber} />
              <Typography style={styles.listText}>{risk}</Typography>
            </View>
          ))}
        </Card>

        {/* Recommended Actions */}
        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitleEmerald}>Recommended Actions</Typography>
          {results.recommendedActions.map((action, index) => (
            <View key={`action-${index}`} style={styles.listItem}>
              <View style={styles.bulletEmerald} />
              <Typography style={styles.listText}>{action}</Typography>
            </View>
          ))}
        </Card>

        {/* Simulated Actions */}
        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitlePurple}>Automated Actions Executed</Typography>
          
          <View style={styles.actionRow}>
            <View style={styles.actionIconBox}>
              <Typography style={styles.actionIcon}>📊</Typography>
            </View>
            <View style={styles.actionBody}>
              <Typography style={styles.actionTitle}>Dashboard Updated</Typography>
              <Typography variant="caption" style={styles.actionDesc}>Live metrics refreshed</Typography>
            </View>
            <View style={styles.actionBadge}>
              <Typography style={styles.actionBadgeText}>DONE</Typography>
            </View>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.actionIconBox}>
              <Typography style={styles.actionIcon}>🔔</Typography>
            </View>
            <View style={styles.actionBody}>
              <Typography style={styles.actionTitle}>Alert Triggered</Typography>
              <Typography variant="caption" style={styles.actionDesc}>Notified operations team</Typography>
            </View>
            <View style={styles.actionBadge}>
              <Typography style={styles.actionBadgeText}>DONE</Typography>
            </View>
          </View>

          <View style={styles.actionRow}>
            <View style={styles.actionIconBox}>
              <Typography style={styles.actionIcon}>✉️</Typography>
            </View>
            <View style={styles.actionBody}>
              <Typography style={styles.actionTitle}>Email Generated</Typography>
              <Typography variant="caption" style={styles.actionDesc}>Drafted to stakeholders</Typography>
            </View>
            <View style={styles.actionBadge}>
              <Typography style={styles.actionBadgeText}>DONE</Typography>
            </View>
          </View>
        </Card>

        {/* Before vs After */}
        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitlePink}>Projected Impact</Typography>
          <View style={styles.impactContainer}>
            <View style={styles.impactBoxBefore}>
              <Typography variant="caption" style={styles.impactBoxTitle}>Before</Typography>
              <Typography style={styles.impactBoxValueBefore}>{results.beforeChurn}</Typography>
              <Typography style={styles.impactBoxDesc}>Churn Rate</Typography>
            </View>
            <View style={styles.impactArrow}>
              <Typography style={styles.impactArrowText}>→</Typography>
            </View>
            <View style={styles.impactBoxAfter}>
              <Typography variant="caption" style={styles.impactBoxTitleAfter}>After</Typography>
              <Typography style={styles.impactBoxValueAfter}>{results.afterChurn}</Typography>
              <Typography style={styles.impactBoxDesc}>Projected Churn</Typography>
            </View>
          </View>
        </Card>

        {/* Execution Logs */}
        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitleLog}>System Execution Logs</Typography>
          <View style={styles.logContainer}>
            <Typography style={styles.logLine}>
              <Typography style={styles.logTime}>[10:42:01]</Typography> Analysis initialized
            </Typography>
            <Typography style={styles.logLine}>
              <Typography style={styles.logTime}>[10:42:05]</Typography> Data models loaded successfully
            </Typography>
            <Typography style={styles.logLine}>
              <Typography style={styles.logTime}>[10:42:12]</Typography> Identified {results.riskAssessment.length} critical risk factors
            </Typography>
            <Typography style={styles.logLine}>
              <Typography style={styles.logTime}>[10:42:18]</Typography> Generating mitigation strategies...
            </Typography>
            <Typography style={styles.logLine}>
              <Typography style={styles.logTime}>[10:42:22]</Typography> Actions dispatched to connected systems
            </Typography>
            <Typography style={styles.logLine}>
              <Typography style={styles.logTime}>[10:42:24]</Typography> Process complete.
            </Typography>
          </View>
        </Card>

        {/* Actions */}
        <View style={styles.bottomActions}>
          <Button 
            title="Export Report"
            onPress={handleExport}
            style={styles.exportBtn}
          />
          {exportMessage ? <Typography style={styles.exportMsg}>{exportMessage}</Typography> : null}

          <Button 
            title="Back to Home"
            variant="outline"
            onPress={() => router.push('/')}
            style={styles.backBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40
  },
  header: {
    marginBottom: 32
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8
  },
  subtitle: {
    color: '#8A8D98',
    lineHeight: 24
  },
  summaryCard: {
    marginBottom: 24,
    padding: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 20
  },
  metricsGroup: {
    marginBottom: 20
  },
  metricContainer: {
    marginBottom: 16
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  metricLabel: {
    fontWeight: '500',
    color: '#94A3B8'
  },
  metricValue: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  metricBarBg: {
    height: 8,
    backgroundColor: '#1F1F2E',
    borderRadius: 4,
    overflow: 'hidden'
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4
  },
  bgRed: {
    backgroundColor: '#EF4444'
  },
  bgEmerald: {
    backgroundColor: '#10B981'
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E'
  },
  priorityBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  priorityText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  impactText: {
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
    fontSize: 14
  },
  sectionCard: {
    marginBottom: 16,
    padding: 20
  },
  sectionTitleIndigo: {
    color: '#6366F1',
    marginBottom: 16,
    fontSize: 18
  },
  sectionTitleAmber: {
    color: '#F59E0B',
    marginBottom: 16,
    fontSize: 18
  },
  sectionTitleEmerald: {
    color: '#10B981',
    marginBottom: 16,
    fontSize: 18
  },
  sectionTitlePurple: {
    color: '#A855F7',
    marginBottom: 16,
    fontSize: 18
  },
  sectionTitlePink: {
    color: '#EC4899',
    marginBottom: 16,
    fontSize: 18
  },
  sectionTitleLog: {
    color: '#94A3B8',
    marginBottom: 16,
    fontSize: 18
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  bulletIndigo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginRight: 12
  },
  bulletAmber: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 12
  },
  bulletEmerald: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 12
  },
  listText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    flex: 1
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  actionIcon: {
    fontSize: 18
  },
  actionBody: {
    flex: 1
  },
  actionTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2
  },
  actionDesc: {
    fontSize: 13
  },
  actionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  actionBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8
  },
  impactBoxBefore: {
    flex: 1,
    backgroundColor: '#1A1A24',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D44'
  },
  impactBoxTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 13
  },
  impactBoxValueBefore: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: '#FFFFFF'
  },
  impactBoxDesc: {
    fontSize: 12,
    color: '#94A3B8'
  },
  impactArrow: {
    paddingHorizontal: 12,
    justifyContent: 'center'
  },
  impactArrowText: {
    color: '#64748B',
    fontSize: 24,
    fontWeight: '300'
  },
  impactBoxAfter: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)'
  },
  impactBoxTitleAfter: {
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 13,
    color: '#10B981'
  },
  impactBoxValueAfter: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: '#10B981'
  },
  logContainer: {
    backgroundColor: '#05050A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A24'
  },
  logLine: {
    color: '#A1A1AA',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18
  },
  logTime: {
    color: '#6366F1',
    fontFamily: 'monospace',
    fontSize: 12
  },
  bottomActions: {
    marginTop: 24
  },
  exportBtn: {
    marginBottom: 12,
    paddingVertical: 16,
    borderRadius: 14
  },
  exportMsg: {
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500'
  },
  backBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    borderColor: '#2D2D44',
    borderWidth: 1
  }
});
