import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ResultsScreen() {
  const router = useRouter();
  const [exportMessage, setExportMessage] = useState('');

  const handleExport = () => {
    setExportMessage('Report exported successfully');
    setTimeout(() => {
      setExportMessage('');
    }, 3000);
  };

  const renderMetricBar = (label: string, value: string, percentage: number, color: string) => (
    <View style={styles.metricContainer}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>AI Decision Report</Text>
          <Text style={styles.subtitle}>
            Generated insights and recommended actions.
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Executive Summary</Text>
          
          <View style={styles.metricsGrid}>
            {renderMetricBar('Risk Score', '82/100', 82, '#EF4444')}
            {renderMetricBar('Confidence', '94%', 94, '#10B981')}
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Priority Level:</Text>
            <View style={styles.badgeHigh}>
              <Text style={styles.badgeTextHigh}>High</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Estimated Impact:</Text>
            <Text style={styles.infoValue}>Significant operational improvement possible</Text>
          </View>
        </View>

        {/* Key Findings */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: '#6366F1' }]}>Key Findings</Text>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#6366F1' }]} />
            <Text style={styles.listText}>Revenue anomaly detected</Text>
          </View>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#6366F1' }]} />
            <Text style={styles.listText}>Customer dissatisfaction trend</Text>
          </View>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#6366F1' }]} />
            <Text style={styles.listText}>Regional performance decline</Text>
          </View>
        </View>

        {/* Risk Assessment */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: '#F59E0B' }]}>Risk Assessment</Text>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.listText}>Compliance exposure</Text>
          </View>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.listText}>High churn probability</Text>
          </View>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.listText}>Escalation risk</Text>
          </View>
        </View>

        {/* Recommended Actions */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionTitle, { color: '#10B981' }]}>Recommended Actions</Text>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#10B981' }]} />
            <Text style={styles.listText}>Notify leadership team</Text>
          </View>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#10B981' }]} />
            <Text style={styles.listText}>Launch retention campaign</Text>
          </View>
          <View style={styles.listItem}>
            <View style={[styles.bullet, { backgroundColor: '#10B981' }]} />
            <Text style={styles.listText}>Schedule policy audit</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.exportButton} onPress={handleExport} activeOpacity={0.8}>
            <Text style={styles.exportButtonText}>Export Report</Text>
          </TouchableOpacity>
          {exportMessage ? <Text style={styles.exportMessage}>{exportMessage}</Text> : null}

          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')} activeOpacity={0.8}>
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8D98',
    lineHeight: 24,
  },
  summaryCard: {
    backgroundColor: '#12121A',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    marginBottom: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  metricsGrid: {
    marginBottom: 20,
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
    color: '#8A8D98',
    fontSize: 14,
    fontWeight: '500',
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#1F1F2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1F1F2E',
  },
  infoLabel: {
    color: '#8A8D98',
    fontSize: 14,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  badgeHigh: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  badgeTextHigh: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: '#12121A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  listText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  actionsContainer: {
    marginTop: 24,
  },
  exportButton: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  exportMessage: {
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  homeButton: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
