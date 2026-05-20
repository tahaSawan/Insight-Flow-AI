import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/Typography';
import { colors, radius } from '@/constants/designTokens';

interface AnimatedExecutionLogProps {
  lines: string[];
  intervalMs?: number;
}

function formatTimestamp(offsetSeconds: number): string {
  const d = new Date();
  d.setSeconds(d.getSeconds() + offsetSeconds);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export function AnimatedExecutionLog({ lines, intervalMs = 400 }: AnimatedExecutionLogProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    setVisibleCount(0);
    if (lines.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setVisibleCount(index + 1);
        }, intervalMs * (index + 1)),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [lines, intervalMs]);

  return (
    <View style={styles.container}>
      {lines.slice(0, visibleCount).map((line, index) => (
        <Typography key={`log-${index}`} style={styles.logLine}>
          <Typography style={styles.logTime}>[{formatTimestamp(index * 2)}]</Typography> {line}
        </Typography>
      ))}
      {visibleCount < lines.length ? (
        <Typography style={styles.cursor}>{'>'} streaming...</Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logLine: {
    color: colors.textSecondary,
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 18,
  },
  logTime: {
    color: colors.accent,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  cursor: {
    color: colors.accentSecondary,
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
