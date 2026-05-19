export type AgentId = 'ingestion' | 'insight' | 'risk' | 'action' | 'execution';

export type AgentStatus = 'pending' | 'running' | 'complete' | 'error';

export interface AgentTraceEntry {
  agentId: AgentId;
  agentName: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  reasoning: string;
  outputSummary: string;
}

export interface OrchestratorProgress {
  currentAgentId: AgentId | null;
  completedCount: number;
  totalAgents: number;
  trace: AgentTraceEntry[];
}
