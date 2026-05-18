import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function AnalysisScreen() {
  const router = useRouter();
  
  const [statusText, setStatusText] = useState('System Standby');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const startAnalysis = () => {
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

    const interval = setInterval(() => {
      step++;
      if (step < statuses.length) {
        setStatusText(statuses[step]);
      }
      
      if (step === statuses.length - 1) {
        clearInterval(interval);
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Insight Engine</Text>
          <Text style={styles.subtitle}>
            Multi-agent orchestrator dashboard. Watch the AI agents autonomously process your data.
          </Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusDot, isAnalyzing ? styles.statusDotActive : analysisComplete ? styles.statusDotComplete : null]} />
            <Text style={styles.statusTitle}>Orchestrator Status</Text>
          </View>
          
          <View style={styles.terminalWindow}>
            <Text style={styles.terminalText}>{'> ' + statusText}</Text>
            {isAnalyzing && <ActivityIndicator size="small" color="#10B981" style={styles.terminalSpinner} />}
          </View>

          {!isAnalyzing && !analysisComplete && (
            <TouchableOpacity style={styles.actionButton} onPress={startAnalysis} activeOpacity={0.8}>
              <Text style={styles.actionButtonText}>Run Multi-Agent Analysis</Text>
            </TouchableOpacity>
          )}
        </View>

        {analysisComplete && (
          <View style={styles.resultsContainer}>
            <Text style={styles.sectionTitle}>Execution Summary</Text>

            {/* Key Insights Card */}
            <View style={styles.insightCard}>
              <Text style={styles.cardHeader}>Key Insights</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Revenue growth trend detected across Q3 models</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Customer complaints increasing in support sector</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>Internal policy conflict identified regarding data retention</Text>
              </View>
            </View>

            {/* Risks Card */}
            <View style={[styles.insightCard, styles.riskCard]}>
              <Text style={[styles.cardHeader, styles.riskHeader]}>Operational Risks</Text>
              <View style={styles.bulletItem}>
                <Text style={[styles.bullet, styles.riskBullet]}>•</Text>
                <Text style={styles.bulletText}>High churn probability in enterprise segment</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={[styles.bullet, styles.riskBullet]}>•</Text>
                <Text style={styles.bulletText}>Compliance concerns regarding EU regulations</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={[styles.bullet, styles.riskBullet]}>•</Text>
                <Text style={styles.bulletText}>Delayed response risk in supply chain operations</Text>
              </View>
            </View>

            {/* Recommended Actions Card */}
            <View style={[styles.insightCard, styles.actionCard]}>
              <Text style={[styles.cardHeader, styles.actionHeader]}>Recommended Actions</Text>
              <View style={styles.bulletItem}>
                <Text style={[styles.bullet, styles.actionBullet]}>•</Text>
                <Text style={styles.bulletText}>Notify operations team to align retention policies</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={[styles.bullet, styles.actionBullet]}>•</Text>
                <Text style={styles.bulletText}>Escalate EU compliance review to legal department</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={[styles.bullet, styles.actionBullet]}>•</Text>
                <Text style={styles.bulletText}>Send automated retention offer to high-risk enterprise clients</Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.fullResultsButton} 
              onPress={() => router.push('/results')}
              activeOpacity={0.8}
            >
              <Text style={styles.fullResultsButtonText}>View Full Results</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#0A0A0F' 
  },
  scrollContainer: { 
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
    color: '#FFFFFF', 
    marginBottom: 10, 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#8A8D98', 
    lineHeight: 24 
  },
  statusCard: {
    backgroundColor: '#12121A',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
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
    backgroundColor: '#333344', 
    marginRight: 12 
  },
  statusDotActive: { 
    backgroundColor: '#F59E0B', // Amber for analyzing
    shadowColor: '#F59E0B', 
    shadowOpacity: 0.8, 
    shadowRadius: 6, 
    elevation: 4 
  },
  statusDotComplete: {
    backgroundColor: '#10B981', // Green for complete
    shadowColor: '#10B981', 
    shadowOpacity: 0.8, 
    shadowRadius: 6, 
    elevation: 4 
  },
  statusTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  terminalWindow: {
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
  terminalText: { 
    color: '#10B981', 
    fontFamily: 'monospace', 
    fontSize: 14, 
    flex: 1,
    lineHeight: 20
  },
  terminalSpinner: { 
    marginLeft: 12 
  },
  actionButton: { 
    backgroundColor: '#6366F1', 
    borderRadius: 12, 
    paddingVertical: 16, 
    alignItems: 'center', 
    marginTop: 20 
  },
  actionButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  resultsContainer: { 
    marginTop: 8 
  },
  sectionTitle: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#FFFFFF', 
    marginBottom: 16 
  },
  insightCard: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2D2D44', // Default purple/blue border
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#818CF8', 
    marginBottom: 12 
  },
  riskCard: { 
    borderColor: '#7F1D1D', 
    backgroundColor: '#170B0B',
    shadowColor: '#EF4444' 
  },
  riskHeader: { 
    color: '#FCA5A5' 
  },
  actionCard: { 
    borderColor: '#064E3B', 
    backgroundColor: '#0A1A14',
    shadowColor: '#10B981'
  },
  actionHeader: { 
    color: '#34D399' 
  },
  bulletItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 8 
  },
  bullet: { 
    color: '#818CF8', 
    fontSize: 18, 
    marginRight: 10, 
    lineHeight: 22 
  },
  riskBullet: { 
    color: '#FCA5A5' 
  },
  actionBullet: { 
    color: '#34D399' 
  },
  bulletText: { 
    color: '#E2E8F0', 
    fontSize: 15, 
    lineHeight: 22, 
    flex: 1 
  },
  fullResultsButton: {
    backgroundColor: '#1E1E2D',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2D2D44'
  },
  fullResultsButtonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});