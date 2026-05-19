import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';
import { analyzeContent } from '@/services/gemini';

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
  const { uploadedText, setAnalysisResults } = useAppContext();

  const [statusText, setStatusText] = useState('System standby');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastAnalyzedText = useRef('');

  const startAnalysis = useCallback(async () => {
    if (isAnalyzing || !uploadedText) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setErrorMessage(null);

    let step = 0;
    setStatusText(STATUS_STEPS[step]);

    const interval = setInterval(() => {
      if (step < STATUS_STEPS.length - 2) {
        step += 1;
        setStatusText(STATUS_STEPS[step]);
      }
    }, 1500);

    try {
      const geminiResults = await analyzeContent(uploadedText);

      clearInterval(interval);
      setStatusText(STATUS_STEPS[STATUS_STEPS.length - 1]);
      setAnalysisResults(geminiResults);
      setIsAnalyzing(false);
      setAnalysisComplete(true);

      setTimeout(() => {
        router.replace('/results');
      }, 800);
    } catch (error) {
      clearInterval(interval);
      const message =
        error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      setErrorMessage(message);
      setStatusText('Analysis failed');
      setIsAnalyzing(false);
      setAnalysisComplete(false);
    }
  }, [isAnalyzing, uploadedText, router, setAnalysisResults]);

  useEffect(() => {
    if (!uploadedText) {
      router.replace('/upload');
      return;
    }
    if (lastAnalyzedText.current === uploadedText) {
      return;
    }
    lastAnalyzedText.current = uploadedText;
    startAnalysis();
  }, [uploadedText, router, startAnalysis]);

  const handleRetry = () => {
    setErrorMessage(null);
    startAnalysis();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>AI Insight Engine</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Processing your content with Gemini AI. This usually takes 10–30 seconds.
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
                    : analysisComplete
                      ? styles.statusDotComplete
                      : styles.statusDotStandby,
              ]}
            />
            <Typography variant="h2" style={styles.statusTitle}>
              {errorMessage ? 'Analysis Error' : 'Orchestrator Status'}
            </Typography>
          </View>

          <View style={styles.consoleBox}>
            <Typography style={[styles.consoleText, errorMessage && styles.consoleTextError]}>
              {'> ' + statusText}
            </Typography>
            {isAnalyzing && <ActivityIndicator size="small" color="#10B981" style={{ marginLeft: 12 }} />}
          </View>

          {errorMessage ? (
            <View style={styles.errorBlock}>
              <Typography variant="body" style={styles.errorMessage}>
                {errorMessage}
              </Typography>
              <Button title="Retry Analysis" onPress={handleRetry} style={styles.retryButton} />
              <Button
                title="Back to Upload"
                variant="outline"
                onPress={() => router.replace('/upload')}
                style={styles.backButton}
              />
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    color: '#8A8D98',
    lineHeight: 24,
  },
  orchestratorCard: {
    marginBottom: 24,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  statusDotStandby: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
  },
  statusDotAnalyzing: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  statusDotComplete: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981',
  },
  statusDotError: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  statusTitle: {
    fontSize: 18,
    marginBottom: 0,
  },
  consoleBox: {
    backgroundColor: '#05050A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1A1A24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 64,
  },
  consoleText: {
    color: '#10B981',
    fontFamily: 'monospace',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  consoleTextError: {
    color: '#F87171',
  },
  errorBlock: {
    marginTop: 20,
    gap: 12,
  },
  errorMessage: {
    color: '#FCA5A5',
    lineHeight: 22,
    marginBottom: 4,
  },
  retryButton: {
    width: '100%',
    paddingVertical: 16,
  },
  backButton: {
    width: '100%',
    paddingVertical: 16,
  },
});
