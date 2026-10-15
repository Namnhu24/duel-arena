/**
 * Production Full-Stack Server
 * Runs Express on port 3000 and mounts the WebSocket server for real-time PVP duels.
 */

import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { setupDuelWebSocket } from './src/server/duelSocket';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Attach WebSocket server on /ws
const wss = new WebSocketServer({ server, path: '/ws' });
setupDuelWebSocket(wss);

// Serve static assets from dist
app.use(express.static(path.resolve(__dirname, 'dist')));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`[Yu-Gi-Oh! Server] Full-Stack server running on port ${PORT}`);
});
