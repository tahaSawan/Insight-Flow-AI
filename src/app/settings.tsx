import React from 'react';
import { View, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAppContext } from '@/context/AppContext';
import { getGeminiConfigError } from '@/services/gemini';
import { setOnboardingComplete } from '@/services/appPreferences';
import { UI } from '@/constants/plainLanguage';
import { loadWinningDemoScenario } from '@/utils/loadWinningDemoScenario';
import { colors, spacing } from '@/constants/designTokens';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    resetSession,
    clearHistory,
    history,
    demoMode,
    setDemoMode,
    setUploadedText,
    setSourceFileName,
    setIndustry,
    setUseCase,
    setAnalysisMode,
    setAnalysisResults,
    setDemoActionExecuted,
    setAnalysisUsedFallback,
  } = useAppContext();
  const apiStatus = getGeminiConfigError();

  const handleReset = () => {
    Alert.alert('Reset current session?', 'Clears in-progress upload and results.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetSession();
          router.replace('/');
        },
      },
    ]);
  };

  const handleClearHistory = () => {
    Alert.alert('Clear all saved analyses?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  };

  const handleReplayOnboarding = async () => {
    await setOnboardingComplete(false);
    Alert.alert('Intro replay', 'Go to Home tab — the welcome slides will show again.', [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card title={UI.demo.settingsTitle} style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchBody}>
              <Typography style={styles.switchLabel}>Demo mode</Typography>
              <Typography variant="caption" style={styles.switchHint}>
                {UI.demo.settingsBody}
              </Typography>
            </View>
            <Switch
              value={demoMode}
              onValueChange={setDemoMode}
              trackColor={{ false: colors.surfaceHighlight, true: colors.accent }}
              thumbColor={colors.white}
            />
          </View>
          <Button
            title={UI.demo.loadWinningBtn}
            onPress={() =>
              void loadWinningDemoScenario(
                {
                  setDemoMode,
                  setUploadedText,
                  setSourceFileName,
                  setIndustry,
                  setUseCase,
                  setAnalysisMode,
                  setAnalysisResults,
                  setDemoActionExecuted,
                  setAnalysisUsedFallback,
                },
                router,
              )
            }
            fullWidth
            style={styles.btnSpaced}
          />
          <Typography variant="caption" style={styles.switchHint}>
            {UI.demo.loadWinningHint}
          </Typography>
          <Button
            title="Replay welcome intro"
            variant="secondary"
            onPress={handleReplayOnboarding}
            fullWidth
            style={styles.btnSpaced}
          />
        </Card>

        <Card title="App" style={styles.card}>
          <Row label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} />
          <Row label="Saved analyses" value={String(history.length)} />
        </Card>

        <Card title="AI Configuration" style={styles.card}>
          <Row
            label="Gemini API"
            value={apiStatus ? 'Not configured' : 'Connected'}
            valueColor={apiStatus ? colors.danger : colors.accentSecondary}
          />
          <Typography variant="caption" style={styles.hint}>
            {apiStatus
              ? demoMode
                ? 'API key not set — demo mode will use the curated Lahore storyline.'
                : apiStatus
              : 'Using gemini-2.5-flash. Set EXPO_PUBLIC_GEMINI_API_KEY in .env'}
          </Typography>
        </Card>

        <Card title="Data" style={styles.card}>
          <Button title="Reset Current Session" variant="secondary" onPress={handleReset} fullWidth />
          <Button
            title="Clear Analysis History"
            variant="danger"
            onPress={handleClearHistory}
            fullWidth
            style={styles.btnSpaced}
          />
        </Card>

        <Button title="Back" variant="ghost" onPress={() => router.back()} fullWidth style={styles.backBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  valueColor = colors.text,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Typography variant="caption">{label}</Typography>
      <Typography style={{ color: valueColor, fontWeight: '600' }}>{value}</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  card: { padding: spacing.lg, marginBottom: spacing.md, gap: 12 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  switchBody: { flex: 1 },
  switchLabel: { fontWeight: '700', marginBottom: 4 },
  switchHint: { color: colors.textMuted, lineHeight: 18 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hint: { color: colors.textMuted, lineHeight: 18 },
  btnSpaced: { marginTop: 10 },
  backBtn: { marginTop: 8, paddingVertical: 16 },
});
