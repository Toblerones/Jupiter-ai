'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import Sidebar from '@/components/Sidebar';
import PhaseBar from '@/components/PhaseBar';
import GateReport from '@/components/GateReport';
import LiveLog from '@/components/LiveLog';
import type { WorkspaceState } from '@/lib/types';

export default function Dashboard() {
  const [state, setState] = useState<WorkspaceState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [live, setLive] = useState(false);

  // Keep a ref so the SSE callback always reads the current activeId
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  const fetchState = useCallback(async (id: string | null) => {
    const url = id ? `/api/workspace?initiative=${encodeURIComponent(id)}` : '/api/workspace';
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data: WorkspaceState = await res.json();
      setState(data);
      // Auto-select on first load
      if (!id && data.activeInitiative) {
        setActiveId(data.activeInitiative.initiative.id);
      }
    } catch {}
  }, []);

  // SSE connection — runs once, uses ref to stay current on activeId
  useEffect(() => {
    fetchState(null);

    const es = new EventSource('/api/stream');
    es.onopen  = () => setLive(true);
    es.onerror = () => setLive(false);
    es.onmessage = () => fetchState(activeIdRef.current);

    return () => es.close();
  }, [fetchState]);

  // Refetch when user switches initiative
  useEffect(() => {
    if (activeId) fetchState(activeId);
  }, [activeId, fetchState]);

  const ini = state?.activeInitiative ?? null;

  return (
    <div className="shell">
      <TopBar project={state?.project ?? null} initiative={ini} live={live} />

      <Sidebar
        initiatives={state?.initiatives ?? []}
        activeId={activeId}
        onSelect={setActiveId}
      />

      <main className="main">
        <PhaseBar phases={ini?.phases ?? null} />
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
            <GateReport report={state.gateReport} />
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
