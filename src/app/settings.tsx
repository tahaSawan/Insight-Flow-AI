import React from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAppContext } from '@/context/AppContext';
import { getGeminiConfigError } from '@/services/gemini';

export default function SettingsScreen() {
  const router = useRouter();
  const { resetSession, clearHistory, history } = useAppContext();
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

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card style={styles.card}>
          <Typography variant="h3" style={styles.sectionTitle}>
            App
          </Typography>
          <Row label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} />
          <Row label="Saved analyses" value={String(history.length)} />
        </Card>

        <Card style={styles.card}>
          <Typography variant="h3" style={styles.sectionTitle}>
            AI Configuration
          </Typography>
          <Row
            label="Gemini API"
            value={apiStatus ? 'Not configured' : 'Connected'}
            valueColor={apiStatus ? '#F87171' : '#10B981'}
          />
          <Typography variant="caption" style={styles.hint}>
            {apiStatus
              ? apiStatus
              : 'Using gemini-2.5-flash. Set EXPO_PUBLIC_GEMINI_API_KEY in .env'}
          </Typography>
        </Card>

        <Card style={styles.card}>
          <Typography variant="h3" style={styles.sectionTitle}>
            Data
          </Typography>
          <Button title="Reset Current Session" variant="outline" onPress={handleReset} />
          <Button
            title="Clear Analysis History"
            variant="outline"
            onPress={handleClearHistory}
            style={styles.btnSpaced}
          />
        </Card>

        <Button title="Back" onPress={() => router.back()} style={styles.backBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  label,
  value,
  valueColor = '#E2E8F0',
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
  safeArea: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { padding: 24, paddingBottom: 40 },
  card: { padding: 20, marginBottom: 16, gap: 12 },
  sectionTitle: { color: '#818CF8', marginBottom: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
  },
  hint: { color: '#64748B', lineHeight: 18 },
  btnSpaced: { marginTop: 10 },
  backBtn: { marginTop: 8, paddingVertical: 16 },
});
