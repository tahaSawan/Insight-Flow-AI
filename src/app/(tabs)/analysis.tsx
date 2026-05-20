import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import { StatPreviewCard } from '@/components/StatPreviewCard';
import { AgentPipeline } from '@/components/AgentPipeline';
import { useAppContext } from '@/context/AppContext';
import { runAgentOrchestration } from '@/services/agentOrchestrator';
import { analyzeContentFast, toFriendlyGeminiError } from '@/services/gemini';
import { AGENT_PIPELINE } from '@/constants/agents';
import { ANALYSIS_MODE_OPTIONS } from '@/types/analysis';
import type { AnalysisResult } from '@/types/analysis';
import type { AgentTraceEntry } from '@/types/agents';
import { UI } from '@/constants/plainLanguage';
import { AnalysisLoadingPanel } from '@/components/AnalysisLoadingPanel';
import { ScreenHeader } from '@/components/ScreenHeader';
import { DemoStepBar } from '@/components/DemoStepBar';
import { colors, spacing } from '@/constants/designTokens';

const TOTAL_AGENTS = AGENT_PIPELINE.length;

export default function AnalysisScreen() {
  const router = useRouter();
  const {
    uploadedText,
    setAnalysisResults,
    industry,
    analysisMode,
    useCase,
    persistAnalysisToHistory,
    setIsAnalyzing: setGlobalAnalyzing,
  } = useAppContext();

  const isFullMode = analysisMode === 'full';
  const modeLabel = ANALYSIS_MODE_OPTIONS.find((m) => m.id === analysisMode)?.label ?? 'Analysis';

  const [agentTrace, setAgentTrace] = useState<AgentTraceEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fastProgress, setFastProgress] = useState(0);
  const lastRunKey = useRef('');
  const autoNavigated = useRef(false);

  const completedAgents = agentTrace.filter((t) => t.status === 'complete').length;
  const progress = preview
    ? 100
    : isFullMode
      ? (completedAgents / TOTAL_AGENTS) * 100
      : fastProgress;

  const startAnalysis = useCallback(async () => {
    if (isAnalyzing || !uploadedText) return;

    setIsAnalyzing(true);
    setGlobalAnalyzing(true);
    setPreview(null);
    setErrorMessage(null);
    setFastProgress(8);

    if (isFullMode) {
      setAgentTrace(
        AGENT_PIPELINE.map((a) => ({
          agentId: a.id,
          agentName: a.name,
          status: 'pending',
          reasoning: UI.analysis.queued,
          outputSummary: '',
        })),
      );
    } else {
      setAgentTrace([
        {
          agentId: 'ingestion',
          agentName: UI.analysis.fastEngine,
          status: 'running',
          startedAt: new Date().toISOString(),
          reasoning: UI.analysis.fastRunning,
          outputSummary: '',
        },
      ]);
    }

    const fastTimer = !isFullMode
      ? setInterval(() => {
          setFastProgress((p) => Math.min(p + 6, 92));
        }, 800)
      : null;

    try {
      const result = isFullMode
        ? await runAgentOrchestration(uploadedText, industry, (trace) => {
            setAgentTrace(trace);
          }, useCase)
        : await analyzeContentFast(uploadedText, industry, useCase);

      if (fastTimer) clearInterval(fastTimer);
      setFastProgress(100);
      if (!isFullMode) {
        setAgentTrace(result.agentTrace);
      }

      setAnalysisResults(result);
      setPreview(result);
      setIsAnalyzing(false);
      setGlobalAnalyzing(false);
    } catch (error) {
      if (fastTimer) clearInterval(fastTimer);
      setErrorMessage(toFriendlyGeminiError(error));
      setIsAnalyzing(false);
      setGlobalAnalyzing(false);
    }
  }, [
    isAnalyzing,
    uploadedText,
    industry,
    isFullMode,
    useCase,
    setAnalysisResults,
    setGlobalAnalyzing,
  ]);

  useEffect(() => {
    if (!uploadedText) {
      router.replace('/upload');
      return;
    }
    const runKey = `${uploadedText}:${analysisMode}:${useCase}`;
    if (lastRunKey.current === runKey) return;
    lastRunKey.current = runKey;
    startAnalysis();
  }, [uploadedText, analysisMode, useCase, router, startAnalysis]);

  const handleViewResults = async () => {
    await persistAnalysisToHistory();
    router.replace('/results');
  };

  const handleRetry = () => {
    setErrorMessage(null);
    autoNavigated.current = false;
    lastRunKey.current = '';
    lastRunKey.current = `${uploadedText}:${analysisMode}:${useCase}`;
    startAnalysis();
  };

  useEffect(() => {
    if (!preview || isAnalyzing || autoNavigated.current) return;
    autoNavigated.current = true;
    const timer = setTimeout(() => {
      void (async () => {
        await persistAnalysisToHistory();
        router.replace('/results');
      })();
    }, 1400);
    return () => clearTimeout(timer);
  }, [preview, isAnalyzing, persistAnalysisToHistory, router]);

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DemoStepBar current="analyze" />

        <ScreenHeader
          title={isFullMode ? UI.analysis.titleFull : UI.analysis.titleFast}
          subtitle={
            preview
              ? UI.analysis.done
              : isFullMode
                ? UI.analysis.runningFull
                : UI.analysis.runningFast
          }
          badge={modeLabel}
        />

        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Typography variant="caption" style={styles.progressLabel}>
              {UI.analysis.progress}
            </Typography>
            <Typography style={styles.progressPct}>{Math.round(progress)}%</Typography>
          </View>
          <ProgressBar progress={progress} />
          {isFullMode ? (
            <Typography variant="caption" style={styles.agentCount}>
              {UI.analysis.agentsDone(completedAgents, TOTAL_AGENTS)}
            </Typography>
          ) : (
            <Typography variant="caption" style={styles.agentCount}>
              {UI.analysis.fastProgress}
            </Typography>
          )}
        </Card>

        <AnalysisLoadingPanel active={isAnalyzing && !preview} isFullMode={isFullMode} />

        {isFullMode ? (
          <AgentPipeline trace={agentTrace} />
        ) : (
          <Card style={styles.fastCard}>
            <View style={styles.fastHeader}>
              <Typography style={styles.fastIcon}>⚡</Typography>
              <View style={styles.fastBody}>
                <Typography style={styles.fastTitle}>{UI.analysis.fastEngine}</Typography>
                <Typography variant="caption">{UI.analysis.fastEngineDesc}</Typography>
              </View>
              {isAnalyzing ? (
                <ActivityIndicator color="#6366F1" />
              ) : preview ? (
                <Typography style={styles.fastDone}>DONE</Typography>
              ) : null}
            </View>
            {agentTrace[0]?.reasoning ? (
              <Typography style={styles.fastReasoning}>{agentTrace[0].reasoning}</Typography>
            ) : null}
          </Card>
        )}

        {errorMessage ? (
          <Card style={styles.errorCard}>
            <Typography variant="body" style={styles.errorMessage}>
              {errorMessage}
            </Typography>
            <Button title="Retry" onPress={handleRetry} style={styles.actionBtn} />
            <Button
              title="Back to Upload"
              variant="outline"
              onPress={() => router.replace('/upload')}
              style={styles.actionBtn}
            />
          </Card>
        ) : null}

        {preview ? (
          <Card variant="accent" style={styles.previewCard}>
            <Typography variant="caption" style={styles.previewLabel}>
              {UI.analysis.previewHeroLabel}
            </Typography>
            <Typography style={styles.previewHeadline} numberOfLines={2}>
              {preview.urgencyHeadline || preview.executiveSummary}
            </Typography>
            <View style={styles.previewMeta}>
              <StatPreviewCard
                label={UI.home.riskLabel}
                value={`${preview.riskScore}`}
                accent={colors.danger}
              />
              <View style={styles.gap} />
              <StatPreviewCard
                label={UI.home.sureLabel}
                value={`${preview.confidence}%`}
                accent={colors.success}
              />
            </View>
            <Typography variant="caption" style={styles.previewActionLabel}>
              {UI.analysis.previewTopAction}
            </Typography>
            <Typography style={styles.previewAction} numberOfLines={2}>
              {preview.autonomousDecision?.primaryDecision ||
                preview.recommendedActions[0] ||
                '—'}
            </Typography>
            <Button
              title={UI.analysis.viewReport}
              onPress={handleViewResults}
              style={styles.viewResultsBtn}
            />
            <Typography variant="caption" style={styles.autoNavHint}>
              Opening decision report…
            </Typography>
          </Card>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 40,
    gap: spacing.md,
  },
  autoNavHint: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
  progressCard: { padding: 16, gap: 10 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: '#8A8D98', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 },
  progressPct: { fontWeight: '800', color: '#818CF8', fontSize: 16 },
  agentCount: { color: '#64748B' },
  fastCard: { padding: 16, gap: 12 },
  fastHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fastIcon: { fontSize: 28 },
  fastBody: { flex: 1 },
  fastTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  fastDone: { color: '#10B981', fontWeight: '800', fontSize: 11 },
  fastReasoning: { color: '#94A3B8', fontSize: 13, lineHeight: 20 },
  errorCard: { padding: 20, gap: 12 },
  errorMessage: { color: '#FCA5A5', lineHeight: 22 },
  actionBtn: { paddingVertical: 14 },
  previewCard: { padding: 20, gap: 10 },
  previewLabel: {
    color: colors.accentText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
    fontWeight: '700',
  },
  previewHeadline: { color: colors.text, fontSize: 17, fontWeight: '700', lineHeight: 24 },
  previewMeta: { flexDirection: 'row', marginVertical: 4 },
  previewActionLabel: { color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  previewAction: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  gap: { width: 10 },
  viewResultsBtn: { paddingVertical: 16 },
});
