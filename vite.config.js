import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    port: 8080,
    open: true
  },
  plugins: [
    {
      name: 'dev-api-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/scores')) {
            try {
              const { handler } = await import('./netlify/functions/scores.js');
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                const url = new URL(req.url, 'http://localhost');
                const queryParams = Object.fromEntries(url.searchParams);
                const event = {
                  httpMethod: req.method,
                  body: body || null,
                  queryStringParameters: queryParams
                };
                const response = await handler(event, {});
                res.statusCode = response.statusCode;
                Object.entries(response.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
                res.end(response.body);
              });
              return;
            } catch (err) {
              console.error('API middleware error:', err);
            }
          }
          next();
        });
      }
    }
  ],
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']
        }
      }
    }
  }
});
