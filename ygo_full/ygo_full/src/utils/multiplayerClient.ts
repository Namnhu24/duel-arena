/**
 * Client-Side WebSocket Real-time Multiplayer Manager
 */

export type MultiplayerEventListener = (event: {
  type: string;
  action?: string;
  payload?: any;
  sender?: string;
  roomCode?: string;
  opponentName?: string;
  message?: string;
}) => void;

class DuelMultiplayerClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<MultiplayerEventListener>();
  private roomCode: string | null = null;
  private role: 'host' | 'guest' | null = null;
  private playerName: string = 'Duelist';

  public connect(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
        resolve(true);
        return;
      }

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[Multiplayer] Connected to duel server:', wsUrl);
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'ROOM_CREATED') {
              this.roomCode = data.roomCode;
              this.role = 'host';
            } else if (data.type === 'ROOM_JOINED') {
              this.roomCode = data.roomCode;
              this.role = 'guest';
            }
            this.listeners.forEach((fn) => fn(data));
          } catch (e) {
            console.error('Failed to parse WS payload:', e);
          }
        };

        this.ws.onerror = (err) => {
          console.warn('[Multiplayer] WebSocket connection warning:', err);
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('[Multiplayer] WebSocket disconnected.');
        };
      } catch (e) {
        console.warn('[Multiplayer] Could not instantiate WebSocket:', e);
        resolve(false);
      }
    });
  }

  public addListener(fn: MultiplayerEventListener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  public createRoom(roomCode: string, playerName: string, deckConfig: any) {
    this.playerName = playerName;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'CREATE_ROOM',
        roomCode,
        name: playerName,
        deckConfig,
      }));
    }
  }

  public joinRoom(roomCode: string, playerName: string, deckConfig: any) {
    this.playerName = playerName;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        roomCode,
        name: playerName,
        deckConfig,
      }));
    }
  }

  public syncAction(action: string, payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'SYNC_ACTION',
        roomCode: this.roomCode,
        action,
        payload,
        sender: this.playerName,
      }));
    }
  }

  public sendChat(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'CHAT_MESSAGE',
        roomCode: this.roomCode,
        text,
        sender: this.playerName,
      }));
    }
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.roomCode = null;
    this.role = null;
  }

  public getRoomCode() {
    return this.roomCode;
  }

  public getRole() {
    return this.role;
  }
}

export const multiplayer = new DuelMultiplayerClient();
