import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Sparkles, Zap, ShieldAlert, Settings, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { StatPreviewCard } from '@/components/StatPreviewCard';
import { useAppContext } from '@/context/AppContext';

export default function HomeScreen() {
  const router = useRouter();
  const { analysisResults, history, loadHistoryEntry } = useAppContext();

  const hasLastRun = analysisResults !== null;
  const recentHistory = history.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.badgeRow}>
            <Sparkles size={14} color="#818CF8" />
            <Typography style={styles.badge}>Insight-to-Action AI</Typography>
          </View>
          <Pressable onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Settings size={22} color="#8A8D98" />
          </Pressable>
        </View>

        <Typography variant="h1" style={styles.title}>
          InsightFlow AI
        </Typography>
        <Typography variant="body" style={styles.subtitle}>
          Turn reports and business updates into executive insights, automated actions, and
          projected impact — in seconds.
        </Typography>

        <View style={styles.previewRow}>
          <StatPreviewCard
            label="Risk Score"
            value={hasLastRun ? `${analysisResults.riskScore}` : '—'}
            accent="#EF4444"
            subtext={hasLastRun ? 'Last analysis' : 'Awaiting data'}
          />
          <View style={styles.previewGap} />
          <StatPreviewCard
            label="Confidence"
            value={hasLastRun ? `${analysisResults.confidence}%` : '—'}
            accent="#10B981"
            subtext={hasLastRun ? analysisResults.priorityLevel : 'AI ready'}
          />
          <View style={styles.previewGap} />
          <StatPreviewCard
            label="Actions"
            value={hasLastRun ? `${analysisResults.simulatedActions.length}` : '3'}
            accent="#A855F7"
            subtext="Auto-executed"
          />
        </View>

        <View style={styles.featureRow}>
          <Card style={styles.featureCard}>
            <Zap size={20} color="#F59E0B" />
            <Typography style={styles.featureTitle}>PDF & Text</Typography>
            <Typography variant="caption">Upload or paste any report</Typography>
          </Card>
          <Card style={styles.featureCard}>
            <ShieldAlert size={20} color="#6366F1" />
            <Typography style={styles.featureTitle}>Risk & Actions</Typography>
            <Typography variant="caption">AI-driven decision support</Typography>
          </Card>
        </View>

        {recentHistory.length > 0 ? (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Typography variant="h3" style={styles.historyTitle}>
                Recent Analyses
              </Typography>
              <Pressable onPress={() => router.push('/history')}>
                <Typography style={styles.seeAll}>See all</Typography>
              </Pressable>
            </View>
            {recentHistory.map((entry) => (
              <Pressable
                key={entry.id}
                onPress={() => {
                  loadHistoryEntry(entry);
                  router.push('/results');
                }}
              >
                <Card style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <View style={styles.historyBody}>
                      <Typography style={styles.historyEntryTitle} numberOfLines={1}>
                        {entry.title}
                      </Typography>
                      <Typography variant="caption">
                        Risk {entry.results.riskScore} · {entry.industry}
                      </Typography>
                    </View>
                    <ChevronRight size={18} color="#64748B" />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Card style={styles.ctaCard}>
          <Typography variant="h2" style={styles.cardTitle}>
            {hasLastRun ? 'Run another analysis' : 'Ready to analyze'}
          </Typography>
          <Typography variant="body" style={styles.cardSubtitle}>
            {hasLastRun
              ? 'Upload new content or view your latest decision report.'
              : 'Paste a report, upload PDF, or load our sample.'}
          </Typography>

          <Button
            title="Start Analysis"
            onPress={() => router.push('/upload')}
            style={styles.button}
          />

          {hasLastRun ? (
            <Button
              title="View Last Results"
              variant="outline"
              onPress={() => router.push('/results')}
              style={styles.secondaryButton}
            />
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { color: '#818CF8', fontSize: 13, fontWeight: '600' },
  settingsBtn: { padding: 8 },
  title: { fontSize: 40, lineHeight: 46, letterSpacing: -1, marginBottom: 14 },
  subtitle: { fontSize: 17, color: '#8A8D98', lineHeight: 26, marginBottom: 24 },
  previewRow: { flexDirection: 'row', marginBottom: 20 },
  previewGap: { width: 10 },
  featureRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  featureCard: { flex: 1, padding: 16, gap: 8 },
  featureTitle: { fontWeight: '700', fontSize: 14, marginTop: 4 },
  historySection: { marginBottom: 20 },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: { fontSize: 16, color: '#E2E8F0' },
  seeAll: { color: '#818CF8', fontSize: 14, fontWeight: '600' },
  historyCard: { marginBottom: 8, padding: 14 },
  historyRow: { flexDirection: 'row', alignItems: 'center' },
  historyBody: { flex: 1 },
  historyEntryTitle: { fontWeight: '600', marginBottom: 4, fontSize: 15 },
  ctaCard: {
    padding: 28,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: { fontSize: 22, marginBottom: 10 },
  cardSubtitle: { color: '#8A8D98', marginBottom: 24, lineHeight: 22 },
  button: { width: '100%', paddingVertical: 16, marginBottom: 12 },
  secondaryButton: { width: '100%', paddingVertical: 16 },
});
