import type { AgentId } from '@/types/agents';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  role: string;
  icon: string;
  color: string;
}

export const AGENT_PIPELINE: AgentDefinition[] = [
  {
    id: 'ingestion',
    name: 'Ingestion Agent',
    role: 'Parse and validate unstructured content',
    icon: '📥',
    color: '#60A5FA',
  },
  {
    id: 'insight',
    name: 'Insight Agent',
    role: 'Extract non-trivial patterns and key findings',
    icon: '💡',
    color: '#6366F1',
  },
  {
    id: 'risk',
    name: 'Risk Agent',
    role: 'Analyze implications and quantify exposure',
    icon: '⚠️',
    color: '#F59E0B',
  },
  {
    id: 'action',
    name: 'Action Agent',
    role: 'Generate domain-relevant recommendations',
    icon: '🎯',
    color: '#10B981',
  },
  {
    id: 'execution',
    name: 'Execution Agent',
    role: 'Simulate action execution and measure outcomes',
    icon: '⚡',
    color: '#A855F7',
  },
];

export function getAgentDefinition(id: AgentId) {
  return AGENT_PIPELINE.find((a) => a.id === id)!;
}
