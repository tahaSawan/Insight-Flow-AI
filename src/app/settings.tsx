import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useAppContext } from '@/context/AppContext';
import { getGeminiConfigError } from '@/services/gemini';
import { setOnboardingComplete } from '@/services/appPreferences';
import { colors, spacing, screenContent } from '@/constants/designTokens';

type ConfirmKind = 'reset' | 'clear' | null;

export default function SettingsScreen() {
  const router = useRouter();
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>(null);
  const { resetSession, clearHistory, history } = useAppContext();
  const apiStatus = getGeminiConfigError();

  const handleReset = () => {
    resetSession();
    setConfirmKind(null);
    router.replace('/');
  };

  const handleClearHistory = () => {
    void clearHistory();
    setConfirmKind(null);
  };

  const handleReplayOnboarding = async () => {
    await setOnboardingComplete(false);
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
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
              ? apiStatus
              : 'Using gemini-2.5-flash. Set EXPO_PUBLIC_GEMINI_API_KEY in .env'}
          </Typography>
        </Card>

        <Card title="Data" style={styles.card}>
          <Button
            title="Reset Current Session"
            variant="secondary"
            onPress={() => setConfirmKind('reset')}
            fullWidth
          />
          <Button
            title="Clear Analysis History"
            variant="danger"
            onPress={() => setConfirmKind('clear')}
            fullWidth
            style={styles.btnSpaced}
          />
          <Button
            title="Replay welcome intro"
            variant="ghost"
            onPress={handleReplayOnboarding}
            fullWidth
            style={styles.btnSpaced}
          />
        </Card>

        <Button title="Back" variant="ghost" onPress={() => router.back()} fullWidth style={styles.backBtn} />
      </ScrollView>

      <ConfirmDialog
        visible={confirmKind === 'reset'}
        title="Reset current session?"
        message="Clears in-progress upload and results."
        confirmLabel="Reset"
        destructive
        onConfirm={handleReset}
        onCancel={() => setConfirmKind(null)}
      />
      <ConfirmDialog
        visible={confirmKind === 'clear'}
        title="Clear all saved analyses?"
        message="This cannot be undone."
        confirmLabel="Clear"
        destructive
        onConfirm={handleClearHistory}
        onCancel={() => setConfirmKind(null)}
      />
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
  scroll: screenContent,
  card: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  hint: { color: colors.textMuted, lineHeight: 18 },
  btnSpaced: { marginTop: spacing.sm },
  backBtn: { marginTop: spacing.sm },
});
