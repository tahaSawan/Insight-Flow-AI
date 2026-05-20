import type { AgentId } from '@/types/agents';

export interface WorkflowStepDef {
  id: AgentId;
  name: string;
  description: string;
  logTag: string;
}

/** Cinematic labels for the analysis workflow timeline */
export const CINEMATIC_WORKFLOW: WorkflowStepDef[] = [
  {
    id: 'ingestion',
    name: 'Reader Agent',
    description: 'Ingests your document and extracts key signals',
    logTag: 'READER',
  },
  {
    id: 'insight',
    name: 'Main Points Agent',
    description: 'Surfaces the most important findings',
    logTag: 'INSIGHT',
  },
  {
    id: 'risk',
    name: 'Risk Agent',
    description: 'Scores threats and urgency drivers',
    logTag: 'RISK',
  },
  {
    id: 'action',
    name: 'Decision Agent',
    description: 'Recommends prioritized actions',
    logTag: 'DECISION',
  },
  {
    id: 'execution',
    name: 'Execution Planner',
    description: 'Simulates outcomes and execution paths',
    logTag: 'EXEC',
  },
];
