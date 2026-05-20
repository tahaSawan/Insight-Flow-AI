import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  MessageSquare,
  TrendingUp,
  ShieldAlert,
  CircleDollarSign,
  Gavel,
} from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Typography } from '@/components/Typography';
import { UI } from '@/constants/plainLanguage';
import { colors, featureSection } from '@/constants/designTokens';
import type { AnalysisResult, AgentDebateViewpoint } from '@/types/analysis';
import { getAgentDebate } from '@/utils/agentDebate';

interface AIDebateModeProps {
  results: AnalysisResult;
}

type AgentKey = 'growth' | 'risk' | 'finance';

const AGENT_UI: Record<
  AgentKey,
  {
    label: string;
    hint: string;
    color: string;
    bg: string;
    border: string;
    Icon: typeof TrendingUp;
  }
> = {
  growth: {
    label: UI.results.growthAgent,
    hint: UI.results.growthAgentHint,
    color: colors.accentSecondary,
    bg: colors.accentSecondarySoft,
    border: 'rgba(16, 185, 129, 0.35)',
    Icon: TrendingUp,
  },
  risk: {
    label: UI.results.riskAgent,
    hint: UI.results.riskAgentHint,
    color: colors.warning,
    bg: colors.warningSoft,
    border: 'rgba(245, 158, 11, 0.35)',
    Icon: ShieldAlert,
  },
  finance: {
    label: UI.results.financeAgent,
    hint: UI.results.financeAgentHint,
    color: colors.accent,
    bg: colors.accentSoft,
    border: colors.borderAccent,
    Icon: CircleDollarSign,
  },
};

function AgentViewpointCard({
  agentKey,
  viewpoint,
}: {
  agentKey: AgentKey;
  viewpoint: AgentDebateViewpoint;
}) {
  const meta = AGENT_UI[agentKey];
  const Icon = meta.Icon;

  return (
    <View
      style={[
        styles.agentCard,
        { backgroundColor: meta.bg, borderColor: meta.border },
      ]}
    >
      <View style={styles.agentHead}>
        <View style={styles.agentTitleBlock}>
          <Icon size={16} color={meta.color} style={styles.agentIcon} />
          <View style={styles.agentTitles}>
            <Typography style={[styles.agentName, { color: meta.color }]}>
              {meta.label}
            </Typography>
            <Typography variant="caption" style={styles.agentHint}>
              {meta.hint}
            </Typography>
          </View>
        </View>
        <Typography style={[styles.confidenceText, { color: meta.color }]}>
          {UI.results.debateConfidence(viewpoint.confidence)}
        </Typography>
      </View>

      <View style={styles.confidenceTrack}>
        <View
          style={[
            styles.confidenceFill,
            {
              width: `${viewpoint.confidence}%`,
              backgroundColor: meta.color,
            },
          ]}
        />
      </View>

      <View style={styles.fieldBlock}>
        <Typography style={styles.fieldLabel}>{UI.results.debateApproach}</Typography>
        <Typography style={styles.fieldBody}>{viewpoint.recommendedApproach}</Typography>
      </View>

      <View style={styles.fieldBlock}>
        <Typography style={[styles.fieldLabel, styles.concernLabel]}>
          {UI.results.debateConcern}
        </Typography>
        <Typography style={styles.fieldBody}>{viewpoint.concern}</Typography>
      </View>
    </View>
  );
}

export function AIDebateMode({ results }: AIDebateModeProps) {
  const { debate, fromAi } = useMemo(() => getAgentDebate(results), [results]);

  return (
    <Card
      style={featureSection}
      icon={<MessageSquare size={18} color={colors.accent} />}
      title={UI.results.debateTitle}
      subtitle={`${UI.results.debateHint}${fromAi ? '' : ` (${UI.results.debateBadgeLocal})`}`}
    >

      <View style={styles.agentsList}>
        <AgentViewpointCard agentKey="growth" viewpoint={debate.growth} />
        <AgentViewpointCard agentKey="risk" viewpoint={debate.risk} />
        <AgentViewpointCard agentKey="finance" viewpoint={debate.finance} />
      </View>

      <View style={styles.finalCard}>
        <View style={styles.finalHead}>
          <Gavel size={16} color={colors.accent} />
          <Typography style={styles.finalTitle}>{UI.results.debateFinalTitle}</Typography>
        </View>
        <Typography style={styles.finalConclusion}>{debate.finalConclusion}</Typography>
        <Typography style={styles.finalWhyLabel}>{UI.results.debateFinalWhy}</Typography>
        <Typography variant="caption" style={styles.finalWhyBody}>
          {debate.balanceExplanation}
        </Typography>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
    fontSize: 12,
  },
  agentsList: {
    gap: 12,
    marginBottom: 14,
  },
  agentCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  agentHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  agentTitleBlock: {
    flexDirection: 'row',
    flex: 1,
    paddingRight: 8,
  },
  agentIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  agentTitles: {
    flex: 1,
  },
  agentName: {
    fontSize: 14,
    fontWeight: '800',
  },
  agentHint: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 2,
    lineHeight: 14,
  },
  confidenceText: {
    fontSize: 11,
    fontWeight: '800',
  },
  confidenceTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 2,
  },
  fieldBlock: {
    marginBottom: 8,
  },
  fieldLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  concernLabel: {
    color: colors.danger,
  },
  fieldBody: {
    color: colors.text,
    fontSize: 12.5,
    lineHeight: 18,
  },
  finalCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentSoft,
    padding: 14,
  },
  finalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  finalTitle: {
    color: colors.accentText,
    fontSize: 13,
    fontWeight: '800',
  },
  finalConclusion: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 10,
  },
  finalWhyLabel: {
    color: colors.accentText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  finalWhyBody: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
});
