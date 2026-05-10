'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ArtifactContent } from '@/lib/types';

interface Props {
  artifact: ArtifactContent;
}

function isMarkdown(path: string): boolean {
  return /\.(md|mdx)$/i.test(path);
}

export default function ArtifactView({ artifact }: Props) {
  const filename = artifact.path.split(/[\\/]/).pop() ?? artifact.path;
  const md = isMarkdown(artifact.path);

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Artifact — {filename}</span>
        <span className="chip" style={{ fontSize: 10, color: 'var(--text3)' }}>{artifact.path}</span>
      </div>
      {md ? (
        <div className="md-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{artifact.content}</ReactMarkdown>
        </div>
      ) : (
        <pre className="artifact-content">{artifact.content}</pre>
      )}
    </div>
  );
}
