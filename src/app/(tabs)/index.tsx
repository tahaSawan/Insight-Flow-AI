import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppScreen } from '@/components/AppScreen';
import { useRouter } from 'expo-router';
import {
  Settings,
  ChevronRight,
  FileText,
  Sparkles,
  ShieldAlert,
  Zap,
  Play,
} from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { HomeDashboardPreview } from '@/components/HomeDashboardPreview';
import { HomeFeatureCard } from '@/components/HomeFeatureCard';
import { useAppContext } from '@/context/AppContext';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing, radius } from '@/constants/designTokens';

export default function HomeScreen() {
  const router = useRouter();
  const { analysisResults, history, loadHistoryEntry } = useAppContext();

  const hasLastRun = analysisResults !== null;
  const recentHistory = history.slice(0, 2);

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View style={styles.brandChip}>
            <View style={styles.brandDot} />
            <Typography variant="label" style={styles.brandText}>
              InsightFlow AI
            </Typography>
          </View>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [styles.settingsBtn, pressed && styles.pressed]}
            accessibilityLabel="Settings"
          >
            <Settings size={22} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.heroShell}>
          <LinearGradient
            colors={[colors.accentSoft, 'transparent', colors.accentSecondarySoft]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGlow}
          />
          <View style={styles.hero}>
            <Typography variant="heroTitle">{UI.home.heroTitle}</Typography>
            <Typography variant="heroSubtitle">{UI.home.heroSubtitle}</Typography>
          </View>
        </View>

        <View style={styles.ctaWrap}>
          <Button
            title={UI.home.startAnalysisBtn}
            onPress={() => router.push('/upload')}
            fullWidth
            iconLeft={<Sparkles size={18} color={colors.white} />}
            style={styles.primaryCta}
          />
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/upload',
                params: { demo: 'judge' },
              })
            }
            style={({ pressed }) => [styles.judgeLink, pressed && styles.pressed]}
          >
            <Play size={14} color={colors.accentText} />
            <Typography style={styles.judgeLinkText}>{UI.home.judgeDemoBtn}</Typography>
          </Pressable>
          <Typography variant="caption" style={styles.judgeHint}>
            {UI.home.judgeDemoHint}
          </Typography>
        </View>

        <View style={styles.featureRow}>
          <HomeFeatureCard
            title={UI.home.featureExtract}
            tint="cyan"
            icon={<Sparkles size={18} color={colors.accent} />}
          />
          <HomeFeatureCard
            title={UI.home.featureRisks}
            tint="amber"
            icon={<ShieldAlert size={18} color={colors.warning} />}
          />
          <HomeFeatureCard
            title={UI.home.featureExecute}
            tint="emerald"
            icon={<Zap size={18} color={colors.accentSecondary} />}
          />
        </View>

        <HomeDashboardPreview results={analysisResults} />

        {hasLastRun ? (
          <Pressable
            onPress={() => router.push('/results')}
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Card
              variant="alert"
              highlighted
              title={UI.home.lastRunTitle}
              icon={<FileText size={20} color={colors.accent} />}
              style={styles.lastRunCard}
            >
              <View style={styles.lastRunRow}>
                <View style={styles.lastRunBody}>
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
                <Card variant="elevated" style={styles.historyCard}>
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
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  brandText: {
    color: colors.accentText,
    letterSpacing: 0.6,
  },
  settingsBtn: { padding: 8 },
  pressed: { opacity: 0.85 },
  heroShell: {
    borderRadius: radius.xl,
    padding: 1,
    marginBottom: spacing.lg,
  },
  heroGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    opacity: 0.85,
  },
  hero: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  ctaWrap: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  primaryCta: {
    marginBottom: spacing.xs,
  },
  judgeLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
  },
  judgeLinkText: {
    color: colors.accentText,
    fontSize: 14,
    fontWeight: '600',
  },
  judgeHint: {
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  lastRunCard: {
    marginBottom: spacing.sm,
  },
  lastRunRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  lastRunBody: { flex: 1 },
  lastRunHeadline: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 6,
  },
  lastRunMeta: { color: colors.textSecondary },
  lastRunTap: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  historySection: { marginTop: spacing.sm },
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
