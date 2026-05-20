import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { AppScreen } from '@/components/AppScreen';
import { useRouter } from 'expo-router';
import { Trash2, ChevronRight, UploadCloud } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useAppContext } from '@/context/AppContext';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing, screenContent } from '@/constants/designTokens';
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

type ConfirmState =
  | { kind: 'delete'; entry: HistoryEntry }
  | { kind: 'clearAll' }
  | null;

export default function HistoryScreen() {
  const router = useRouter();
  const { history, loadHistoryEntry, removeHistoryEntry, clearHistory } = useAppContext();
  const [confirm, setConfirm] = useState<ConfirmState>(null);

  const openEntry = (entry: HistoryEntry) => {
    loadHistoryEntry(entry);
    router.push('/results');
  };

  return (
    <AppScreen>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader title={UI.history.title} subtitle={UI.history.subtitle} />

        {history.length === 0 ? (
          <Card
            variant="elevated"
            icon={<UploadCloud size={36} color={colors.accent} />}
            title={UI.history.emptyTitle}
            subtitle={UI.history.emptyBody}
            style={styles.emptyCard}
          >
            <Typography variant="caption" style={styles.emptySteps}>
              {UI.history.emptySteps}
            </Typography>
            <Button
              title={UI.history.startBtn}
              onPress={() => router.push('/upload')}
              fullWidth
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
                    onPress={() => setConfirm({ kind: 'delete', entry })}
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
              variant="danger"
              onPress={() => setConfirm({ kind: 'clearAll' })}
              fullWidth
            />
          </>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirm?.kind === 'delete'}
        title="Delete this report?"
        message={confirm?.kind === 'delete' ? confirm.entry.title : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirm?.kind === 'delete') void removeHistoryEntry(confirm.entry.id);
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        visible={confirm?.kind === 'clearAll'}
        title="Clear all history?"
        message="This cannot be undone."
        confirmLabel="Clear all"
        destructive
        onConfirm={() => {
          void clearHistory();
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: screenContent,
  pressed: { opacity: 0.85 },
  emptyCard: { alignItems: 'center' },
  emptySteps: {
    color: colors.accentText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  entryCard: { padding: spacing.md },
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
    backgroundColor: colors.dangerSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderDanger,
  },
});
