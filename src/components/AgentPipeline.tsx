import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Typography } from '@/components/Typography';
import { AGENT_PIPELINE } from '@/constants/agents';
import type { AgentTraceEntry } from '@/types/agents';

interface AgentPipelineProps {
  trace: AgentTraceEntry[];
}

export function AgentPipeline({ trace }: AgentPipelineProps) {
  return (
    <View style={styles.container}>
      {AGENT_PIPELINE.map((agent) => {
        const entry = trace.find((t) => t.agentId === agent.id);
        const status = entry?.status ?? 'pending';
        const isRunning = status === 'running';
        const isComplete = status === 'complete';
        const isError = status === 'error';

        return (
          <View
            key={agent.id}
            style={[
              styles.card,
              isRunning && styles.cardRunning,
              isComplete && styles.cardComplete,
              isError && styles.cardError,
            ]}
          >
            <View style={styles.header}>
              <Typography style={styles.icon}>{agent.icon}</Typography>
              <View style={styles.headerText}>
                <Typography style={styles.name}>{agent.name}</Typography>
                <Typography variant="caption" style={styles.role}>
                  {agent.role}
                </Typography>
              </View>
              {isRunning ? (
                <ActivityIndicator size="small" color={agent.color} />
              ) : (
                <View
                  style={[
                    styles.badge,
                    isComplete && styles.badgeDone,
                    isError && styles.badgeError,
                    status === 'pending' && styles.badgePending,
                  ]}
                >
                  <Typography style={styles.badgeText}>
                    {isComplete ? 'DONE' : isError ? 'ERR' : '···'}
                  </Typography>
                </View>
              )}
            </View>

            {entry && status !== 'pending' ? (
              <View style={styles.body}>
                <Typography variant="caption" style={styles.reasoningLabel}>
                  What it is doing
                </Typography>
                <Typography style={styles.reasoning}>{entry.reasoning}</Typography>
                {entry.outputSummary ? (
                  <>
                    <Typography variant="caption" style={styles.outputLabel}>
                      Result
                    </Typography>
                    <Typography style={[styles.output, { color: agent.color }]}>
                      {entry.outputSummary}
                    </Typography>
                  </>
                ) : null}
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  card: {
    backgroundColor: '#12121A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F1F2E',
  },
  cardRunning: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
  },
  cardComplete: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  cardError: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 22, width: 28 },
  headerText: { flex: 1 },
  name: { fontWeight: '700', fontSize: 15 },
  role: { color: '#64748B', fontSize: 11, marginTop: 2 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#2D2D44',
  },
  badgeDone: { backgroundColor: 'rgba(16, 185, 129, 0.15)' },
  badgeError: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  badgePending: { backgroundColor: '#1A1A24' },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#94A3B8', letterSpacing: 0.5 },
  body: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1F1F2E' },
  reasoningLabel: { color: '#64748B', marginBottom: 4, textTransform: 'uppercase', fontSize: 10 },
  reasoning: { color: '#CBD5E1', fontSize: 13, lineHeight: 19, marginBottom: 10 },
  outputLabel: { color: '#64748B', marginBottom: 4, textTransform: 'uppercase', fontSize: 10 },
  output: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
});
