import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Terminal } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { CINEMATIC_WORKFLOW } from '@/constants/workflowAgents';
import type { AgentTraceEntry } from '@/types/agents';
import { colors, radius, spacing } from '@/constants/designTokens';

interface AgentWorkflowTerminalProps {
  trace: AgentTraceEntry[];
}

function logColor(line: string): string {
  if (line.startsWith('[SYSTEM]')) return colors.accentText;
  if (line.includes('ERROR') || line.includes('✗')) return colors.danger;
  if (line.includes('✓')) return colors.success;
  if (line.includes('[RISK]')) return colors.warning;
  if (line.includes('[EXEC]')) return colors.accentDeep;
  return colors.textSecondary;
}

function buildLogLines(trace: AgentTraceEntry[], seen: Set<string>): string[] {
  const lines: string[] = [];
  if (!seen.has('boot')) {
    seen.add('boot');
    lines.push('[SYSTEM] Autonomous workflow initialized');
    lines.push('[SYSTEM] Orchestrator online · 5 agents queued');
  }

  for (const step of CINEMATIC_WORKFLOW) {
    const entry = trace.find((t) => t.agentId === step.id);
    if (!entry) continue;

    const runKey = `${step.id}:run`;
    const doneKey = `${step.id}:done`;
    const errKey = `${step.id}:err`;

    if (entry.status === 'running' && !seen.has(runKey)) {
      seen.add(runKey);
      lines.push(`[${step.logTag}] Agent engaged → ${entry.reasoning}`);
    }
    if (entry.status === 'complete' && !seen.has(doneKey)) {
      seen.add(doneKey);
      const out = entry.outputSummary ? ` · ${entry.outputSummary}` : '';
      lines.push(`[${step.logTag}] ✓ Complete${out}`);
    }
    if (entry.status === 'error' && !seen.has(errKey)) {
      seen.add(errKey);
      lines.push(`[${step.logTag}] ✗ ${entry.reasoning}`);
    }
  }

  const allDone = trace.length >= 5 && trace.every((t) => t.status === 'complete');
  if (allDone && !seen.has('finish')) {
    seen.add('finish');
    lines.push('[SYSTEM] ✓ Workflow complete — routing to decision report');
  }

  return lines;
}

export function AgentWorkflowTerminal({ trace }: AgentWorkflowTerminalProps) {
  const [lines, setLines] = useState<string[]>([]);
  const seenRef = useRef(new Set<string>());
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const newLines = buildLogLines(trace, seenRef.current);
    if (newLines.length > 0) {
      setLines((prev) => [...prev, ...newLines].slice(-12));
    }
  }, [trace]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [lines]);

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          <View style={[styles.dot, { backgroundColor: colors.warning }]} />
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
        </View>
        <Terminal size={11} color={colors.textDim} />
        <Typography style={styles.headerTitle}>AGENT_LOG_STREAM</Typography>
      </View>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
      >
        {lines.length === 0 ? (
          <Typography style={styles.line}>_ awaiting agent events…</Typography>
        ) : (
          lines.map((line, i) => (
            <Typography key={`${i}-${line.slice(0, 12)}`} style={[styles.line, { color: logColor(line) }]}>
              {line}
            </Typography>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  headerTitle: {
    flex: 1,
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  scroll: {
    maxHeight: 108,
  },
  scrollContent: {
    padding: spacing.sm,
    gap: 3,
  },
  line: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 14,
    color: colors.textSecondary,
  },
});
