import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { getAgentDefinition } from '@/constants/agents';
import { UI } from '@/constants/plainLanguage';
import { colors, spacing } from '@/constants/designTokens';
import type { AgentTraceEntry } from '@/types/agents';

interface AgentTracePanelProps {
  trace: AgentTraceEntry[];
}

function formatTime(iso?: string) {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function AgentTracePanel({ trace }: AgentTracePanelProps) {
  if (!trace.length) return null;

  return (
    <Card title={UI.results.traceTitle} subtitle={UI.results.traceHint} style={styles.card}>
      {trace.map((entry, index) => {
        const def = getAgentDefinition(entry.agentId);
        return (
          <View key={entry.agentId} style={styles.step}>
            <View style={styles.stepHeader}>
              <Typography style={styles.stepIcon}>{def.icon}</Typography>
              <View style={styles.stepMeta}>
                <Typography style={styles.stepName}>{entry.agentName}</Typography>
                <Typography variant="caption" style={styles.stepTime}>
                  {formatTime(entry.startedAt)}
                  {entry.completedAt ? ` → ${formatTime(entry.completedAt)}` : ''}
                </Typography>
              </View>
              <Typography
                style={[
                  styles.status,
                  entry.status === 'complete' && styles.statusDone,
                  entry.status === 'error' && styles.statusErr,
                ]}
              >
                {entry.status === 'complete'
                  ? 'DONE'
                  : entry.status === 'running'
                    ? 'WORKING'
                    : entry.status === 'error'
                      ? 'ERROR'
                      : 'WAIT'}
              </Typography>
            </View>
            <Typography style={styles.reasoning}>{entry.reasoning}</Typography>
            {entry.outputSummary ? (
              <Typography style={[styles.output, { color: def.color }]}>
                → {entry.outputSummary}
              </Typography>
            ) : null}
            {index < trace.length - 1 ? <View style={styles.connector} /> : null}
          </View>
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 0 },
  step: { marginBottom: 4 },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  stepIcon: { fontSize: 18, width: 24 },
  stepMeta: { flex: 1 },
  stepName: { fontWeight: '700', fontSize: 14 },
  stepTime: { color: colors.textDim, fontSize: 11, marginTop: 2, fontFamily: 'monospace' },
  status: { fontSize: 10, fontWeight: '800', color: colors.textDim, letterSpacing: 0.5 },
  statusDone: { color: colors.success },
  statusErr: { color: colors.danger },
  reasoning: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginTop: 8, marginLeft: 34 },
  output: { fontSize: 13, fontWeight: '600', marginTop: 6, marginLeft: 34 },
  connector: {
    width: 2,
    height: 12,
    backgroundColor: colors.track,
    marginLeft: 45,
    marginVertical: 4,
  },
});
