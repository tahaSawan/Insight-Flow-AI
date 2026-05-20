import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { ActivityIndicator } from 'react-native';
import { Check } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { CINEMATIC_WORKFLOW } from '@/constants/workflowAgents';
import type { AgentTraceEntry, AgentStatus } from '@/types/agents';
import { colors, radius, spacing } from '@/constants/designTokens';

interface AgentWorkflowTimelineProps {
  trace: AgentTraceEntry[];
}

function StepProgress({ status }: { status: AgentStatus }) {
  const pulse = useSharedValue(0.45);

  useEffect(() => {
    if (status !== 'running') return;
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [status, pulse]);

  const fillStyle = useAnimatedStyle(() => ({
    opacity: status === 'running' ? pulse.value : 1,
  }));

  return (
    <View style={styles.progressTrack}>
      {status === 'running' ? (
        <Animated.View style={[styles.progressFillWrap, styles.progressRunning, fillStyle]}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressFill}
          />
        </Animated.View>
      ) : status === 'complete' ? (
        <View style={[styles.progressFillWrap, styles.progressComplete]}>
          <LinearGradient
            colors={[colors.success, colors.successLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.progressFill}
          />
        </View>
      ) : null}
    </View>
  );
}

function TimelineStep({
  stepIndex,
  isLast,
  name,
  description,
  status,
  detail,
}: {
  stepIndex: number;
  isLast: boolean;
  name: string;
  description: string;
  status: AgentStatus;
  detail?: string;
}) {
  const pulse = useSharedValue(1);
  const isRunning = status === 'running';
  const isComplete = status === 'complete';
  const isError = status === 'error';

  useEffect(() => {
    if (!isRunning) {
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [isRunning, pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: isRunning ? 0.5 + (pulse.value - 1) * 3 : 0,
    transform: [{ scale: pulse.value }],
  }));

  const statusLabel =
    status === 'running'
      ? 'RUNNING'
      : status === 'complete'
        ? 'COMPLETE'
        : status === 'error'
          ? 'ERROR'
          : 'PENDING';

  const statusColor =
    status === 'running'
      ? colors.accentText
      : status === 'complete'
        ? colors.success
        : status === 'error'
          ? colors.danger
          : colors.textDim;

  return (
    <View style={styles.stepRow}>
      <View style={styles.railCol}>
        {isRunning ? (
          <Animated.View style={[styles.glowRing, glowStyle]} pointerEvents="none" />
        ) : null}
        <View
          style={[
            styles.node,
            isRunning && styles.nodeRunning,
            isComplete && styles.nodeComplete,
            isError && styles.nodeError,
            status === 'pending' && styles.nodePending,
          ]}
        >
          {isComplete ? (
            <Check size={12} color={colors.white} strokeWidth={3} />
          ) : isRunning ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Typography variant="badgeText" style={styles.nodeIndex}>
              {stepIndex + 1}
            </Typography>
          )}
        </View>
        {!isLast ? <View style={[styles.connector, isComplete && styles.connectorDone]} /> : null}
      </View>

      <View style={[styles.stepBody, isRunning && styles.stepBodyActive]}>
        <View style={styles.stepHeader}>
          <Typography variant="cardTitle" style={isRunning ? styles.stepNameActive : styles.stepName}>
            {name}
          </Typography>
          <Typography variant="badgeText" style={{ color: statusColor }}>
            {statusLabel}
          </Typography>
        </View>
        <Typography variant="caption" numberOfLines={2}>
          {detail || description}
        </Typography>
        <StepProgress status={status} />
      </View>
    </View>
  );
}

export function AgentWorkflowTimeline({ trace }: AgentWorkflowTimelineProps) {
  return (
    <View style={styles.timeline}>
      {CINEMATIC_WORKFLOW.map((step, index) => {
        const entry = trace.find((t) => t.agentId === step.id);
        const status = entry?.status ?? 'pending';
        const detail =
          status === 'pending'
            ? step.description
            : entry?.outputSummary
              ? entry.outputSummary
              : entry?.reasoning || step.description;

        return (
          <TimelineStep
            key={step.id}
            stepIndex={index}
            isLast={index === CINEMATIC_WORKFLOW.length - 1}
            name={step.name}
            description={step.description}
            status={status}
            detail={status !== 'pending' ? detail : undefined}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: {
    gap: 0,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 72,
  },
  railCol: {
    width: 32,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  glowRing: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceHighlight,
    zIndex: 2,
  },
  nodePending: {
    borderStyle: 'dashed',
    opacity: 0.65,
  },
  nodeRunning: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDeep,
  },
  nodeComplete: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  nodeError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger,
  },
  nodeIndex: {
    color: colors.textDim,
    fontSize: 9,
  },
  connector: {
    flex: 1,
    width: 2,
    minHeight: 28,
    backgroundColor: colors.track,
    marginVertical: 4,
  },
  connectorDone: {
    backgroundColor: colors.success,
    opacity: 0.5,
  },
  stepBody: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    minWidth: 0,
  },
  stepBodyActive: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentMuted,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: spacing.sm,
  },
  stepName: {
    flex: 1,
    color: colors.textSecondary,
  },
  stepNameActive: {
    color: colors.text,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  progressFillWrap: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressRunning: {
    width: '78%',
  },
  progressComplete: {
    width: '100%',
  },
  progressFill: {
    flex: 1,
    height: '100%',
  },
});
