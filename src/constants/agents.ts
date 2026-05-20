import type { AgentId } from '@/types/agents';
import { colors } from '@/constants/designTokens';

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
    color: colors.info,
  },
  {
    id: 'insight',
    name: 'Main Points',
    role: 'Finds the most important ideas',
    icon: '💡',
    color: colors.accent,
  },
  {
    id: 'risk',
    name: 'Problems',
    role: 'Spots what could go wrong',
    icon: '⚠️',
    color: colors.warning,
  },
  {
    id: 'action',
    name: 'Next Steps',
    role: 'Suggests what to do about it',
    icon: '🎯',
    color: colors.accentSecondary,
  },
  {
    id: 'execution',
    name: 'Results',
    role: 'Shows a simple before-and-after picture',
    icon: '⚡',
    color: colors.accentDeep,
  },
];

export function getAgentDefinition(id: AgentId) {
  return AGENT_PIPELINE.find((a) => a.id === id)!;
}
