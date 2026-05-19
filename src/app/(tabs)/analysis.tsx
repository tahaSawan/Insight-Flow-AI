import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';
import { analyzeContent } from '@/services/gemini';

export default function AnalysisScreen() {
  const router = useRouter();
  const { uploadedText, setAnalysisResults } = useAppContext();

  const [statusText, setStatusText] = useState('System Standby');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Automatically start analysis when screen loads if there is uploaded text
  useEffect(() => {
    if (uploadedText && !isAnalyzing && !analysisComplete) {
      startAnalysis();
    }
  }, [uploadedText]);

  const startAnalysis = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    const statuses = [
      "Parsing uploaded content...",
      "Extracting key insights...",
      "Detecting operational risks...",
      "Generating recommended actions...",
      "Simulating business impact...",
      "Analysis Complete"
    ];

    let step = 0;
    setStatusText(statuses[step]);

    // Start a visual interval to cycle through statuses
    const interval = setInterval(() => {
      if (step < statuses.length - 2) {
        step++;
        setStatusText(statuses[step]);
      }
    }, 1500);

    try {
      // Actually call Gemini API
      const geminiResults = await analyzeContent(uploadedText);
      
      clearInterval(interval);
      setStatusText(statuses[statuses.length - 1]);
      setAnalysisResults(geminiResults);
      
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      
      // Automatically navigate
      setTimeout(() => {
        router.replace('/results');
      }, 1000);

    } catch (error) {
      clearInterval(interval);
      console.error('Gemini API Error:', error);
      
      setStatusText("Analysis Failed - Using Fallback");
      
      // Provide fallback mock data if API fails
      setAnalysisResults({
        riskScore: 82,
        confidence: 94,
        priorityLevel: 'High',
        estimatedImpact: 'Significant operational improvement possible',
        keyFindings: [
          'Revenue anomaly detected (Fallback)',
          'Customer dissatisfaction trend',
          'Regional performance decline'
        ],
        riskAssessment: [
          'Compliance exposure',
          'High churn probability',
          'Escalation risk'
        ],
        recommendedActions: [
          'Notify leadership team',
          'Launch retention campaign',
          'Schedule policy audit'
        ],
        beforeChurn: '14.2%',
        afterChurn: '8.5%'
      });

      setIsAnalyzing(false);
      setAnalysisComplete(true);
      
      // Automatically navigate anyway
      setTimeout(() => {
        router.replace('/results');
      }, 1000);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Typography variant="h1" style={styles.title}>AI Insight Engine</Typography>
          <Typography variant="body" style={styles.subtitle}>
            Multi-agent orchestrator dashboard. Watch the AI agents autonomously process your data.
          </Typography>
        </View>

        <Card style={styles.orchestratorCard}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusDot, 
              isAnalyzing ? styles.statusDotAnalyzing : (analysisComplete ? styles.statusDotComplete : styles.statusDotStandby)
            ]} />
            <Typography variant="h2" style={styles.statusTitle}>Orchestrator Status</Typography>
          </View>

          <View style={styles.consoleBox}>
            <Typography style={styles.consoleText}>
              {'> ' + statusText}
            </Typography>
            {isAnalyzing && <ActivityIndicator size="small" color="#10B981" style={{ marginLeft: 12 }} />}
          </View>

          {!isAnalyzing && !analysisComplete && (
            <Button 
              title="Run Multi-Agent Analysis"
              onPress={startAnalysis}
              style={styles.runButton}
            />
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0F'
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
    fontSize: 36,
    letterSpacing: -0.5,
    marginBottom: 12
  },
  subtitle: {
    color: '#8A8D98',
    lineHeight: 24
  },
  orchestratorCard: {
    marginBottom: 24,
    padding: 20
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2
  },
  statusDotStandby: {
    backgroundColor: '#334155',
    shadowOpacity: 0
  },
  statusDotAnalyzing: {
    backgroundColor: '#F59E0B',
    shadowColor: '#F59E0B'
  },
  statusDotComplete: {
    backgroundColor: '#10B981',
    shadowColor: '#10B981'
  },
  statusTitle: {
    fontSize: 18,
    marginBottom: 0
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
    minHeight: 64
  },
  consoleText: {
    color: '#10B981',
    fontFamily: 'monospace',
    fontSize: 14,
    flex: 1,
    lineHeight: 20
  },
  runButton: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 16
  }
});