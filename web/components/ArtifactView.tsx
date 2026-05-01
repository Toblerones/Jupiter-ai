import type { ArtifactContent } from '@/lib/types';

interface Props {
  artifact: ArtifactContent;
}

export default function ArtifactView({ artifact }: Props) {
  const filename = artifact.path.split(/[\\/]/).pop() ?? artifact.path;

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Artifact — {filename}</span>
        <span className="chip" style={{ fontSize: 10, color: 'var(--text3)' }}>{artifact.path}</span>
      </div>
      <pre className="artifact-content">{artifact.content}</pre>
    </div>
  );
}
