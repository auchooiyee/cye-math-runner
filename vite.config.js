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
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ success: false, error: 'Local Vite server has no D1 database. Use Wrangler Pages dev to test the real leaderboard.' }));
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
