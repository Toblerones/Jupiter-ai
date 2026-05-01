export interface PhaseState {
  status: 'not_started' | 'in_progress' | 'ready_for_review' | 'complete' | 'blocked' | 'budget_expired';
  iteration_count: number;
  gate_result: {
    auto_pass: boolean;
    ai_pass: boolean;
    gap: number;
    status: string;
  } | null;
  artifact: string;
}

export interface Initiative {
  initiative: {
    id: string;
    title: string;
    profile: string;
    status: string;
    created: string;
  };
  phases: {
    intent: PhaseState;
    requirements: PhaseState;
    design: PhaseState & {
      sub_phase: 'component_map' | 'sad';
      human_gate_status: Record<string, string>;
    };
  };
}

export interface CheckFinding {
  id: string;
  name: string;
  reason: string;
}

export interface GateReport {
  initiative: string;
  phase: string;
  sub_phase: string | null;
  iteration: number;
  ts: string;
  gap: number;
  status: 'looping' | 'ready_for_review' | 'blocked';
  auto_checks: {
    total: number;
    passing: number;
    failing: CheckFinding[];
  };
  ai_checks: {
    total: number;
    passing: number;
    failing: CheckFinding[];
  };
  human_gate: string;
  narrative: string;
  source_findings: Array<{
    finding: string;
    disposition: 'resolve_with_assumption' | 'flag' | 'block';
    rationale: string;
  }>;
}

export interface LogEvent {
  event: string;
  ts: string;
  initiative?: string;
  phase?: string;
  sub_phase?: string | null;
  iteration?: number;
  gap?: number;
  status?: string;
  failing_checks?: string[];
}

export interface Project {
  id: string;
  name: string;
  business_owner: string;
  lead_architect: string;
  profile: string;
  created: string;
}

export interface ContextFile {
  category: string;
  name: string;
}

export interface ArtifactContent {
  path: string;
  content: string;
}

export interface WorkspaceState {
  project: Project | null;
  initiatives: Initiative[];
  activeInitiative: Initiative | null;
  gateReport: GateReport | null;
  recentLog: LogEvent[];
  contextFiles: ContextFile[];
  artifact: ArtifactContent | null;
}
