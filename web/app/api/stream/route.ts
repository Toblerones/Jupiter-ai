import * as fs from 'fs';
import * as path from 'path';

const workspaceEnv = process.env.JUPITER_WORKSPACE_PATH ?? '../workspace';
const WORKSPACE = path.isAbsolute(workspaceEnv)
  ? workspaceEnv
  : path.resolve(process.cwd(), workspaceEnv);

export async function GET() {
  const logPath = path.join(WORKSPACE, 'log.jsonl');
  const encoder = new TextEncoder();
  let watcher: fs.FSWatcher | null = null;
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let lastSize = 0;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      send({ type: 'connected' });

      const startWatch = () => {
        try {
          lastSize = fs.statSync(logPath).size;
          watcher = fs.watch(logPath, () => {
            try {
              const size = fs.statSync(logPath).size;
              if (size <= lastSize) return;
              const buf = Buffer.alloc(size - lastSize);
              const fd = fs.openSync(logPath, 'r');
              fs.readSync(fd, buf, 0, size - lastSize, lastSize);
              fs.closeSync(fd);
              lastSize = size;
              for (const line of buf.toString('utf8').split('\n').filter(Boolean)) {
                try { send(JSON.parse(line)); } catch {}
              }
            } catch {}
          });
        } catch {}
      };

      if (fs.existsSync(logPath)) {
        startWatch();
      } else {
        // Poll until the log file appears (workspace not yet initialised)
        pollInterval = setInterval(() => {
          if (fs.existsSync(logPath)) {
            if (pollInterval) clearInterval(pollInterval);
            pollInterval = null;
            startWatch();
          }
        }, 2000);
      }
    },
    cancel() {
      watcher?.close();
      if (pollInterval) clearInterval(pollInterval);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
