import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Vibration, Platform, Pressable } from 'react-native';
import { Check } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import { useAppContext } from '@/context/AppContext';
import type {
  AnalysisResult,
  SimulatedAction,
  ActionChannel,
  IndustryType,
} from '@/types/analysis';

interface ActionCommanderProps {
  results: AnalysisResult;
}

function getChannelMeta(industry: IndustryType) {
  const slackChannel =
    industry === 'finance'
      ? '#finance-risk'
      : industry === 'healthcare'
        ? '#patient-ops'
        : industry === 'technology'
          ? '#eng-incidents'
          : '#ops-alerts';

  return {
    slack: { label: 'Slack', header: slackChannel, accent: '#4A154B' },
    email: { label: 'Email', header: 'To: leadership@company.com', accent: '#2563EB' },
    crm: {
      label: 'CRM',
      header: industry === 'finance' ? 'HubSpot · Deal risk' : 'Salesforce · Account',
      accent: '#00A1E0',
    },
    dashboard: { label: 'Dashboard', header: 'Executive KPI board', accent: '#6366F1' },
  } satisfies Record<ActionChannel, { label: string; header: string; accent: string }>;
}

function pulse() {
  if (Platform.OS !== 'web') Vibration.vibrate(40);
}

export function ActionCommander({ results }: ActionCommanderProps) {
  const { demoMode, industry } = useAppContext();
  const channelMeta = useMemo(() => getChannelMeta(industry), [industry]);
  const actions = results.simulatedActions;
  const stepMs = demoMode ? 700 : 1600;

  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [runProgress, setRunProgress] = useState(0);
  const [approved, setApproved] = useState<boolean[]>(() => actions.map(() => true));
  const [completed, setCompleted] = useState<boolean[]>(() => actions.map(() => false));

  const approvedIndices = approved
    .map((ok, i) => (ok ? i : -1))
    .filter((i) => i >= 0);
  const canRun = approvedIndices.length > 0;

  const toggleApproved = (index: number) => {
    if (phase === 'running') return;
    setApproved((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const runPlan = useCallback(async () => {
    if (!canRun) return;
    setPhase('running');
    setCompleted(actions.map(() => false));
    setRunProgress(0);

    for (let step = 0; step < approvedIndices.length; step++) {
      const i = approvedIndices[step];
      setCurrentIndex(i);
      setRunProgress(((step + 0.3) / approvedIndices.length) * 100);
      pulse();
      await new Promise((r) => setTimeout(r, stepMs));
      setCompleted((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
      setRunProgress(((step + 1) / approvedIndices.length) * 100);
    }

    setCurrentIndex(-1);
    setPhase('done');
    setRunProgress(100);
    pulse();
  }, [actions, approvedIndices, canRun, stepMs]);

  const reset = () => {
    setPhase('idle');
    setCurrentIndex(-1);
    setRunProgress(0);
    setCompleted(actions.map(() => false));
  };

  return (
    <View style={styles.wrap}>
      {phase === 'running' ? (
        <View style={styles.progressWrap}>
          <Typography variant="caption" style={styles.progressLabel}>
            Executing approved actions…
          </Typography>
          <ProgressBar progress={runProgress} />
        </View>
      ) : null}

      <Typography variant="caption" style={styles.approveHint}>
        Approve the actions you want, then run the live demo.
      </Typography>

      {actions.map((action, index) => (
        <ActionRow
          key={`cmd-${index}`}
          action={action}
          index={index}
          meta={channelMeta}
          isActive={currentIndex === index}
          isDone={completed[index]}
          approved={approved[index]}
          onToggleApprove={() => toggleApproved(index)}
          selectable={phase === 'idle'}
        />
      ))}

      <Button
        title={
          phase === 'running'
            ? 'Running…'
            : phase === 'done'
              ? 'Run again (demo)'
              : `Execute ${approvedIndices.length} approved action${approvedIndices.length === 1 ? '' : 's'}`
        }
        onPress={() => {
          if (phase === 'done') {
            reset();
            setTimeout(() => runPlan(), 80);
          } else {
            runPlan();
          }
        }}
        disabled={phase === 'running' || (phase === 'idle' && !canRun)}
        style={styles.runBtn}
      />

      {demoMode && phase === 'idle' ? (
        <Typography variant="caption" style={styles.demoNote}>
          Demo mode on — faster execution for live pitches
        </Typography>
      ) : null}

      {phase === 'done' ? (
        <View style={styles.doneBanner}>
          <Typography style={styles.doneText}>
            {approvedIndices.length} action(s) executed (demo) · New state → {results.afterMetric}{' '}
            {results.impactMetricLabel}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

function ActionRow({
  action,
  index,
  meta,
  isActive,
  isDone,
  approved,
  onToggleApprove,
  selectable,
}: {
  action: SimulatedAction;
  index: number;
  meta: ReturnType<typeof getChannelMeta>;
  isActive: boolean;
  isDone: boolean;
  approved: boolean;
  onToggleApprove: () => void;
  selectable: boolean;
}) {
  const channel = action.channel || (['slack', 'email', 'crm'] as const)[index] || 'dashboard';
  const ch = meta[channel];

  return (
    <View style={[styles.row, isActive && styles.rowActive, isDone && styles.rowDone]}>
      <View style={styles.rowHeader}>
        {selectable ? (
          <Pressable
            onPress={onToggleApprove}
            style={[styles.checkbox, approved && styles.checkboxOn]}
          >
            {approved ? <Check size={14} color="#FFF" /> : null}
          </Pressable>
        ) : null}
        <Typography style={styles.icon}>{action.icon}</Typography>
        <View style={styles.rowBody}>
          <Typography style={styles.title}>{action.title}</Typography>
          <Typography variant="caption">{action.description}</Typography>
        </View>
        <Typography style={[styles.status, isDone && styles.statusDone]}>
          {isDone ? 'SENT' : isActive ? '···' : approved ? 'READY' : 'SKIP'}
        </Typography>
      </View>

      {(isActive || isDone) && approved ? (
        <View style={[styles.mockCard, { borderLeftColor: ch.accent }]}>
          <Typography style={styles.mockChannel}>
            {ch.label} · {ch.header}
          </Typography>
          <Typography style={styles.mockBody}>
            {action.notificationPreview || action.description}
          </Typography>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  progressWrap: { marginBottom: 8, gap: 6 },
  progressLabel: { color: '#A5B4FC', textAlign: 'center' },
  approveHint: { color: '#64748B', textAlign: 'center', marginBottom: 4, lineHeight: 18 },
  runBtn: { paddingVertical: 16, marginTop: 4 },
  demoNote: { color: '#818CF8', textAlign: 'center' },
  row: {
    backgroundColor: '#1A1A24',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  rowActive: {
    borderColor: 'rgba(99, 102, 241, 0.6)',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  rowDone: { borderColor: 'rgba(16, 185, 129, 0.35)' },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: '#6366F1', borderColor: '#6366F1' },
  icon: { fontSize: 20, width: 26 },
  rowBody: { flex: 1 },
  title: { fontWeight: '600', marginBottom: 2, fontSize: 15 },
  status: { fontSize: 10, fontWeight: '800', color: '#64748B', letterSpacing: 0.5 },
  statusDone: { color: '#10B981' },
  mockCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  mockChannel: { fontSize: 11, color: '#94A3B8', fontWeight: '600', marginBottom: 6 },
  mockBody: { color: '#E2E8F0', fontSize: 13, lineHeight: 19 },
  doneBanner: {
    marginTop: 4,
    padding: 14,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  doneText: { color: '#6EE7B7', fontSize: 14, lineHeight: 20, fontWeight: '600' },
});
