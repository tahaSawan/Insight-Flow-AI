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
    name: 'Reader',
    role: 'Reads your document and checks what type it is',
    icon: '📥',
    color: '#60A5FA',
  },
  {
    id: 'insight',
    name: 'Main Points',
    role: 'Finds the most important ideas',
    icon: '💡',
    color: '#6366F1',
  },
  {
    id: 'risk',
    name: 'Problems',
    role: 'Spots what could go wrong',
    icon: '⚠️',
    color: '#F59E0B',
  },
  {
    id: 'action',
    name: 'Next Steps',
    role: 'Suggests what to do about it',
    icon: '🎯',
    color: '#10B981',
  },
  {
    id: 'execution',
    name: 'Results',
    role: 'Shows a simple before-and-after picture',
    icon: '⚡',
    color: '#A855F7',
  },
];

export function getAgentDefinition(id: AgentId) {
  return AGENT_PIPELINE.find((a) => a.id === id)!;
}
