import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function localApiBridgePlugin(): Plugin {
  return {
    name: 'zuno-local-api-bridge',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url?.split('?')[0];
        if (urlPath !== '/api/craft' && urlPath !== '/api/admin') {
          next();
          return;
        }

        const chunks: Buffer[] = [];
        req.on('data', (chunk: Buffer) => chunks.push(chunk));
        req.on('end', async () => {
          const rawBody = Buffer.concat(chunks).toString('utf8');
          let statusCode = 200;
          const headers: Record<string, string | string[]> = {
            'Content-Type': 'application/json',
          };

          const mockRes = {
            status(code: number) {
              statusCode = code;
              return mockRes;
            },
            setHeader(name: string, value: string | string[]) {
              headers[name] = value;
            },
            json(payload: unknown) {
              res.statusCode = statusCode;
              for (const [k, v] of Object.entries(headers)) {
                res.setHeader(k, v);
              }
              res.end(JSON.stringify(payload));
            },
          };

          try {
            const modPath = urlPath === '/api/craft' ? '/api/craft.ts' : '/api/admin.ts';
            const mod = (await server.ssrLoadModule(modPath)) as {
              default: (r: unknown, s: unknown) => Promise<void>;
            };
            await mod.default(
              {
                method: req.method,
                headers: req.headers,
                body: rawBody,
              },
              mockRes
            );
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Local API handler error',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiBridgePlugin()],
  base: '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
