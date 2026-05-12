import type { Initiative } from '@/lib/types';

interface Props {
  phases: Initiative['phases'] | null;
  displayedPhase: string | null;
  onPhaseSelect: (phase: string) => void;
}

function phaseClass(status?: string): string {
  if (!status || status === 'not_started') return '';
  if (status === 'complete') return 'done';
  return 'active';
}

function isAccessible(status?: string): boolean {
  return !!status && status !== 'not_started';
}

export default function PhaseBar({ phases, displayedPhase, onPhaseSelect }: Props) {
  if (!phases) return <div className="phase-bar" />;

  const intentCls = phaseClass(phases.intent?.status);
  const reqCls    = phaseClass(phases.requirements?.status);
  const desCls    = phaseClass(phases.design?.status);

  const designLabel = 'Design · SAD + ADRs';

  const iterLabel = (count?: number) =>
    count ? <span style={{ color: 'var(--text3)', fontSize: 10, marginLeft: 4 }}>iter {count}</span> : null;

  const renderPhase = (
    key: string,
    cls: string,
    num: number,
    label: string,
    iter?: number,
    status?: string,
  ) => {
    const accessible = isAccessible(status);
    const selected = displayedPhase === key;
    const classes = ['ph', cls, accessible ? 'clickable' : '', selected ? 'selected' : '']
      .filter(Boolean).join(' ');

    return (
      <div
        key={key}
        className={classes}
        onClick={() => accessible && onPhaseSelect(key)}
        title={accessible ? `View ${label}` : undefined}
      >
        <div className="ph-num">{cls === 'done' ? '✓' : num}</div>
        {label}
        {iterLabel(iter)}
      </div>
    );
  };

  return (
    <div className="phase-bar">
      {renderPhase('intent',       intentCls, 1, 'Intent',      phases.intent?.iteration_count,      phases.intent?.status)}
      {renderPhase('requirements', reqCls,    2, 'Requirements', phases.requirements?.iteration_count, phases.requirements?.status)}
      {renderPhase('design',       desCls,    3, designLabel,    phases.design?.iteration_count,       phases.design?.status)}
    </div>
  );
}
