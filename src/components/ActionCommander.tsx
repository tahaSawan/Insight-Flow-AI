import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Check, MessageSquare, Mail, Building2, LayoutDashboard } from 'lucide-react-native';
import { colors, spacing, radius } from '@/constants/designTokens';
import { SuccessFlash } from '@/components/SuccessFlash';
import { hapticLight, hapticMedium, hapticSuccess } from '@/utils/haptics';
import { Button } from '@/components/Button';
import { Typography } from '@/components/Typography';
import { ProgressBar } from '@/components/ProgressBar';
import { BeforeAfterOutcome } from '@/components/BeforeAfterOutcome';
import { UI } from '@/constants/plainLanguage';
import { useAppContext } from '@/context/AppContext';
import { scaleDemoMs } from '@/utils/demoPresentation';
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
    dashboard: { label: 'Dashboard', header: 'Executive KPI board', accent: colors.accent },
  } satisfies Record<ActionChannel, { label: string; header: string; accent: string }>;
}

const CHANNEL_ICONS = {
  slack: MessageSquare,
  email: Mail,
  crm: Building2,
  dashboard: LayoutDashboard,
} as const;

export function ActionCommander({ results }: ActionCommanderProps) {
  const { demoMode, industry, setDemoActionExecuted } = useAppContext();
  const channelMeta = useMemo(() => getChannelMeta(industry), [industry]);
  const actions = results.simulatedActions;
  const stepMs = scaleDemoMs(1600, demoMode);

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
    void hapticLight();
    setApproved((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const runPlan = useCallback(async () => {
    if (!canRun) return;
    void hapticMedium();
    setPhase('running');
    setCompleted(actions.map(() => false));
    setRunProgress(0);

    for (let step = 0; step < approvedIndices.length; step++) {
      const i = approvedIndices[step];
      setCurrentIndex(i);
      setRunProgress(((step + 0.3) / approvedIndices.length) * 100);
      void hapticLight();
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
    setDemoActionExecuted(true);
    void hapticSuccess();
  }, [actions, approvedIndices, canRun, stepMs, setDemoActionExecuted]);

  const reset = () => {
    setPhase('idle');
    setCurrentIndex(-1);
    setRunProgress(0);
    setCompleted(actions.map(() => false));
    setDemoActionExecuted(false);
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
        {UI.results.executeHint}
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
            ? UI.results.executing
            : phase === 'done'
              ? UI.results.executeAgain
              : UI.results.executeAction
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
        isLoading={phase === 'running'}
        fullWidth
        style={styles.runBtn}
      />

      {phase === 'done' ? (
        <>
          <SuccessFlash message={UI.results.executeDone(approvedIndices.length)} />
          <BeforeAfterOutcome results={results} />
        </>
      ) : null}
    </View>
  );
}

function getIconBgColor(channel: ActionChannel, approved: boolean) {
  if (!approved) return 'rgba(71, 85, 105, 0.08)'; // Grayed out if skipped
  switch (channel) {
    case 'slack': return 'rgba(168, 85, 247, 0.12)'; // Purple/Slack theme
    case 'email': return 'rgba(59, 130, 246, 0.12)'; // Blue theme
    case 'crm': return 'rgba(14, 165, 233, 0.12)'; // Sky blue theme
    case 'dashboard': return 'rgba(236, 72, 153, 0.12)'; // Pink/Magenta theme
    default: return 'rgba(168, 85, 247, 0.12)';
  }
}

function getIconBorderColor(channel: ActionChannel, approved: boolean) {
  if (!approved) return 'rgba(71, 85, 105, 0.25)';
  switch (channel) {
    case 'slack': return 'rgba(168, 85, 247, 0.35)';
    case 'email': return 'rgba(59, 130, 246, 0.35)';
    case 'crm': return 'rgba(14, 165, 233, 0.35)';
    case 'dashboard': return 'rgba(236, 72, 153, 0.35)';
    default: return 'rgba(168, 85, 247, 0.35)';
  }
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
  const ChannelIcon = CHANNEL_ICONS[channel];

  return (
    <View style={[styles.row, isActive && styles.rowActive, isDone && styles.rowDone]}>
      <View style={styles.rowHeader}>
        {selectable ? (
          <Pressable
            onPress={onToggleApprove}
            style={({ pressed }) => [
              styles.checkbox,
              approved && styles.checkboxOn,
              pressed && styles.pressed,
            ]}
          >
            {approved ? <Check size={18} color="#FFF" /> : null}
          </Pressable>
        ) : null}

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: getIconBgColor(channel, approved),
              borderColor: getIconBorderColor(channel, approved),
            },
          ]}
        >
          <ChannelIcon size={20} color={approved ? ch.accent : colors.textMuted} />
        </View>

        <View style={styles.rowBody}>
          <View style={styles.channelPill}>
            <Typography style={[styles.channelLabel, { color: ch.accent }]}>
              {ch.label}
            </Typography>
          </View>
          <Typography style={[styles.title, !approved && styles.titleMuted]}>
            {action.title}
          </Typography>
          <Typography variant="caption" style={!approved ? styles.descMuted : styles.desc}>
            {action.description}
          </Typography>
        </View>
        <Typography style={[styles.status, isDone && styles.statusDone, !approved && styles.statusMuted]}>
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
  wrap: { gap: spacing.sm },
  progressWrap: { marginBottom: spacing.sm, gap: 6 },
  progressLabel: { color: colors.accentText, textAlign: 'center' },
  approveHint: { color: colors.textMuted, textAlign: 'center', marginBottom: 4, lineHeight: 18 },
  runBtn: { paddingVertical: 16, marginTop: 4 },
  pressed: { opacity: 0.85 },
  row: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowActive: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentSoft,
  },
  rowDone: { borderColor: 'rgba(16, 185, 129, 0.35)' },
  rowHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  rowBody: { flex: 1 },
  channelPill: {
    alignSelf: 'flex-start',
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: colors.bg,
  },
  channelLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  title: { fontWeight: '700', marginBottom: 3, fontSize: 15, color: colors.text },
  titleMuted: { color: colors.textMuted },
  desc: { color: colors.textSecondary },
  descMuted: { color: colors.textMuted },
  status: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5, marginTop: 6 },
  statusDone: { color: colors.accentSecondary },
  statusMuted: { color: colors.textDim },
  mockCard: {
    marginTop: 10,
    padding: 12,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    borderLeftWidth: 3,
  },
  mockChannel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', marginBottom: 6 },
  mockBody: { color: colors.text, fontSize: 13, lineHeight: 19 },
});
