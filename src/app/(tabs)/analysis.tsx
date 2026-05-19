import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import { StatPreviewCard } from '@/components/StatPreviewCard';
import { useAppContext } from '@/context/AppContext';
import { analyzeContent } from '@/services/gemini';
import type { AnalysisResult } from '@/types/analysis';

const STATUS_STEPS = [
  'Parsing uploaded content...',
  'Extracting key insights...',
  'Detecting operational risks...',
  'Generating recommended actions...',
  'Simulating business impact...',
  'Analysis complete',
];

export default function AnalysisScreen() {
  const router = useRouter();
  const {
    uploadedText,
    setAnalysisResults,
    industry,
    persistAnalysisToHistory,
    setIsAnalyzing: setGlobalAnalyzing,
  } = useAppContext();

  const [statusText, setStatusText] = useState('Initializing...');
  const [stepIndex, setStepIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastAnalyzedText = useRef('');

  const progress = ((stepIndex + 1) / STATUS_STEPS.length) * 100;

  const startAnalysis = useCallback(async () => {
    if (isAnalyzing || !uploadedText) return;

    setIsAnalyzing(true);
    setGlobalAnalyzing(true);
    setPreview(null);
    setErrorMessage(null);
    setStepIndex(0);
    setStatusText(STATUS_STEPS[0]);

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        const next = Math.min(prev + 1, STATUS_STEPS.length - 2);
        setStatusText(STATUS_STEPS[next]);
        return next;
      });
    }, 1800);

    try {
      const geminiResults = await analyzeContent(uploadedText, industry);

      clearInterval(interval);
      setStepIndex(STATUS_STEPS.length - 1);
      setStatusText(STATUS_STEPS[STATUS_STEPS.length - 1]);
      setAnalysisResults(geminiResults);
      setPreview(geminiResults);
      setIsAnalyzing(false);
      setGlobalAnalyzing(false);
    } catch (error) {
      clearInterval(interval);
      const message =
        error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      setErrorMessage(message);
      setStatusText('Analysis failed');
      setIsAnalyzing(false);
      setGlobalAnalyzing(false);
    }
  }, [isAnalyzing, uploadedText, industry, setAnalysisResults, setGlobalAnalyzing]);

  useEffect(() => {
    if (!uploadedText) {
      router.replace('/upload');
      return;
    }
    if (lastAnalyzedText.current === uploadedText) return;
    lastAnalyzedText.current = uploadedText;
    startAnalysis();
  }, [uploadedText, router, startAnalysis]);

  const handleViewResults = async () => {
    await persistAnalysisToHistory();
    router.replace('/results');
  };

  const handleRetry = () => {
    lastAnalyzedText.current = '';
    setErrorMessage(null);
    lastAnalyzedText.current = uploadedText;
    startAnalysis();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>
            AI Insight Engine
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            {preview
              ? 'Analysis complete — review the preview below.'
              : 'Gemini AI is processing your document in real time.'}
          </Typography>
        </View>

        <Card style={styles.orchestratorCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusDot,
                errorMessage
                  ? styles.statusDotError
                  : isAnalyzing
                    ? styles.statusDotAnalyzing
                    : preview
                      ? styles.statusDotComplete
                      : styles.statusDotStandby,
              ]}
            />
            <Typography variant="h2" style={styles.statusTitle}>
              {errorMessage ? 'Error' : preview ? 'Complete' : 'Processing'}
            </Typography>
          </View>

          <ProgressBar progress={preview ? 100 : progress} />
          <Typography variant="caption" style={styles.progressLabel}>
            {Math.round(preview ? 100 : progress)}% — Step {Math.min(stepIndex + 1, STATUS_STEPS.length)}/
            {STATUS_STEPS.length}
          </Typography>

          <View style={styles.consoleBox}>
            <Typography style={[styles.consoleText, errorMessage && styles.consoleTextError]}>
              {'> ' + statusText}
            </Typography>
            {isAnalyzing && (
              <ActivityIndicator size="small" color="#10B981" style={{ marginLeft: 12 }} />
            )}
          </View>

          {errorMessage ? (
            <View style={styles.errorBlock}>
              <Typography variant="body" style={styles.errorMessage}>
                {errorMessage}
              </Typography>
              <Button title="Retry Analysis" onPress={handleRetry} style={styles.actionBtn} />
              <Button
                title="Back to Upload"
                variant="outline"
                onPress={() => router.replace('/upload')}
                style={styles.actionBtn}
              />
            </View>
          ) : null}

          {preview ? (
            <View style={styles.previewSection}>
              <Typography variant="h3" style={styles.previewTitle}>
                Insight Preview
              </Typography>
              <Typography style={styles.previewSummary} numberOfLines={3}>
                {preview.executiveSummary}
              </Typography>
              <View style={styles.previewRow}>
                <StatPreviewCard
                  label="Risk"
                  value={`${preview.riskScore}`}
                  accent="#EF4444"
                />
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
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0A0F' },
  scrollContent: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  header: { marginBottom: 28 },
  title: { fontSize: 36, letterSpacing: -0.5, marginBottom: 12 },
  subtitle: { color: '#8A8D98', lineHeight: 24 },
  orchestratorCard: { padding: 20, gap: 12 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusDotStandby: { backgroundColor: '#334155' },
  statusDotAnalyzing: { backgroundColor: '#F59E0B' },
  statusDotComplete: { backgroundColor: '#10B981' },
  statusDotError: { backgroundColor: '#EF4444' },
  statusTitle: { fontSize: 18, marginBottom: 0 },
  progressLabel: { color: '#64748B', marginBottom: 4 },
  consoleBox: {
    backgroundColor: '#05050A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A24',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
  },
  consoleText: {
    color: '#10B981',
    fontFamily: 'monospace',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  consoleTextError: { color: '#F87171' },
  errorBlock: { marginTop: 8, gap: 10 },
  errorMessage: { color: '#FCA5A5', lineHeight: 22 },
  actionBtn: { paddingVertical: 14 },
  previewSection: { marginTop: 8, gap: 12 },
  previewTitle: { color: '#818CF8', fontSize: 16 },
  previewSummary: { color: '#CBD5E1', lineHeight: 22, fontSize: 14 },
  previewRow: { flexDirection: 'row' },
  gap: { width: 10 },
  viewResultsBtn: { marginTop: 4, paddingVertical: 16 },
});
