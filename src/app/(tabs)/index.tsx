import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Zap, ShieldAlert, Settings, ChevronRight } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { StatPreviewCard } from '@/components/StatPreviewCard';
import { useAppContext } from '@/context/AppContext';
import { UI } from '@/constants/plainLanguage';
import { REAL_WORLD_PROBLEM } from '@/constants/problemStory';
import { ScreenHeader } from '@/components/ScreenHeader';
import { colors, spacing } from '@/constants/designTokens';

export default function HomeScreen() {
  const router = useRouter();
  const { analysisResults, history, loadHistoryEntry } = useAppContext();

  const hasLastRun = analysisResults !== null;
  const recentHistory = history.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push('/settings')} style={styles.settingsBtn}>
            <Settings size={22} color="#8A8D98" />
          </Pressable>
        </View>

        <ScreenHeader
          title="InsightFlow AI"
          subtitle={UI.home.subtitle}
          badge={UI.home.badge}
        />

        <Card style={styles.problemCard}>
          <Typography style={styles.problemLabel}>The real problem</Typography>
          <Typography style={styles.problemText}>{REAL_WORLD_PROBLEM.pain}</Typography>
          <Typography variant="caption" style={styles.problemSolution}>
            {REAL_WORLD_PROBLEM.insightFlow}
          </Typography>
        </Card>

        <View style={styles.previewRow}>
          <StatPreviewCard
            label={UI.home.riskLabel}
            value={hasLastRun ? `${analysisResults.riskScore}` : '—'}
            accent="#EF4444"
            subtext={hasLastRun ? 'Last report' : 'Waiting'}
          />
          <View style={styles.previewGap} />
          <StatPreviewCard
            label={UI.home.sureLabel}
            value={hasLastRun ? `${analysisResults.confidence}%` : '—'}
            accent="#10B981"
            subtext={hasLastRun ? analysisResults.priorityLevel : 'Ready'}
          />
          <View style={styles.previewGap} />
          <StatPreviewCard
            label={UI.home.actionsLabel}
            value={hasLastRun ? `${analysisResults.simulatedActions.length}` : '3'}
            accent="#A855F7"
            subtext={hasLastRun ? UI.home.actionsSubDone : UI.home.actionsSubReady}
          />
        </View>

        <View style={styles.featureRow}>
          <Card style={styles.featureCard}>
            <Zap size={20} color="#F59E0B" />
            <Typography style={styles.featureTitle}>{UI.home.featureAgents}</Typography>
            <Typography variant="caption">{UI.home.featureAgentsDesc}</Typography>
          </Card>
          <Card style={styles.featureCard}>
            <ShieldAlert size={20} color="#6366F1" />
            <Typography style={styles.featureTitle}>{UI.home.featureDemo}</Typography>
            <Typography variant="caption">{UI.home.featureDemoDesc}</Typography>
          </Card>
        </View>

        {recentHistory.length > 0 ? (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Typography variant="h3" style={styles.historyTitle}>
                {UI.home.recentTitle}
              </Typography>
              <Pressable onPress={() => router.push('/history')}>
                <Typography style={styles.seeAll}>{UI.home.seeAll}</Typography>
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
                        {UI.home.historyRisk(entry.results.riskScore)} · {entry.industry}
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
            {hasLastRun ? UI.home.ctaTitleAgain : UI.home.ctaTitleReady}
          </Typography>
          <Typography variant="body" style={styles.cardSubtitle}>
            {hasLastRun ? UI.home.ctaSubAgain : UI.home.ctaSubReady}
          </Typography>

          <Button
            title={UI.home.startBtn}
            onPress={() => router.push('/upload')}
            style={styles.button}
          />

          {hasLastRun ? (
            <Button
              title={UI.home.viewLastBtn}
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
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  settingsBtn: { padding: 8 },
  problemCard: {
    padding: 16,
    marginBottom: 20,
    borderColor: 'rgba(99, 102, 241, 0.25)',
    borderWidth: 1,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  problemLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#A5B4FC',
    marginBottom: 8,
  },
  problemText: { color: '#E2E8F0', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  problemSolution: { color: '#94A3B8', lineHeight: 20, fontSize: 13 },
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
