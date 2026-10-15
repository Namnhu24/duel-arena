/**
 * Real-time Duel Room & WebSocket Synchronization Engine
 * Handles room creation, joining, state synchronization, and live player actions.
 */

import { WebSocket, WebSocketServer } from 'ws';
import type { IncomingMessage } from 'http';

export interface DuelRoom {
  code: string;
  host: {
    ws: WebSocket;
    name: string;
    deckConfig?: any;
    ready: boolean;
  };
  guest?: {
    ws: WebSocket;
    name: string;
    deckConfig?: any;
    ready: boolean;
  };
  createdAt: number;
}

const activeRooms = new Map<string, DuelRoom>();

export function setupDuelWebSocket(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    let currentRoomCode: string | null = null;
    let playerRole: 'host' | 'guest' | null = null;

    ws.on('message', (data: string) => {
      try {
        const msg = JSON.parse(data.toString());

        switch (msg.type) {
          case 'CREATE_ROOM': {
            const code = msg.roomCode || Math.floor(1000 + Math.random() * 9000).toString();
            currentRoomCode = code;
            playerRole = 'host';

            activeRooms.set(code, {
              code,
              host: {
                ws,
                name: msg.name || 'Host Duelist',
                deckConfig: msg.deckConfig,
                ready: true,
              },
              createdAt: Date.now(),
            });

            ws.send(JSON.stringify({
              type: 'ROOM_CREATED',
              roomCode: code,
              role: 'host',
              message: `Room #${code} created! Share this code with your opponent.`,
            }));
            break;
          }

          case 'JOIN_ROOM': {
            const code = msg.roomCode;
            const room = activeRooms.get(code);

            if (!room) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                message: `Room #${code} does not exist or has closed.`,
              }));
              return;
            }

            if (room.guest) {
              ws.send(JSON.stringify({
                type: 'ERROR',
                message: `Room #${code} is already full (2/2 duelists).`,
              }));
              return;
            }

            currentRoomCode = code;
            playerRole = 'guest';

            room.guest = {
              ws,
              name: msg.name || 'Challenger',
              deckConfig: msg.deckConfig,
              ready: true,
            };

            // Notify Guest
            ws.send(JSON.stringify({
              type: 'ROOM_JOINED',
              roomCode: code,
              role: 'guest',
              opponentName: room.host.name,
              message: `Successfully connected to Room #${code}!`,
            }));

            // Notify Host that opponent entered
            if (room.host.ws.readyState === WebSocket.OPEN) {
              room.host.ws.send(JSON.stringify({
                type: 'OPPONENT_JOINED',
                opponentName: room.guest.name,
                message: `${room.guest.name} entered the duel room! Ready to duel.`,
              }));
            }
            break;
          }

          case 'SYNC_ACTION': {
            if (!currentRoomCode) return;
            const room = activeRooms.get(currentRoomCode);
            if (!room) return;

            // Broadcast action to the other player
            const targetWs = playerRole === 'host' ? room.guest?.ws : room.host.ws;
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify({
                type: 'REMOTE_ACTION',
                action: msg.action,
                payload: msg.payload,
                sender: msg.sender || playerRole,
              }));
            }
            break;
          }

          case 'CHAT_MESSAGE': {
            if (!currentRoomCode) return;
            const room = activeRooms.get(currentRoomCode);
            if (!room) return;

            const chatPayload = JSON.stringify({
              type: 'CHAT_BROADCAST',
              sender: msg.sender || (playerRole === 'host' ? room.host.name : room.guest?.name),
              text: msg.text,
              timestamp: Date.now(),
            });

            if (room.host.ws.readyState === WebSocket.OPEN) room.host.ws.send(chatPayload);
            if (room.guest?.ws.readyState === WebSocket.OPEN) room.guest.ws.send(chatPayload);
            break;
          }
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      if (currentRoomCode) {
        const room = activeRooms.get(currentRoomCode);
        if (room) {
          if (playerRole === 'host') {
            if (room.guest?.ws.readyState === WebSocket.OPEN) {
              room.guest.ws.send(JSON.stringify({
                type: 'ROOM_CLOSED',
                message: 'Host has disconnected. Duel ended.',
              }));
            }
            activeRooms.delete(currentRoomCode);
          } else if (playerRole === 'guest') {
            if (room.host.ws.readyState === WebSocket.OPEN) {
              room.host.ws.send(JSON.stringify({
                type: 'OPPONENT_DISCONNECTED',
                message: 'Opponent disconnected from the duel.',
              }));
            }
            room.guest = undefined;
          }
        }
      }
    });
  });
}
