'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import PhaseBar from '@/components/PhaseBar';
import GateReport from '@/components/GateReport';
import ArtifactView from '@/components/ArtifactView';
import LiveLog from '@/components/LiveLog';
import type { Initiative, WorkspaceState } from '@/lib/types';

function computeCurrentPhase(phases: Initiative['phases'] | null | undefined): string {
  if (!phases) return 'intent';
  if (!phases.intent || phases.intent.status !== 'complete') return 'intent';
  if (!phases.requirements || phases.requirements.status !== 'complete') return 'requirements';
  return 'design';
}

export default function Dashboard() {
  const [state, setState] = useState<WorkspaceState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  // Refs so SSE callback always reads current values without stale closures
  const activeIdRef = useRef<string | null>(null);
  const selectedPhaseRef = useRef<string | null>(null);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);
  useEffect(() => { selectedPhaseRef.current = selectedPhase; }, [selectedPhase]);

  const fetchState = useCallback(async (id: string | null, phase: string | null) => {
    let url = id ? `/api/workspace?initiative=${encodeURIComponent(id)}` : '/api/workspace';
    if (phase) url += `&phase=${encodeURIComponent(phase)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data: WorkspaceState = await res.json();
      setState(data);
      if (!id && data.activeInitiative) {
        setActiveId(data.activeInitiative.initiative.id);
      }
    } catch {}
  }, []);

  // Initial fetch + SSE connection (runs once)
  useEffect(() => {
    fetchState(null, null);
    const es = new EventSource('/api/stream');
    es.onopen  = () => setLive(true);
    es.onerror = () => setLive(false);
    es.onmessage = () => fetchState(activeIdRef.current, selectedPhaseRef.current);
    return () => es.close();
  }, [fetchState]);

  // Refetch when initiative or selected phase changes
  useEffect(() => {
    if (activeId) fetchState(activeId, selectedPhase);
  }, [activeId, selectedPhase, fetchState]);

  // Reset selected phase when switching initiative
  const handleSelectInitiative = useCallback((id: string) => {
    setSelectedPhase(null);
    setActiveId(id);
  }, []);

  const ini = state?.activeInitiative ?? null;
  const displayedPhase = state?.gateReport?.phase ?? (ini ? computeCurrentPhase(ini.phases) : null);

  return (
    <div className="shell">
      <TopBar project={state?.project ?? null} initiative={ini} live={live} />

      <Sidebar
        initiatives={state?.initiatives ?? []}
        activeId={activeId}
        onSelect={handleSelectInitiative}
        contextFiles={state?.contextFiles ?? []}
      />

      <main className="main">
        <PhaseBar
          phases={ini?.phases ?? null}
          displayedPhase={displayedPhase}
          onPhaseSelect={setSelectedPhase}
        />
        <div className="main-body">
          {!ini ? (
            <div className="empty-state">
              <div className="empty-title">No active initiative</div>
              <div className="empty-sub">
                Run <code>/jupiter:init</code> to set up a workspace, then{' '}
                <code>/jupiter:iterate</code> to begin.
              </div>
            </div>
          ) : !state?.gateReport ? (
            <div className="empty-state">
              <div className="empty-title">{ini.initiative.title}</div>
              <div className="empty-sub">
                No gate report yet — run <code>/jupiter:iterate</code> to produce the first iteration.
              </div>
            </div>
          ) : (
            <>
              <GateReport report={state.gateReport} />
              {state.artifact && <ArtifactView artifact={state.artifact} />}
            </>
          )}
        </div>
      </main>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-title">Activity log</span>
          {state?.recentLog.length ? (
            <span className="chip">{state.recentLog.length} events</span>
          ) : null}
        </div>
        <div className="panel-body">
          <LiveLog events={state?.recentLog ?? []} />
        </div>
      </div>
    </div>
  );
}
