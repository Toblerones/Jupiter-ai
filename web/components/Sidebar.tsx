import type { Initiative } from '@/lib/types';

interface Props {
  initiatives: Initiative[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

function pipClass(status?: string): string {
  if (!status || status === 'not_started') return '';
  if (status === 'complete') return 'done';
  return 'active';
}

export default function Sidebar({ initiatives, activeId, onSelect }: Props) {
  return (
    <div className="sidebar">
      <div className="sb-head">Initiatives</div>
      {initiatives.length === 0 ? (
        <div style={{ padding: '12px 14px', color: 'var(--text3)', fontSize: 11 }}>
          No initiatives yet.
        </div>
      ) : (
        initiatives.map(ini => {
          const id = ini.initiative.id;
          const p = ini.phases;
          return (
            <div
              key={id}
              className={`ini-item${id === activeId ? ' active' : ''}`}
              onClick={() => onSelect(id)}
            >
              <div className="ini-id">{id}</div>
              <div className="ini-title">{ini.initiative.title}</div>
              <div className="pips">
                <div className={`pip ${pipClass(p.intent?.status)}`} />
                <div className={`pip ${pipClass(p.requirements?.status)}`} />
                <div className={`pip ${pipClass(p.design?.status)}`} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
