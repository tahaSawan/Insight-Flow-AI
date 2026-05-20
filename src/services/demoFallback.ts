import { CINEMATIC_WORKFLOW } from '@/constants/workflowAgents';
import type { AgentTraceEntry } from '@/types/agents';
import type { AnalysisResult, IndustryType, UseCaseType } from '@/types/analysis';

function buildCompletedTrace(): AgentTraceEntry[] {
  const now = new Date().toISOString();
  const summaries = [
    'Lahore sales −18% · fuel +22% · complaints +41%',
    'Revenue drop tied to fuel cost and service failures',
    'High urgency — shelf-space threats before Ramadan',
    '14-day recovery: fleet, stock, complaint war-room',
    'Recovery plan simulated across Slack, email, CRM',
  ];

  return CINEMATIC_WORKFLOW.map((step, index) => ({
    agentId: step.id,
    agentName: step.name,
    status: 'complete' as const,
    reasoning: step.description,
    outputSummary: summaries[index] ?? 'Complete',
    startedAt: now,
    completedAt: now,
  }));
}

/** Polished offline storyline when Gemini is unavailable during a live demo. */
export function buildWinningDemoFallbackResult(
  _documentText?: string,
  _industry: IndustryType = 'general',
  _useCase: UseCaseType = 'crisis',
): AnalysisResult {
  return {
    executiveSummary:
      'Lahore sales fell 18% as fuel costs jumped 22% and customer complaints rose 41%. Out-of-stock staples and late deliveries are pushing key retailers to cut shelf space before Ramadan.',
    urgencyHeadline: 'Lahore sales down 18% — complaints and fuel costs spiking',
    stakeAtRisk: 'PKR 42M weekly revenue · 3 anchor retailers at risk',
    doNothingOutlook:
      'If nothing changes in 14 days, Lahore could miss Ramadan target by 9–12% and lose shelf space at three anchor stores.',
    doActionOutlook:
      'A focused 14-day recovery on stock, fleet routing, and complaint response can stabilize sales and protect retailer relationships.',
    riskScore: 84,
    confidence: 91,
    priorityLevel: 'High',
    estimatedImpact:
      'Continued decline could trigger regional churn and permanent shelf-space loss in Lahore within one month.',
    keyFindings: [
      'Lahore territory sales declined 18% week-over-week with visits down 14%.',
      'Fuel prices rose 22%, adding PKR 4,200 per delivery run and squeezing promo margins.',
      'Helpline complaints jumped 41% — late delivery, stockouts, and staff conduct dominate.',
    ],
    riskAssessment: [
      'Six of nine dark stores are out of rice and edible oil during peak demand.',
      'GreenMart’s fuel-linked delivery discount is pulling share in Gulberg and DHA.',
      'Three anchor retailers may reduce shelf space before Ramadan if service does not improve.',
    ],
    recommendedActions: [
      'Launch a 14-day Lahore recovery war-room with daily stock and complaint KPIs.',
      'Re-route delivery fleet to cut fuel cost per run and hit same-day SLA in hot zones.',
      'Deploy complaint SWAT team with retailer callbacks and Ramadan-ready stock buffer.',
    ],
    impactMetricLabel: 'Weekly Lahore revenue',
    beforeMetric: 'PKR 42M (declining)',
    afterMetric: 'PKR 48M (stabilized)',
    simulatedActions: [
      {
        title: 'Open #lahore-recovery Slack channel',
        description: 'Alert regional leads and store managers with live KPI board.',
        icon: '💬',
        channel: 'slack',
        notificationPreview:
          'Lahore recovery war-room live — daily stock + complaint dashboard pinned.',
      },
      {
        title: 'Email retailer assurance plan',
        description: 'Send 14-day service commitments to three at-risk anchor accounts.',
        icon: '✉️',
        channel: 'email',
        notificationPreview:
          'Subject: Lahore service recovery — stock buffer + daily callbacks before Ramadan.',
      },
      {
        title: 'Update CRM Lahore accounts',
        description: 'Flag at-risk retailers and attach recovery owner + due dates.',
        icon: '📊',
        channel: 'crm',
        notificationPreview: '3 accounts tagged · recovery owner assigned · check-in in 48h',
      },
    ],
    executionLog: [
      'Reader parsed Lahore brief — sales, fuel, and complaint signals extracted',
      'Main points ranked revenue drop and service failure drivers',
      'Risk agent scored shelf-space and Ramadan timing as critical',
      'Decision agent selected 14-day recovery war-room as primary move',
      'Execution planner drafted Slack, email, and CRM demo actions',
      'Outcome model projects revenue stabilization within two weeks',
    ],
    agentTrace: buildCompletedTrace(),
    autonomousDecision: {
      primaryDecision:
        'Launch a 14-day Lahore recovery war-room with daily stock, fleet, and complaint KPIs',
      reason:
        'Sales, fuel, and complaint signals converge on service failure — a coordinated war-room addresses stock, routing, and retailer trust in one motion.',
      priorityLevel: 'High',
      expectedOutcome:
        'Stabilize weekly Lahore revenue, cut complaint backlog 30%, and secure anchor shelf space before Ramadan.',
      confidence: 88,
    },
    agentDebate: {
      growth: {
        recommendedApproach: 'Aggressive promo bundles in Gulberg/DHA to win back visits.',
        concern: 'Margins are already crushed by fuel — blind discounting could worsen losses.',
        confidence: 62,
      },
      risk: {
        recommendedApproach: 'Prioritize stock buffer and complaint SWAT before any pricing plays.',
        concern: 'Retailer shelf-space threats need trust recovery within 14 days.',
        confidence: 91,
      },
      finance: {
        recommendedApproach: 'Re-route fleet first to lower PKR 4,200/run fuel drag before promos.',
        concern: 'Cash burn rises if delivery SLAs miss while promos run.',
        confidence: 78,
      },
      finalConclusion:
        'Launch the 14-day Lahore recovery war-room — balance fleet savings, stock buffer, and complaint response.',
      balanceExplanation:
        'Growth wants promos, Risk wants service recovery, Finance wants fleet savings — the war-room sequences all three without margin collapse.',
    },
  };
}
