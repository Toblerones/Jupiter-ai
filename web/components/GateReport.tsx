import type { GateReport as GateReportType } from '@/lib/types';

interface Props {
  report: GateReportType;
}

export default function GateReport({ report }: Props) {
  const autoFailing = report.auto_checks.failing;
  const aiFailing   = report.ai_checks.failing;
  const allPassing  = report.gap === 0;

  const autoValCls = autoFailing.length === 0 ? 'green' : 'red';
  const aiValCls   = aiFailing.length   === 0 ? 'green' : 'amber';

  return (
    <>
      {/* Summary grid */}
      <div className="card">
        <div className="card-head">
          <span className="card-title">Gate report — iteration {report.iteration}</span>
          <span className={`chip ${allPassing ? 'green' : 'amber'}`}>gap = {report.gap}</span>
        </div>
        <div className="card-body">
          <div className="gate-grid">
            <div className="gate-cell">
              <div className="gate-label">Auto checks</div>
              <div className={`gate-val ${autoValCls}`}>
                {report.auto_checks.passing} / {report.auto_checks.total}
              </div>
              <div className="gate-sub">
                {autoFailing.length === 0 ? 'all passing' : `${autoFailing.length} failing`}
              </div>
            </div>
            <div className="gate-cell">
              <div className="gate-label">AI checks</div>
              <div className={`gate-val ${aiValCls}`}>
                {report.ai_checks.passing} / {report.ai_checks.total}
              </div>
              <div className="gate-sub">
                {aiFailing.length === 0 ? 'all passing' : `${aiFailing.length} failing · gap open`}
              </div>
            </div>
            <div className="gate-cell">
              <div className="gate-label">Human gate</div>
              <div className={`gate-val ${allPassing ? 'amber' : ''}`} style={{ fontSize: 14 }}>
                {report.human_gate === 'approved' ? 'APPROVED' : allPassing ? 'READY' : '—'}
              </div>
              <div className="gate-sub">
                {report.human_gate === 'approved'
                  ? 'gate passed'
                  : allPassing
                  ? 'run /jupiter:review'
                  : 'awaiting gap = 0'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Failing checks */}
      {(autoFailing.length > 0 || aiFailing.length > 0) && (
        <div className="card">
          <div className="card-head">
            <span className="card-title">Failing checks</span>
            <span className="chip red">{autoFailing.length + aiFailing.length} failing</span>
          </div>
          <div className="card-body" style={{ padding: '4px 14px' }}>
            {autoFailing.map(c => (
              <div key={c.id} className="check-row">
                <span className="check-icon fail">✗</span>
                <span className="check-type">{c.id}</span>
                <span className="check-text">
                  <strong>{c.name.replace(/_/g, ' ')}</strong>
                  {c.reason ? ` — ${c.reason}` : ''}
                </span>
              </div>
            ))}
            {aiFailing.map(c => (
              <div key={c.id} className="check-row">
                <span className="check-icon fail">✗</span>
                <span className="check-type ai">{c.id}</span>
                <span className="check-text">
                  <strong>{c.name.replace(/_/g, ' ')}</strong>
                  {c.reason ? ` — ${c.reason}` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source findings (blockers/flags from upstream artifact check) */}
      {report.source_findings.length > 0 && (
        <div className="card">
          <div className="card-head">
            <span className="card-title">Source findings</span>
          </div>
          <div className="card-body" style={{ padding: '4px 14px' }}>
            {report.source_findings.map((f, i) => (
              <div key={i} className="check-row">
                <span className={`check-icon ${f.disposition === 'block' ? 'fail' : f.disposition === 'flag' ? 'warn' : 'pass'}`}>
                  {f.disposition === 'block' ? '✗' : f.disposition === 'flag' ? '!' : '~'}
                </span>
                <span className={`check-type ${f.disposition === 'block' ? 'block' : f.disposition === 'flag' ? 'flag' : ''}`}>
                  {f.disposition.replace('_', ' ')}
                </span>
                <span className="check-text">
                  {f.finding}
                  {f.rationale ? <> — <em style={{ color: 'var(--text3)' }}>{f.rationale}</em></> : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI narrative */}
      {report.narrative && (
        <div className="ai-block">
          <div className="ai-label">Jupiter · iteration {report.iteration} summary</div>
          <div className="ai-text">{report.narrative}</div>
        </div>
      )}

      {/* All-passing confirmation */}
      {allPassing && !report.narrative && (
        <div className="ai-block">
          <div className="ai-label">Jupiter · iteration {report.iteration} summary</div>
          <div className="ai-text">
            All auto and AI checks are passing. Gap = 0. Run{' '}
            <code style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--amber)' }}>
              /jupiter:review
            </code>{' '}
            to record the human gate decision and advance to the next phase.
          </div>
        </div>
      )}
    </>
  );
}
