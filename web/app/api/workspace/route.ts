import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import type { Initiative, GateReport, LogEvent, Project, WorkspaceState, ContextFile, ArtifactContent } from '@/lib/types';

const workspaceEnv = process.env.JUPITER_WORKSPACE_PATH ?? '../workspace';
const WORKSPACE = path.isAbsolute(workspaceEnv)
  ? workspaceEnv
  : path.resolve(process.cwd(), workspaceEnv);

const PROJECT_ROOT = path.dirname(WORKSPACE);

function readYaml<T>(filePath: string): T | null {
  try {
    return yaml.load(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function currentPhase(ini: Initiative): string {
  const { intent, requirements } = ini.phases;
  if (!intent || intent.status !== 'complete') return 'intent';
  if (!requirements || requirements.status !== 'complete') return 'requirements';
  return 'design';
}

export async function GET(req: NextRequest) {
  const requestedId    = req.nextUrl.searchParams.get('initiative');
  const requestedPhase = req.nextUrl.searchParams.get('phase');

  const projectYml = readYaml<{ project: Project }>(
    path.join(WORKSPACE, 'context', 'project.yml')
  );
  const project = projectYml?.project ?? null;

  const initiatives: Initiative[] = [];
  try {
    const dir = path.join(WORKSPACE, 'initiatives');
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.yml'))) {
      const ini = readYaml<Initiative>(path.join(dir, f));
      if (ini) initiatives.push(ini);
    }
  } catch {}

  let activeInitiative: Initiative | null = null;
  if (requestedId) {
    activeInitiative = initiatives.find(i => i.initiative.id === requestedId) ?? null;
  } else if (initiatives.length === 1) {
    activeInitiative = initiatives[0];
  } else if (initiatives.length > 1) {
    const logPath = path.join(WORKSPACE, 'log.jsonl');
    try {
      const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const ev = JSON.parse(lines[i]) as LogEvent;
          if (ev.initiative) {
            activeInitiative = initiatives.find(ini => ini.initiative.id === ev.initiative) ?? null;
            if (activeInitiative) break;
          }
        } catch {}
      }
    } catch {}
    if (!activeInitiative) activeInitiative = initiatives[0] ?? null;
  }

  let gateReport: GateReport | null = null;
  let artifact: ArtifactContent | null = null;

  if (activeInitiative) {
    const phase = requestedPhase ?? currentPhase(activeInitiative);

    gateReport = readJson<GateReport>(
      path.join(WORKSPACE, 'artifacts', 'gate-reports',
        `${activeInitiative.initiative.id}-${phase}-latest.json`)
    );

    // Read artifact content for the selected phase
    type PhaseKey = keyof typeof activeInitiative.phases;
    const phaseData = activeInitiative.phases[phase as PhaseKey] as { artifact?: string } | undefined;
    const artifactRelPath = phaseData?.artifact;
    if (artifactRelPath) {
      const fullPath = path.resolve(PROJECT_ROOT, artifactRelPath);
      // Security: only allow paths inside the workspace directory
      const safePrefix = WORKSPACE.endsWith(path.sep) ? WORKSPACE : WORKSPACE + path.sep;
      if (fullPath.startsWith(safePrefix) || fullPath === WORKSPACE) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          artifact = { path: artifactRelPath, content };
        } catch {}
      }
    }
  }

  // Scan context files
  const contextFiles: ContextFile[] = [];
  for (const cat of ['policy', 'standards', 'landscape', 'adrs', 'glossary']) {
    try {
      const catDir = path.join(WORKSPACE, 'context', cat);
      for (const f of fs.readdirSync(catDir).filter(f => !f.startsWith('.'))) {
        contextFiles.push({ category: cat, name: f });
      }
    } catch {}
  }

  const recentLog: LogEvent[] = [];
  try {
    const logPath = path.join(WORKSPACE, 'log.jsonl');
    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n').filter(Boolean);
    for (const line of lines.slice(-30).reverse()) {
      try { recentLog.push(JSON.parse(line) as LogEvent); } catch {}
    }
  } catch {}

  const state: WorkspaceState = {
    project, initiatives, activeInitiative, gateReport, recentLog, contextFiles, artifact,
  };
  return NextResponse.json(state);
}
