import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { useRouter } from 'expo-router';
import { Settings, ChevronRight, FileText } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { useAppContext } from '@/context/AppContext';
import { UI } from '@/constants/plainLanguage';
import { REAL_WORLD_PROBLEM } from '@/constants/problemStory';
import { ScreenHeader } from '@/components/ScreenHeader';
import { HowItWorks } from '@/components/HowItWorks';
import { colors, spacing } from '@/constants/designTokens';

export default function HomeScreen() {
  const router = useRouter();
  const { analysisResults, history, loadHistoryEntry } = useAppContext();

  const hasLastRun = analysisResults !== null;
  const recentHistory = history.slice(0, 2);

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
          >
            <Settings size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <ScreenHeader
          title="InsightFlow AI"
          subtitle={UI.home.subtitle}
          badge={UI.home.badge}
        />

        <HowItWorks />

        <Card variant="elevated" style={styles.ctaCard}>
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

          <Button
            title={UI.home.judgeDemoBtn}
            variant="outline"
            onPress={() =>
              router.push({
                pathname: '/upload',
                params: { demo: 'judge' },
              })
            }
            style={styles.judgeBtn}
          />
          <Typography variant="caption" style={styles.judgeHint}>
            {UI.home.judgeDemoHint}
          </Typography>
        </Card>

        {hasLastRun ? (
          <Pressable
            onPress={() => router.push('/results')}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Card variant="accent" style={styles.lastRunCard}>
              <View style={styles.lastRunRow}>
                <FileText size={22} color={colors.accent} />
                <View style={styles.lastRunBody}>
                  <Typography style={styles.lastRunTitle}>{UI.home.lastRunTitle}</Typography>
                  <Typography style={styles.lastRunHeadline} numberOfLines={2}>
                    {analysisResults.urgencyHeadline ||
                      analysisResults.executiveSummary.slice(0, 100)}
                  </Typography>
                  <Typography variant="caption" style={styles.lastRunMeta}>
                    {UI.home.lastRunMeta(
                      analysisResults.riskScore,
                      analysisResults.confidence,
                      analysisResults.priorityLevel,
                    )}
                  </Typography>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </View>
              <Typography variant="caption" style={styles.lastRunTap}>
                {UI.home.lastRunTap}
              </Typography>
            </Card>
          </Pressable>
        ) : null}

        <Card style={styles.problemCard}>
          <Typography variant="label">{UI.home.featureDemo}</Typography>
          <Typography style={styles.problemText}>{REAL_WORLD_PROBLEM.pain}</Typography>
          <Typography variant="caption" style={styles.problemSolution}>
            {REAL_WORLD_PROBLEM.insightFlow}
          </Typography>
          <Typography variant="caption" style={styles.featureInline}>
            {UI.home.featureAgents} — {UI.home.featureAgentsDesc}
          </Typography>
        </Card>

        {recentHistory.length > 0 ? (
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Typography variant="h3" style={styles.historyTitle}>
                {UI.home.recentTitle}
              </Typography>
              <Pressable
                onPress={() => router.push('/history')}
                style={({ pressed }) => pressed && styles.pressed}
              >
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
                style={({ pressed }) => [pressed && styles.pressed]}
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
                    <ChevronRight size={18} color={colors.textMuted} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  settingsBtn: { padding: 8 },
  pressed: { opacity: 0.85 },
  ctaCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  judgeBtn: { width: '100%', paddingVertical: 14, marginTop: 4 },
  judgeHint: { color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  cardTitle: { fontSize: 20, marginBottom: 8 },
  cardSubtitle: { color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 22 },
  button: { width: '100%', paddingVertical: 16 },
  lastRunCard: { marginBottom: spacing.md, padding: spacing.md },
  lastRunRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  lastRunBody: { flex: 1 },
  lastRunTitle: { fontWeight: '700', fontSize: 14, marginBottom: 4, color: colors.accentText },
  lastRunHeadline: { color: colors.text, fontSize: 15, lineHeight: 21, marginBottom: 6 },
  lastRunMeta: { color: colors.textSecondary },
  lastRunTap: { color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  problemCard: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderColor: colors.borderAccent,
    gap: 8,
  },
  problemText: { color: colors.text, fontSize: 15, lineHeight: 22 },
  problemSolution: { lineHeight: 20 },
  featureInline: { color: colors.textMuted, marginTop: 4 },
  historySection: { marginBottom: spacing.md },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  historyTitle: { fontSize: 16, color: colors.text },
  seeAll: { color: colors.accentText, fontSize: 14, fontWeight: '600' },
  historyCard: { marginBottom: 8, padding: 14 },
  historyRow: { flexDirection: 'row', alignItems: 'center' },
  historyBody: { flex: 1 },
  historyEntryTitle: { fontWeight: '600', marginBottom: 4, fontSize: 15 },
});
