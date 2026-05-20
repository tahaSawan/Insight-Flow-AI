import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Cpu } from 'lucide-react-native';
import { AppScreen } from '@/components/AppScreen';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import { AgentWorkflowTimeline } from '@/components/AgentWorkflowTimeline';
import { AgentWorkflowTerminal } from '@/components/AgentWorkflowTerminal';
import { useAppContext } from '@/context/AppContext';
import { runAgentOrchestration } from '@/services/agentOrchestrator';
import { analyzeContentFast, toFriendlyGeminiError } from '@/services/gemini';
import { AGENT_PIPELINE } from '@/constants/agents';
import { CINEMATIC_WORKFLOW } from '@/constants/workflowAgents';
import type { AnalysisResult } from '@/types/analysis';
import type { AgentTraceEntry, AgentStatus } from '@/types/agents';
import { UI } from '@/constants/plainLanguage';
import { DemoStepBar } from '@/components/DemoStepBar';
import { colors, spacing, radius } from '@/constants/designTokens';

const TOTAL_AGENTS = AGENT_PIPELINE.length;

function buildPendingTrace(): AgentTraceEntry[] {
  return CINEMATIC_WORKFLOW.map((step) => ({
    agentId: step.id,
    agentName: step.name,
    status: 'pending' as AgentStatus,
    reasoning: UI.analysis.queued,
    outputSummary: '',
  }));
}

function buildFastModeTrace(progressPct: number): AgentTraceEntry[] {
  const activeIndex = Math.min(
    TOTAL_AGENTS - 1,
    Math.floor(progressPct / (100 / TOTAL_AGENTS)),
  );

  return CINEMATIC_WORKFLOW.map((step, index) => {
    let status: AgentStatus = 'pending';
    if (index < activeIndex) status = 'complete';
    else if (index === activeIndex) status = progressPct >= 100 ? 'complete' : 'running';

    const stepDef = CINEMATIC_WORKFLOW[index];
    return {
      agentId: step.id,
      agentName: step.name,
      status,
      reasoning:
        status === 'running'
          ? UI.analysis.fastRunning
          : status === 'complete'
            ? 'Step finished'
            : UI.analysis.queued,
      outputSummary: status === 'complete' ? stepDef.description.split(' ').slice(0, 4).join(' ') + '…' : '',
      startedAt: status !== 'pending' ? new Date().toISOString() : undefined,
      completedAt: status === 'complete' ? new Date().toISOString() : undefined,
    };
  });
}

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

  const [agentTrace, setAgentTrace] = useState<AgentTraceEntry[]>(buildPendingTrace);
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

  const displayTrace = useMemo(() => {
    if (isFullMode || preview) return agentTrace;
    return buildFastModeTrace(fastProgress);
  }, [isFullMode, preview, agentTrace, fastProgress]);

  const startAnalysis = useCallback(async () => {
    if (isAnalyzing || !uploadedText) return;

    setIsAnalyzing(true);
    setGlobalAnalyzing(true);
    setPreview(null);
    setErrorMessage(null);
    setFastProgress(4);
    setAgentTrace(buildPendingTrace());

    const fastTimer = !isFullMode
      ? setInterval(() => {
          setFastProgress((p) => Math.min(p + 7, 96));
        }, 520)
      : null;

    try {
      const result = isFullMode
        ? await runAgentOrchestration(uploadedText, industry, (trace) => {
            setAgentTrace(trace);
          }, useCase)
        : await analyzeContentFast(uploadedText, industry, useCase);

      if (fastTimer) clearInterval(fastTimer);
      setFastProgress(100);
      setAgentTrace(result.agentTrace.length ? result.agentTrace : buildPendingTrace().map((t) => ({
        ...t,
        status: 'complete' as AgentStatus,
      })));

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
    }, 1200);
    return () => clearTimeout(timer);
  }, [preview, isAnalyzing, persistAnalysisToHistory, router]);

  const isComplete = !!preview && !isAnalyzing;

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <DemoStepBar current="analyze" />

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Cpu size={20} color={colors.accent} />
          </View>
          <View style={styles.heroText}>
            <Typography variant="sectionTitle" style={styles.heroTitle}>
              {UI.analysis.workflowTitle}
            </Typography>
            <Typography variant="caption" style={styles.heroSub}>
              {isComplete
                ? UI.analysis.done
                : UI.analysis.agentsDone(completedAgents, TOTAL_AGENTS)}
            </Typography>
          </View>
          <Typography style={styles.pct}>{Math.round(progress)}%</Typography>
        </View>

        <ProgressBar progress={progress} />

        <View style={styles.workflowPanel}>
          <AgentWorkflowTimeline trace={displayTrace} />
        </View>

        <AgentWorkflowTerminal trace={displayTrace} />

        {errorMessage ? (
          <Card variant="danger" title="Analysis failed" style={styles.errorCard}>
            <Typography variant="body" style={styles.errorMessage}>
              {errorMessage}
            </Typography>
            <Button title="Retry" onPress={handleRetry} fullWidth style={styles.actionBtn} />
            <Button
              title="Back to Upload"
              variant="secondary"
              onPress={() => router.replace('/upload')}
              fullWidth
            />
          </Card>
        ) : null}

        {isComplete ? (
          <Card variant="success" style={styles.doneCard}>
            <Typography style={styles.doneTitle}>{UI.analysis.previewHeroLabel}</Typography>
            <Typography variant="caption" style={styles.doneHint}>
              {UI.analysis.autoNavHint}
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
    paddingTop: spacing.md,
    paddingBottom: 40,
    gap: spacing.md,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    marginBottom: 2,
  },
  heroSub: {
    marginTop: 2,
  },
  pct: {
    fontSize: 22,
    lineHeight: 26,
  },
  workflowPanel: {
    marginTop: spacing.xs,
  },
  errorCard: {
    marginBottom: 0,
  },
  errorMessage: {
    color: colors.danger,
    lineHeight: 22,
  },
  actionBtn: {
    marginBottom: spacing.sm,
  },
  doneCard: {
    marginBottom: 0,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneTitle: {
    color: colors.success,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  doneHint: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
