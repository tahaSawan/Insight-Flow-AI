import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const TOTAL_AGENTS = AGENT_PIPELINE.length;

export default function AnalysisScreen() {
  const router = useRouter();
  const {
    uploadedText,
    setAnalysisResults,
    industry,
    analysisMode,
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
          reasoning: 'Queued by orchestrator...',
          outputSummary: '',
        })),
      );
    } else {
      setAgentTrace([
        {
          agentId: 'ingestion',
          agentName: 'Fast Analysis Engine',
          status: 'running',
          startedAt: new Date().toISOString(),
          reasoning: 'Running unified insight-to-action analysis in one pass...',
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
          })
        : await analyzeContentFast(uploadedText, industry);

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
    setAnalysisResults,
    setGlobalAnalyzing,
  ]);

  useEffect(() => {
    if (!uploadedText) {
      router.replace('/upload');
      return;
    }
    const runKey = `${uploadedText}:${analysisMode}`;
    if (lastRunKey.current === runKey) return;
    lastRunKey.current = runKey;
    startAnalysis();
  }, [uploadedText, analysisMode, router, startAnalysis]);

  const handleViewResults = async () => {
    await persistAnalysisToHistory();
    router.replace('/results');
  };

  const handleRetry = () => {
    setErrorMessage(null);
    lastRunKey.current = '';
    lastRunKey.current = `${uploadedText}:${analysisMode}`;
    startAnalysis();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.modeBadge}>
            <Typography style={styles.modeBadgeText}>{modeLabel}</Typography>
          </View>
          <Typography variant="h1" style={styles.title}>
            {isFullMode ? 'Agent Orchestrator' : 'Fast Analysis'}
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            {preview
              ? 'Analysis complete — review the preview below.'
              : isFullMode
                ? `Running ${TOTAL_AGENTS} specialized AI agents on your document...`
                : 'Single optimized AI pass — same decision report, faster.'}
          </Typography>
        </View>

        <Card style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Typography variant="caption" style={styles.progressLabel}>
              Pipeline progress
            </Typography>
            <Typography style={styles.progressPct}>{Math.round(progress)}%</Typography>
          </View>
          <ProgressBar progress={progress} />
          {isFullMode ? (
            <Typography variant="caption" style={styles.agentCount}>
              {completedAgents} / {TOTAL_AGENTS} agents complete
            </Typography>
          ) : (
            <Typography variant="caption" style={styles.agentCount}>
              Unified analysis in progress
            </Typography>
          )}
        </Card>

        {isFullMode ? (
          <AgentPipeline trace={agentTrace} />
        ) : (
          <Card style={styles.fastCard}>
            <View style={styles.fastHeader}>
              <Typography style={styles.fastIcon}>⚡</Typography>
              <View style={styles.fastBody}>
                <Typography style={styles.fastTitle}>Fast Analysis Engine</Typography>
                <Typography variant="caption">
                  Combines all agent stages in one Gemini request
                </Typography>
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
          <Card style={styles.previewCard}>
            <Typography variant="h3" style={styles.previewTitle}>
              {isFullMode ? 'Orchestrator Output' : 'Fast Mode Output'}
            </Typography>
            <Typography style={styles.previewSummary} numberOfLines={3}>
              {preview.executiveSummary}
            </Typography>
            <View style={styles.previewRow}>
              <StatPreviewCard label="Risk" value={`${preview.riskScore}`} accent="#EF4444" />
              <View style={styles.gap} />
              <StatPreviewCard
                label="Confidence"
                value={`${preview.confidence}%`}
                accent="#10B981"
              />
            </View>
            <Button
              title="View Full Decision Report"
              onPress={handleViewResults}
              style={styles.viewResultsBtn}
            />
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0A0F' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, gap: 16 },
  header: { marginBottom: 8 },
  modeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  modeBadgeText: { color: '#A5B4FC', fontSize: 12, fontWeight: '700' },
  title: { fontSize: 34, letterSpacing: -0.5, marginBottom: 10 },
  subtitle: { color: '#8A8D98', lineHeight: 24 },
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
  previewCard: { padding: 20, gap: 12 },
  previewTitle: { color: '#818CF8', fontSize: 16 },
  previewSummary: { color: '#CBD5E1', lineHeight: 22, fontSize: 14 },
  previewRow: { flexDirection: 'row' },
  gap: { width: 10 },
  viewResultsBtn: { paddingVertical: 16 },
});
