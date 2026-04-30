import type { Initiative, Project } from '@/lib/types';

interface Props {
  project: Project | null;
  initiative: Initiative | null;
  live: boolean;
}

function statusChip(ini: Initiative | null): { label: string; cls: string } {
  if (!ini) return { label: 'no initiative', cls: '' };
  const s = ini.initiative.status;
  if (s === 'complete') return { label: 'complete', cls: 'green' };
  return { label: 'in progress', cls: 'amber' };
}

export default function TopBar({ project, initiative, live }: Props) {
  const { label, cls } = statusChip(initiative);

  return (
    <div className="topbar">
      <div className="logo">jupiter<span>/arc</span></div>
      <div className="vr" />
      <div className="tb-text">{project?.name ?? 'architecture governance'}</div>
      <div className="spacer" />
      <div className={`chip ${live ? 'green' : ''}`}>
        <div className="blink" />
        {live ? 'live' : 'connecting'}
      </div>
      {initiative && (
        <>
          <div className={`chip ${cls}`}>{initiative.initiative.id}</div>
          <div className="chip">{label}</div>
        </>
      )}
    </div>
  );
}
