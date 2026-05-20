import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Share, ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { AnimatedExecutionLog } from '@/components/AnimatedExecutionLog';
import { InsightList } from '@/components/InsightList';
import { AgentTracePanel } from '@/components/AgentTracePanel';
import { useAppContext } from '@/context/AppContext';
import { ANALYSIS_MODE_OPTIONS } from '@/types/analysis';
import { formatReportAsText } from '@/utils/formatReport';
import { SeverityTimeline } from '@/components/SeverityTimeline';
import { generateExecutiveBrief } from '@/services/gemini';
import { UI, looksLikeResume } from '@/constants/plainLanguage';
import { DecisionAlert } from '@/components/DecisionAlert';
import { ScenarioFork } from '@/components/ScenarioFork';
import { ActionCommander } from '@/components/ActionCommander';
import { AutonomousDecisionCenter } from '@/components/AutonomousDecisionCenter';
import { ConsequenceSimulation } from '@/components/ConsequenceSimulation';

export default function ResultsScreen() {
  const router = useRouter();
  const { analysisResults, uploadedText, analysisMode } = useAppContext();
  const modeLabel =
    ANALYSIS_MODE_OPTIONS.find((m) => m.id === analysisMode)?.label ?? 'Analysis';
  const [exportMessage, setExportMessage] = useState('');
  const [briefBullets, setBriefBullets] = useState<string[] | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

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
          <Typography variant="h2">{UI.results.emptyTitle}</Typography>
          <Typography variant="body" style={styles.subtitle}>
            {UI.results.emptySubtitle}
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const results = analysisResults;
  const showResumeTip = looksLikeResume(uploadedText);

  const handleShare = async () => {
    try {
      await Share.share({
        message: formatReportAsText(results),
        title: 'InsightFlow AI — Report',
      });
      setExportMessage('Report shared');
    } catch {
      setExportMessage('Could not open share sheet');
    }
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(formatReportAsText(results));
    setExportMessage('Copied to clipboard');
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleExecutiveBrief = async () => {
    setBriefLoading(true);
    setBriefBullets(null);
    try {
      const bullets = await generateExecutiveBrief(uploadedText, results);
      setBriefBullets(bullets);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate brief';
      setExportMessage(msg);
      setTimeout(() => setExportMessage(''), 4000);
    } finally {
      setBriefLoading(false);
    }
  };

  const renderMetricBar = (
    label: string,
    value: string,
    percentage: number,
    colorStyle: object,
  ) => (
    <View style={styles.metricContainer}>
      <View style={styles.metricHeader}>
        <Typography variant="caption" style={styles.metricLabel}>
          {label}
        </Typography>
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
          <View style={styles.modeBadge}>
            <Typography style={styles.modeBadgeText}>{modeLabel}</Typography>
          </View>
          <Typography variant="h1" style={styles.title}>
            {UI.results.title}
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            {UI.results.subtitle}
          </Typography>
        </View>

        {showResumeTip ? (
          <Card style={styles.resumeBanner}>
            <Typography style={styles.resumeBannerText}>{UI.results.resumeBanner}</Typography>
          </Card>
        ) : null}

        <DecisionAlert results={results} />

        <AutonomousDecisionCenter results={results} />

        <Card style={styles.heroCard}>
          <Typography variant="h3" style={styles.heroTitle}>
            Live action simulation
          </Typography>
          <Typography variant="caption" style={styles.sectionHint}>
            Approve steps, then execute — Slack, email, CRM (demo).
          </Typography>
          <ActionCommander results={results} />
        </Card>

        <Card style={styles.sectionCard}>
          <ScenarioFork results={results} />
          <SeverityTimeline results={results} />
        </Card>

        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitlePink}>
            {UI.results.impactTitle}
          </Typography>
          <Typography variant="caption" style={styles.sectionHint}>
            {UI.results.impactHint}
          </Typography>
          <View style={styles.impactContainer}>
            <View style={styles.impactBoxBefore}>
              <Typography variant="caption" style={styles.impactBoxTitle}>
                {UI.results.before}
              </Typography>
              <Typography style={styles.impactBoxValueBefore}>{results.beforeMetric}</Typography>
              <Typography style={styles.impactBoxDesc}>{results.impactMetricLabel}</Typography>
            </View>
            <View style={styles.impactArrow}>
              <Typography style={styles.impactArrowText}>→</Typography>
            </View>
            <View style={styles.impactBoxAfter}>
              <Typography variant="caption" style={styles.impactBoxTitleAfter}>
                {UI.results.after}
              </Typography>
              <Typography style={styles.impactBoxValueAfter}>{results.afterMetric}</Typography>
              <Typography style={styles.impactBoxDesc}>{UI.results.projected}</Typography>
            </View>
          </View>
        </Card>

        <ConsequenceSimulation results={results} />

        <Card style={styles.summaryCard}>
          <Typography variant="h2" style={styles.cardTitle}>
            {UI.results.summaryTitle}
          </Typography>
          <Typography variant="caption" style={styles.sectionHint}>
            {UI.results.summaryHint}
          </Typography>
          <Typography style={styles.executiveSummary}>{results.executiveSummary}</Typography>

          <View style={styles.metricsGroup}>
            {renderMetricBar(
              UI.results.problemSeriousness,
              `${results.riskScore}/100`,
              results.riskScore,
              styles.bgRed,
            )}
            {renderMetricBar(
              UI.results.howSure,
              `${results.confidence}%`,
              results.confidence,
              styles.bgEmerald,
            )}
          </View>
          <Typography variant="caption" style={styles.metricFootnote}>
            {UI.results.problemSeriousnessHint} · {UI.results.howSureHint}
          </Typography>

          <View style={styles.summaryRow}>
            <Typography variant="caption">{UI.results.priority}:</Typography>
            <View style={styles.priorityBadge}>
              <Typography style={styles.priorityText}>{results.priorityLevel}</Typography>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <Typography variant="caption">{UI.results.whatCouldHappen}:</Typography>
            <Typography style={styles.impactText}>{results.estimatedImpact}</Typography>
          </View>
        </Card>

        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitleIndigo}>
            {UI.results.findingsTitle}
          </Typography>
          <Typography variant="caption" style={styles.sectionHint}>
            {UI.results.findingsHint}
          </Typography>
          <InsightList
            items={results.keyFindings}
            type="finding"
            bulletStyle={styles.bulletIndigo}
            titleColor="#6366F1"
            documentText={uploadedText}
            analysis={results}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitleAmber}>
            {UI.results.problemsTitle}
          </Typography>
          <Typography variant="caption" style={styles.sectionHint}>
            {UI.results.problemsHint}
          </Typography>
          <InsightList
            items={results.riskAssessment}
            type="risk"
            bulletStyle={styles.bulletAmber}
            titleColor="#F59E0B"
            documentText={uploadedText}
            analysis={results}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitleEmerald}>
            {UI.results.actionsTitle}
          </Typography>
          <Typography variant="caption" style={styles.sectionHint}>
            {UI.results.actionsHint}
          </Typography>
          <InsightList
            items={results.recommendedActions}
            type="action"
            bulletStyle={styles.bulletEmerald}
            titleColor="#10B981"
            documentText={uploadedText}
            analysis={results}
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Typography variant="h3" style={styles.sectionTitleLog}>
            {UI.results.logsTitle}
          </Typography>
          <Typography variant="caption" style={styles.sectionHint}>
            {UI.results.logsHint}
          </Typography>
          <AnimatedExecutionLog lines={results.executionLog} />
        </Card>

        <AgentTracePanel trace={results.agentTrace ?? []} />

        <Card style={styles.briefCard}>
          <Typography variant="h3" style={styles.sectionTitleIndigo}>
            {UI.results.ceoBriefTitle}
          </Typography>
          <Typography variant="caption" style={styles.briefHint}>
            {UI.results.ceoBriefHint}
          </Typography>
          {briefBullets ? (
            <View style={styles.briefList}>
              {briefBullets.map((bullet, index) => (
                <View key={`brief-${index}`} style={styles.briefItem}>
                  <Typography style={styles.briefNumber}>{index + 1}</Typography>
                  <Typography style={styles.briefText}>{bullet}</Typography>
                </View>
              ))}
            </View>
          ) : null}
          <Button
            title={
              briefLoading
                ? UI.results.ceoBriefLoading
                : briefBullets
                  ? UI.results.ceoBriefBtnAgain
                  : UI.results.ceoBriefBtn
            }
            variant="outline"
            onPress={handleExecutiveBrief}
            disabled={briefLoading}
            style={styles.briefBtn}
          />
          {briefLoading ? (
            <ActivityIndicator size="small" color="#6366F1" style={{ marginTop: 12 }} />
          ) : null}
        </Card>

        <View style={styles.bottomActions}>
          <Button title={UI.results.share} onPress={handleShare} style={styles.exportBtn} />
          <Button title={UI.results.copy} variant="outline" onPress={handleCopy} style={styles.exportBtn} />
          {exportMessage ? (
            <Typography style={styles.exportMsg}>{exportMessage}</Typography>
          ) : null}

          <Button
            title={UI.results.newAnalysis}
            variant="outline"
            onPress={() => router.push('/upload')}
            style={styles.backBtn}
          />
          <Button
            title={UI.results.backHome}
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
    paddingBottom: 48,
  },
  header: {
    marginBottom: 28,
  },
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  modeBadgeText: { color: '#A5B4FC', fontSize: 12, fontWeight: '700' },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    color: '#8A8D98',
    lineHeight: 24,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  resumeBanner: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderWidth: 1,
  },
  resumeBannerText: {
    color: '#FCD34D',
    fontSize: 14,
    lineHeight: 22,
  },
  heroCard: {
    marginBottom: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heroTitle: {
    color: '#E9D5FF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  sectionHint: {
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 18,
  },
  metricFootnote: {
    color: '#64748B',
    marginBottom: 8,
    fontSize: 11,
    lineHeight: 16,
  },
  executiveSummary: {
    color: '#CBD5E1',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  metricsGroup: {
    marginBottom: 16,
  },
  metricContainer: {
    marginBottom: 16,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricLabel: {
    fontWeight: '500',
    color: '#94A3B8',
  },
  metricValue: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metricBarBg: {
    height: 8,
    backgroundColor: '#1F1F2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  bgRed: {
    backgroundColor: '#EF4444',
  },
  bgEmerald: {
    backgroundColor: '#10B981',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
  },
  priorityBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  priorityText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  impactText: {
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
    fontSize: 14,
  },
  briefCard: {
    marginBottom: 16,
    padding: 20,
  },
  briefHint: {
    marginBottom: 12,
  },
  briefList: {
    marginBottom: 16,
    gap: 10,
  },
  briefItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#1A1A24',
    padding: 12,
    borderRadius: 10,
  },
  briefNumber: {
    color: '#6366F1',
    fontWeight: '800',
    fontSize: 16,
    width: 20,
  },
  briefText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  briefBtn: {
    paddingVertical: 14,
  },
  sectionCard: {
    marginBottom: 16,
    padding: 20,
  },
  sectionTitleIndigo: {
    color: '#6366F1',
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitleAmber: {
    color: '#F59E0B',
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitleEmerald: {
    color: '#10B981',
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitlePurple: {
    color: '#A855F7',
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitlePink: {
    color: '#EC4899',
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitleLog: {
    color: '#94A3B8',
    marginBottom: 16,
    fontSize: 18,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulletIndigo: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginRight: 12,
  },
  bulletAmber: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 12,
  },
  bulletEmerald: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  listText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2D2D44',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionBody: {
    flex: 1,
  },
  actionTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 13,
  },
  actionBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  actionBadgeText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  impactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  impactBoxBefore: {
    flex: 1,
    backgroundColor: '#1A1A24',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  impactBoxTitle: {
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 13,
  },
  impactBoxValueBefore: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: '#FFFFFF',
  },
  impactBoxDesc: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
  impactArrow: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  impactArrowText: {
    color: '#64748B',
    fontSize: 24,
    fontWeight: '300',
  },
  impactBoxAfter: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  impactBoxTitleAfter: {
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontSize: 13,
    color: '#10B981',
  },
  impactBoxValueAfter: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: '#10B981',
  },
  bottomActions: {
    marginTop: 8,
    gap: 12,
  },
  exportBtn: {
    paddingVertical: 16,
    borderRadius: 14,
  },
  exportMsg: {
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  backBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    borderColor: '#2D2D44',
    borderWidth: 1,
  },
});
