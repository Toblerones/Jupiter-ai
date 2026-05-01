import type { Initiative, ContextFile } from '@/lib/types';

interface Props {
  initiatives: Initiative[];
  activeId: string | null;
  onSelect: (id: string) => void;
  contextFiles: ContextFile[];
}

function pipClass(status?: string): string {
  if (!status || status === 'not_started') return '';
  if (status === 'complete') return 'done';
  return 'active';
}

export default function Sidebar({ initiatives, activeId, onSelect, contextFiles }: Props) {
  return (
    <div className="sidebar">
      <div className="sb-head">Initiatives</div>
      <div className="sb-scroll">
        {initiatives.length === 0 ? (
          <div style={{ padding: '12px 16px', color: 'var(--text3)', fontSize: 12 }}>
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

        {contextFiles.length > 0 && (
          <div className="ctx-section">
            <div className="sb-head">Context &amp; Guardrails</div>
            {contextFiles.map((f, i) => (
              <div key={i} className="ctx-item">
                <span className="ctx-cat">{f.category}</span>
                <span className="ctx-name" title={f.name}>{f.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
