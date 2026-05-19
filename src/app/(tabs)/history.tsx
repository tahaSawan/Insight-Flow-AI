import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Clock, Trash2, ChevronRight } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAppContext } from '@/context/AppContext';
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
        <Typography variant="h1" style={styles.title}>
          Analysis History
        </Typography>
        <Typography variant="body" style={styles.subtitle}>
          Reopen past decision reports saved on this device.
        </Typography>

        {history.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Clock size={32} color="#64748B" />
            <Typography variant="h3" style={styles.emptyTitle}>
              No history yet
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              Complete an analysis to save it here automatically.
            </Typography>
            <Button
              title="Start Analysis"
              onPress={() => router.push('/upload')}
              style={styles.emptyBtn}
            />
          </Card>
        ) : (
          <>
            {history.map((entry) => (
              <Card key={entry.id} style={styles.entryCard}>
                <Pressable onPress={() => openEntry(entry)}>
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
                    <ChevronRight size={20} color="#64748B" />
                  </View>
                  <Typography variant="caption" style={styles.preview} numberOfLines={2}>
                    {entry.documentPreview}...
                  </Typography>
                </Pressable>
                <View style={styles.entryFooter}>
                  <Typography style={styles.riskBadge}>
                    Risk {entry.results.riskScore}
                  </Typography>
                  <Pressable onPress={() => confirmDelete(entry)} hitSlop={12}>
                    <Trash2 size={18} color="#EF4444" />
                  </Pressable>
                </View>
              </Card>
            ))}
            <Button
              title="Clear All History"
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
  safeArea: { flex: 1, backgroundColor: '#0A0A0F' },
  scroll: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  title: { fontSize: 32, marginBottom: 8 },
  subtitle: { color: '#8A8D98', marginBottom: 24, lineHeight: 22 },
  emptyCard: { padding: 32, alignItems: 'center', gap: 12 },
  emptyTitle: { marginTop: 8 },
  emptyText: { color: '#8A8D98', textAlign: 'center', lineHeight: 22 },
  emptyBtn: { marginTop: 16, paddingVertical: 14, width: '100%' },
  entryCard: { marginBottom: 12, padding: 16 },
  entryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  entryMeta: { flex: 1, marginRight: 8 },
  entryTitle: { fontWeight: '700', fontSize: 16, marginBottom: 4 },
  preview: { color: '#94A3B8', lineHeight: 18, marginBottom: 12 },
  entryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskBadge: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  clearBtn: { marginTop: 16, paddingVertical: 14 },
});
