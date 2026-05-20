import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Activity, Gauge, Target, Zap } from 'lucide-react-native';
import { Typography } from '@/components/Typography';
import { colors, radius, spacing } from '@/constants/designTokens';
import type { AnalysisResult } from '@/types/analysis';

interface HomeDashboardPreviewProps {
  results?: AnalysisResult | null;
}

const DEMO = {
  riskScore: 68,
  riskLabel: 'Elevated',
  confidence: 87,
  action: 'Deploy priority remediation plan',
  status: 'Agents ready',
};

function riskTone(score: number) {
  if (score >= 70) return { color: colors.danger, label: 'Critical' };
  if (score >= 45) return { color: colors.warning, label: 'Elevated' };
  return { color: colors.success, label: 'Moderate' };
}

function MetricRow({
  icon,
  label,
  value,
  valueColor = colors.text,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.metricRow}>
      <View style={styles.metricIcon}>{icon}</View>
      <View style={styles.metricBody}>
        <Typography variant="metricLabel">{label}</Typography>
        <Typography variant="metricValueSm" style={{ color: valueColor }} numberOfLines={1}>
          {value}
        </Typography>
        {children}
      </View>
    </View>
  );
}

export function HomeDashboardPreview({ results }: HomeDashboardPreviewProps) {
  const riskScore = results?.riskScore ?? DEMO.riskScore;
  const tone = riskTone(riskScore);
  const confidence = results?.confidence ?? DEMO.confidence;
  const action =
    results?.autonomousDecision?.primaryDecision ??
    results?.recommendedActions?.[0] ??
    DEMO.action;
  const status = results ? 'Pipeline active' : DEMO.status;

  const pulse = useSharedValue(1);
  const scan = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.35, { duration: 900, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
    scan.value = withRepeat(
      withTiming(1, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse, scan]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  const scanStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + scan.value * 0.45,
  }));

  const barWidth = `${Math.min(100, Math.max(0, confidence))}%` as `${number}%`;

  return (
    <View style={styles.shell}>
      <LinearGradient
        colors={[colors.accentSoft, 'transparent', colors.accentSecondarySoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.borderGlow}
      />
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.liveBadge}>
            <Animated.View style={[styles.liveDot, pulseStyle]} />
            <View style={styles.liveDotCore} />
            <Typography variant="badgeText" style={styles.liveText}>
              LIVE PREVIEW
            </Typography>
          </View>
          <Animated.View style={scanStyle}>
            <Typography variant="terminalHeader">Ops dashboard</Typography>
          </Animated.View>
        </View>

        <View style={styles.grid}>
          <MetricRow
            icon={<Gauge size={14} color={tone.color} />}
            label="Risk Level"
            value={`${riskScore} · ${tone.label}`}
            valueColor={tone.color}
          />
          <MetricRow
            icon={<Target size={14} color={colors.accent} />}
            label="Confidence"
            value={`${confidence}%`}
            valueColor={colors.accentText}
          >
            <View style={styles.barTrack}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.barFill, { width: barWidth }]}
              />
            </View>
          </MetricRow>
        </View>

        <View style={styles.actionBlock}>
          <MetricRow
            icon={<Zap size={14} color={colors.accentSecondary} />}
            label="Selected Action"
            value={action}
            valueColor={colors.text}
          />
        </View>

        <View style={styles.statusRow}>
          <Activity size={14} color={colors.success} />
          <Typography variant="metricLabel" style={styles.statusLabel}>
            System Status
          </Typography>
          <View style={styles.statusPill}>
            <Typography variant="badgeText" style={styles.statusValue}>
              {status}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.lg + 1,
    padding: 1,
    marginBottom: spacing.md,
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg + 1,
    opacity: 0.9,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    position: 'absolute',
    left: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveDotCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveText: {
    color: colors.accentText,
    marginLeft: 14,
    letterSpacing: 0.8,
  },
  headerMeta: {
    color: colors.textDim,
    fontFamily: 'monospace',
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBlock: {
    width: '100%',
  },
  metricRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    minWidth: 0,
  },
  metricIcon: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricBody: {
    flex: 1,
    minWidth: 0,
  },
  metricLabel: {
    color: colors.textDim,
    fontSize: 10,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.track,
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statusLabel: {
    color: colors.textMuted,
    flex: 1,
  },
  statusPill: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusValue: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '700',
  },
});
