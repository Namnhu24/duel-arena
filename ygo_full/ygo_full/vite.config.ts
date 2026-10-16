import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { WebSocketServer } from 'ws';
import { setupDuelWebSocket } from './src/server/duelSocket';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'duel-websocket-server',
        configureServer(server) {
          if (server.httpServer) {
            const wss = new WebSocketServer({ server: server.httpServer as any, path: '/ws' });
            setupDuelWebSocket(wss);
            console.log('[Duel Server] WebSocket server attached to /ws');
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
