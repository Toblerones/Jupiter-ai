import type { LogEvent } from '@/lib/types';

const EV_CLASS: Record<string, string> = {
  iteration_completed: 'iterate',
  phase_complete:      'review',
  phase_reviewed:      'review',
  gaps_checked:        'gap',
};

function fmtTime(ts: string): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '——';
  }
}

function evDetail(ev: LogEvent): string {
  switch (ev.event) {
    case 'iteration_completed':
      return `iter ${ev.iteration ?? '?'} · gap ${ev.gap ?? '?'}${ev.phase ? ` · ${ev.phase}` : ''}`;
    case 'phase_complete':
      return `${ev.phase ?? ''} approved`;
    case 'phase_reviewed':
      return `${ev.phase ?? ''} reviewed`;
    case 'project_initialized':
      return 'workspace initialised';
    case 'gaps_checked':
      return 'REQ coverage check';
    case 'handoff_created':
      return 'handoff generated';
    case 'initiative_spawned':
      return 'child initiative spawned';
    default:
      return ev.event.replace(/_/g, ' ');
  }
}

interface Props {
  events: LogEvent[];
}

export default function LiveLog({ events }: Props) {
  if (events.length === 0) {
    return (
      <div style={{ color: 'var(--text3)', fontSize: 11, padding: '4px 0' }}>
        No events yet.
      </div>
    );
  }

  return (
    <div>
      {events.map((ev, i) => (
        <div key={i} className="log-row">
          <div className="log-time">{fmtTime(ev.ts)}</div>
          <div className="log-event">
            <span className={`ev-type ${EV_CLASS[ev.event] ?? ''}`}>
              {ev.event.replace(/_/g, ' ')}
            </span>
            {' '}
            {evDetail(ev)}
          </div>
        </div>
      ))}
    </div>
  );
}
