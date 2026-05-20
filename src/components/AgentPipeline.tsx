import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Typography } from '@/components/Typography';
import { AGENT_PIPELINE } from '@/constants/agents';
import type { AgentTraceEntry } from '@/types/agents';
import { colors, radius, spacing } from '@/constants/designTokens';

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
          <AgentCard
            key={agent.id}
            isRunning={isRunning}
            isComplete={isComplete}
            isError={isError}
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
          </AgentCard>
        );
      })}
    </View>
  );
}

function AgentCard({
  children,
  isRunning,
  isComplete,
  isError,
}: {
  children: React.ReactNode;
  isRunning: boolean;
  isComplete: boolean;
  isError: boolean;
}) {
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isRunning || isComplete) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isRunning, isComplete, opacity]);

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity },
        isRunning && styles.cardRunning,
        isComplete && styles.cardComplete,
        isError && styles.cardError,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRunning: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentMuted,
  },
  cardComplete: {
    borderColor: 'rgba(52, 211, 153, 0.35)',
    backgroundColor: colors.successSoft,
  },
  cardError: {
    borderColor: 'rgba(248, 113, 113, 0.4)',
    backgroundColor: colors.dangerSoft,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 22, width: 28 },
  headerText: { flex: 1 },
  name: { fontWeight: '700', fontSize: 17 },
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
