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
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.4)',
    Icon: TrendingUp,
  },
  risk: {
    label: UI.results.riskAgent,
    hint: UI.results.riskAgentHint,
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.4)',
    Icon: ShieldAlert,
  },
  finance: {
    label: UI.results.financeAgent,
    hint: UI.results.financeAgentHint,
    color: '#A855F7',
    bg: 'rgba(168, 85, 247, 0.1)',
    border: 'rgba(168, 85, 247, 0.4)',
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
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MessageSquare size={18} color="#C084FC" />
          <Typography variant="h3" style={styles.title}>
            {UI.results.debateTitle}
          </Typography>
        </View>
        <View style={styles.badge}>
          <Typography style={styles.badgeText}>
            {fromAi ? UI.results.debateBadgeAi : UI.results.debateBadgeLocal}
          </Typography>
        </View>
      </View>

      <Typography variant="caption" style={styles.subtitle}>
        {UI.results.debateHint}
      </Typography>

      <View style={styles.agentsList}>
        <AgentViewpointCard agentKey="growth" viewpoint={debate.growth} />
        <AgentViewpointCard agentKey="risk" viewpoint={debate.risk} />
        <AgentViewpointCard agentKey="finance" viewpoint={debate.finance} />
      </View>

      <View style={styles.finalCard}>
        <View style={styles.finalHead}>
          <Gavel size={16} color="#C084FC" />
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
  card: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.45)',
    backgroundColor: 'rgba(20, 10, 40, 0.45)',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: '#F3E8FF',
    fontSize: 16,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
  },
  badgeText: {
    color: '#C084FC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#94A3B8',
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
    color: '#64748B',
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
    color: '#F87171',
  },
  fieldBody: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 18,
  },
  finalCard: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(192, 132, 252, 0.55)',
    backgroundColor: 'rgba(192, 132, 252, 0.08)',
    padding: 14,
  },
  finalHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  finalTitle: {
    color: '#E9D5FF',
    fontSize: 13,
    fontWeight: '800',
  },
  finalConclusion: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 10,
  },
  finalWhyLabel: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  finalWhyBody: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
});
