import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Share, ActivityIndicator, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppScreen } from '@/components/AppScreen';
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
      <AppScreen>
        <View style={styles.emptyState}>
          <Typography variant="h2">{UI.results.emptyTitle}</Typography>
          <Typography variant="body" style={styles.emptySubtitle}>
            {UI.results.emptySubtitle}
          </Typography>
        </View>
      </AppScreen>
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
    <AppScreen>
      <View style={styles.page}>
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
          <Card variant="alert" style={styles.resumeBanner}>
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
        <Card
          title={UI.results.summaryTitle}
          subtitle={UI.results.summaryHint}
          style={styles.summaryCard}
        >
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

        <Card title={UI.results.findingsTitle} subtitle={UI.results.findingsHint} style={styles.sectionCard}>
          <InsightList
            items={results.keyFindings}
            type="finding"
            bulletStyle={styles.bulletIndigo}
            titleColor={colors.accent}
            documentText={uploadedText}
            analysis={results}
          />
        </Card>

        <Card title={UI.results.problemsTitle} subtitle={UI.results.problemsHint} variant="alert" style={styles.sectionCard}>
          <InsightList
            items={results.riskAssessment}
            type="risk"
            bulletStyle={styles.bulletAmber}
            titleColor={colors.warning}
            documentText={uploadedText}
            analysis={results}
          />
        </Card>

        <Card title={UI.results.actionsTitle} subtitle={UI.results.actionsHint} variant="success" style={styles.sectionCard}>
          <InsightList
            items={results.recommendedActions}
            type="action"
            bulletStyle={styles.bulletEmerald}
            titleColor={colors.accentSecondary}
            documentText={uploadedText}
            analysis={results}
          />
        </Card>

        <Card title={UI.results.logsTitle} subtitle={UI.results.logsHint} style={styles.sectionCard}>
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
        <Card title={UI.results.ceoBriefTitle} subtitle={UI.results.ceoBriefHint} style={styles.briefCard}>
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
            variant="secondary"
            onPress={handleExecutiveBrief}
            isLoading={briefLoading}
            fullWidth
            style={styles.briefBtn}
          />
        </Card>
          </CollapsibleSection>
        </ScrollSection>

        <View style={styles.scrollFooterSpacer} />
          </>
        )}
      </ScrollView>

      <View style={[styles.stickyBar, { paddingBottom: Math.max(spacing.md, insets.bottom) }]}>
        <View style={styles.stickyRow}>
          <Button title={UI.results.share} onPress={handleShare} style={styles.stickyBtn} />
          <Button
            title={UI.results.copy}
            variant="secondary"
            onPress={handleCopy}
            style={styles.stickyBtn}
          />
        </View>
        {exportMessage ? (
          <Typography style={styles.exportMsg}>{exportMessage}</Typography>
        ) : null}
        <Pressable onPress={() => router.push('/upload')} style={styles.newReportLink}>
          <Typography style={styles.newReportText}>{UI.results.newAnalysis}</Typography>
        </Pressable>
      </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
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
    backgroundColor: colors.surfaceElevated,
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
    backgroundColor: colors.warningSoft,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderWidth: 1,
  },
  resumeBannerText: {
    color: colors.warning,
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
    color: colors.textMuted,
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
    borderTopColor: colors.border,
  },
  priorityBadge: {
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  priorityText: {
    color: colors.danger,
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
    backgroundColor: colors.surfaceHighlight,
    padding: 12,
    borderRadius: 10,
  },
  briefNumber: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 16,
    width: 20,
  },
  briefText: {
    flex: 1,
    color: colors.text,
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
    color: colors.accent,
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitleAmber: {
    color: colors.warning,
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitleEmerald: {
    color: colors.accentSecondary,
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitlePurple: {
    color: colors.accent,
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitlePink: {
    color: colors.accentDeep,
    marginBottom: 16,
    fontSize: 18,
  },
  sectionTitleLog: {
    color: colors.textMuted,
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
    backgroundColor: colors.accent,
    marginRight: 12,
  },
  bulletAmber: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    marginRight: 12,
  },
  bulletEmerald: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentSecondary,
    marginRight: 12,
  },
  listText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.surfaceElevated,
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
    color: colors.accentSecondary,
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
    backgroundColor: colors.surfaceHighlight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.text,
  },
  impactBoxDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  impactArrow: {
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  impactArrowText: {
    color: colors.textDim,
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
    color: colors.accentSecondary,
  },
  impactBoxValueAfter: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    color: colors.accentSecondary,
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
    color: colors.accentSecondary,
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  backBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    borderColor: colors.border,
    borderWidth: 1,
  },
});
