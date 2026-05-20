import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Trash2, ChevronRight, UploadCloud } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppContext } from '@/context/AppContext';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing } from '@/constants/designTokens';
import type { HistoryEntry } from '@/types/analysis';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryScreen() {
  const router = useRouter();
  const { history, loadHistoryEntry, removeHistoryEntry, clearHistory } = useAppContext();

  const openEntry = (entry: HistoryEntry) => {
    loadHistoryEntry(entry);
    router.push('/results');
  };

  const confirmDelete = (entry: HistoryEntry) => {
    Alert.alert('Delete analysis?', entry.title, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeHistoryEntry(entry.id),
      },
    ]);
  };

  const confirmClearAll = () => {
    Alert.alert('Clear all history?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader title={UI.history.title} subtitle={UI.history.subtitle} />

        {history.length === 0 ? (
          <Card style={styles.emptyCard}>
            <UploadCloud size={36} color={colors.accent} />
            <Typography variant="h3" style={styles.emptyTitle}>
              {UI.history.emptyTitle}
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              {UI.history.emptyBody}
            </Typography>
            <Typography variant="caption" style={styles.emptySteps}>
              {UI.history.emptySteps}
            </Typography>
            <Button
              title={UI.history.startBtn}
              onPress={() => router.push('/upload')}
              style={styles.emptyBtn}
            />
          </Card>
        ) : (
          <>
            {history.map((entry) => (
              <Card key={entry.id} style={styles.entryCard}>
                <Pressable
                  onPress={() => openEntry(entry)}
                  style={({ pressed }) => [pressed && styles.pressed]}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.entryMeta}>
                      <Typography style={styles.entryTitle} numberOfLines={1}>
                        {entry.title}
                      </Typography>
                      <Typography variant="caption">
                        {formatDate(entry.createdAt)} · {entry.industry}
                        {entry.sourceFileName ? ` · ${entry.sourceFileName}` : ''}
                      </Typography>
                    </View>
                    <ChevronRight size={20} color={colors.textMuted} />
                  </View>
                  <Typography variant="caption" style={styles.preview} numberOfLines={2}>
                    {entry.documentPreview}...
                  </Typography>
                </Pressable>
                <View style={styles.entryFooter}>
                  <Typography style={styles.riskBadge}>
                    Risk {entry.results.riskScore}
                  </Typography>
                  <Pressable
                    onPress={() => confirmDelete(entry)}
                    hitSlop={12}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <Trash2 size={18} color={colors.danger} />
                  </Pressable>
                </View>
              </Card>
            ))}
            <Button
              title={UI.history.clearAll}
              variant="outline"
              onPress={confirmClearAll}
              style={styles.clearBtn}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: 40 },
  pressed: { opacity: 0.85 },
  emptyCard: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  emptyTitle: { marginTop: spacing.sm, textAlign: 'center' },
  emptyText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  emptySteps: {
    color: colors.accentText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  emptyBtn: { marginTop: spacing.sm, paddingVertical: 14, width: '100%' },
  entryCard: { marginBottom: spacing.sm, padding: spacing.md },
  entryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  entryMeta: { flex: 1, marginRight: spacing.sm },
  entryTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  preview: { lineHeight: 18, marginBottom: spacing.sm },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskBadge: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  clearBtn: { marginTop: spacing.md, paddingVertical: 14 },
});
