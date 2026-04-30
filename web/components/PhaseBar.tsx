import type { Initiative } from '@/lib/types';

interface Props {
  phases: Initiative['phases'] | null;
}

function phaseClass(status?: string): string {
  if (!status || status === 'not_started') return '';
  if (status === 'complete') return 'done';
  return 'active';
}

export default function PhaseBar({ phases }: Props) {
  if (!phases) return <div className="phase-bar" />;

  const intentCls = phaseClass(phases.intent?.status);
  const reqCls    = phaseClass(phases.requirements?.status);
  const desCls    = phaseClass(phases.design?.status);

  const designLabel = phases.design?.sub_phase === 'sad'
    ? 'Design · SAD + ADRs'
    : 'Design · Component Map';

  const iterLabel = (count?: number) =>
    count ? <span style={{ color: 'var(--text3)', fontSize: 9, marginLeft: 4 }}>iter {count}</span> : null;

  return (
    <div className="phase-bar">
      <div className={`ph ${intentCls}`}>
        <div className="ph-num">{intentCls === 'done' ? '✓' : '1'}</div>
        Intent
        {iterLabel(phases.intent?.iteration_count)}
      </div>
      <div className={`ph ${reqCls}`}>
        <div className="ph-num">{reqCls === 'done' ? '✓' : '2'}</div>
        Requirements
        {iterLabel(phases.requirements?.iteration_count)}
      </div>
      <div className={`ph ${desCls}`}>
        <div className="ph-num">{desCls === 'done' ? '✓' : '3'}</div>
        {designLabel}
        {iterLabel(phases.design?.iteration_count)}
      </div>
    </div>
  );
}
