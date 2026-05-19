import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HistoryEntry } from '@/types/analysis';

const HISTORY_KEY = '@insightflow/history';
const MAX_ENTRIES = 20;

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  const existing = await loadHistory();
  const updated = [entry, ...existing.filter((e) => e.id !== entry.id)].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function clearAllHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_KEY);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const existing = await loadHistory();
  await AsyncStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(existing.filter((e) => e.id !== id)),
  );
}
