import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Share, ActivityIndicator, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { AnimatedExecutionLog } from '@/components/AnimatedExecutionLog';
import { InsightList } from '@/components/InsightList';
import { AutonomousWorkflowReplay } from '@/components/AutonomousWorkflowReplay';
import { useAppContext } from '@/context/AppContext';
import { ANALYSIS_MODE_OPTIONS } from '@/types/analysis';
import { formatReportAsText } from '@/utils/formatReport';
import { generateExecutiveBrief } from '@/services/gemini';
import { UI, looksLikeResume } from '@/constants/plainLanguage';
import { DecisionAlert } from '@/components/DecisionAlert';
import { ActionCommander } from '@/components/ActionCommander';
import { AutonomousDecisionCenter } from '@/components/AutonomousDecisionCenter';
import { ConsequenceSimulation } from '@/components/ConsequenceSimulation';
import { ExecutiveVoiceBriefing } from '@/components/ExecutiveVoiceBriefing';
import { AIDecisionScorecard } from '@/components/AIDecisionScorecard';
import { AIDebateMode } from '@/components/AIDebateMode';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DemoStepBar } from '@/components/DemoStepBar';
import { ResultsJumpNav, type ResultsSectionId } from '@/components/ResultsJumpNav';
import { ScrollSection } from '@/components/ScrollSection';
import { CollapsibleSection } from '@/components/CollapsibleSection';
import { SectionHeader } from '@/components/SectionHeader';
import { ResultsSkeleton } from '@/components/ResultsSkeleton';
import { colors, spacing, featureSection } from '@/constants/designTokens';

export default function ResultsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { analysisResults, uploadedText, analysisMode, historyHydrating, setHistoryHydrating } =
    useAppContext();
  const modeLabel =
    ANALYSIS_MODE_OPTIONS.find((m) => m.id === analysisMode)?.label ?? 'Analysis';
  const [exportMessage, setExportMessage] = useState('');
  const [briefBullets, setBriefBullets] = useState<string[] | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [activeJump, setActiveJump] = useState<ResultsSectionId>('alert');
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<ResultsSectionId, number>>>({});

  const onSectionMeasure = useCallback((id: ResultsSectionId, y: number) => {
    sectionY.current[id] = y;
  }, []);

  const jumpTo = useCallback((id: ResultsSectionId) => {
    setActiveJump(id);
    const y = sectionY.current[id];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  }, []);

  useEffect(() => {
    if (!analysisResults) {
      if (uploadedText.trim()) {
        router.replace('/analysis');
      } else {
        router.replace('/upload');
      }
    }
  }, [analysisResults, uploadedText, router]);

  useEffect(() => {
    if (!historyHydrating || !analysisResults) return;
    const timer = setTimeout(() => setHistoryHydrating(false), 500);
    return () => clearTimeout(timer);
  }, [historyHydrating, analysisResults, setHistoryHydrating]);

  if (!analysisResults) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.emptyState}>
          <Typography variant="h2">{UI.results.emptyTitle}</Typography>
          <Typography variant="body" style={styles.emptySubtitle}>
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DemoStepBar current="decide" />

        <ScreenHeader
          title={UI.results.title}
          subtitle={UI.results.subtitle}
          badge={modeLabel}
        />

        <Typography variant="caption" style={styles.jumpHint}>
          {UI.results.jumpNavHint}
        </Typography>
        <ResultsJumpNav active={activeJump} onJump={jumpTo} />

        <View style={styles.demoStrip}>
          <Typography style={styles.demoStripText}>{UI.results.demoDisclaimer}</Typography>
        </View>

        {showResumeTip ? (
          <Card variant="accent" style={styles.resumeBanner}>
            <Typography style={styles.resumeBannerText}>{UI.results.resumeBanner}</Typography>
          </Card>
        ) : null}

        {historyHydrating ? (
          <ResultsSkeleton />
        ) : (
          <>
        <ScrollSection sectionId="alert" onMeasure={onSectionMeasure}>
          <DecisionAlert results={results} />
        </ScrollSection>

        <ScrollSection sectionId="decision" onMeasure={onSectionMeasure}>
          <AutonomousDecisionCenter results={results} />
        </ScrollSection>

        <ScrollSection sectionId="consequences" onMeasure={onSectionMeasure}>
          <ConsequenceSimulation results={results} />
        </ScrollSection>

        <ScrollSection sectionId="actions" onMeasure={onSectionMeasure}>
          <Card style={[styles.heroCard, featureSection]}>
            <SectionHeader
              title={UI.results.actionsSectionTitle}
              hint={UI.results.actionsSectionHint}
            />
            <ActionCommander results={results} />
          </Card>
        </ScrollSection>

        <ScrollSection sectionId="debate" onMeasure={onSectionMeasure}>
          <AIDebateMode results={results} />
        </ScrollSection>

        <ScrollSection sectionId="details" onMeasure={onSectionMeasure}>
          <CollapsibleSection
            title="Full report details"
            hint="Summary, findings, risks, and recommended steps"
            defaultOpen={false}
          >
        <Card style={styles.summaryCard}>
          <Typography variant="h2" style={styles.cardTitle}>
            {UI.results.summaryTitle}
          </Typography>
          <Typography variant="caption" style={styles.sectionHint}>
            {UI.results.summaryHint}
          </Typography>
          <Typography style={styles.executiveSummary}>{results.executiveSummary}</Typography>

          <Typography variant="caption" style={styles.detailsMetricsHint}>
            {UI.results.detailsNoMetricsHint}
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
          </CollapsibleSection>
        </ScrollSection>

        <ScrollSection sectionId="more" onMeasure={onSectionMeasure}>
          <CollapsibleSection
            title={UI.results.moreToolsTitle}
            hint={UI.results.moreToolsHint}
            defaultOpen={false}
          >
            <AIDecisionScorecard results={results} />
            <ExecutiveVoiceBriefing results={results} />
            <AutonomousWorkflowReplay results={results} />
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
          </CollapsibleSection>
        </ScrollSection>

        <View style={styles.scrollFooterSpacer} />
          </>
        )}
      </ScrollView>

      <View style={[styles.stickyBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <View style={styles.stickyRow}>
          <Button title={UI.results.share} onPress={handleShare} style={styles.stickyBtnPrimary} />
          <Button
            title={UI.results.copy}
            variant="outline"
            onPress={handleCopy}
            style={styles.stickyBtnSecondary}
          />
        </View>
        {exportMessage ? (
          <Typography style={styles.exportMsg}>{exportMessage}</Typography>
        ) : null}
        <Pressable onPress={() => router.push('/upload')} style={styles.newReportLink}>
          <Typography style={styles.newReportText}>{UI.results.newAnalysis}</Typography>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  jumpHint: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
    fontSize: 12,
  },
  demoStrip: {
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accentSoft,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  demoStripText: {
    color: colors.accentText,
    fontSize: 12,
    lineHeight: 17,
  },
  scrollFooterSpacer: {
    height: 8,
  },
  stickyBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  stickyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stickyBtnPrimary: {
    flex: 1,
  },
  stickyBtnSecondary: {
    flex: 1,
  },
  newReportLink: {
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  newReportText: {
    color: colors.accentText,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    marginBottom: 16,
    padding: spacing.lg,
  },
  detailsMetricsHint: {
    color: colors.textMuted,
    marginBottom: spacing.md,
    lineHeight: 18,
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
    padding: spacing.md,
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
  executiveSummary: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: spacing.md,
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
