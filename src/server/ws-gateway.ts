import { WebSocketServer, WebSocket } from 'ws';
import http from 'node:http';
import { ArenaSessionConfig } from '../protocol/types.js';

export interface WsGatewayEvents {
  onSelection: (payload: { selectedId: string; feedback?: string }) => void;
  onCancel: (reason: string) => void;
  onClientConnected?: () => void;
}

export class WsGateway {
  private wss: WebSocketServer;
  private clients = new Set<WebSocket>();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private events: WsGatewayEvents;

  constructor(server: http.Server, events: WsGatewayEvents) {
    this.events = events;
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      (ws as any).isAlive = true;

      if (this.events.onClientConnected) {
        this.events.onClientConnected();
      }

      ws.on('pong', () => {
        (ws as any).isAlive = true;
      });

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === 'SELECT' && msg.selectedId) {
            this.events.onSelection({
              selectedId: msg.selectedId,
              feedback: msg.feedback
            });
          } else if (msg.type === 'CANCEL') {
            this.events.onCancel(msg.reason || 'user_cancelled');
          }
        } catch (err) {
          // ignore malformed payloads
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      ws.on('error', () => {
        this.clients.delete(ws);
      });
    });

    this.startHeartbeat();
  }

  public broadcastSession(config: ArenaSessionConfig): void {
    const payload = JSON.stringify({
      type: 'SESSION_READY',
      data: config
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  public notifyResolved(selectedId: string): void {
    const payload = JSON.stringify({
      type: 'SESSION_RESOLVED',
      selectedId
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  }

  public getConnectedClientCount(): number {
    return this.clients.size;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      for (const ws of this.clients) {
        if (!(ws as any).isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          continue;
        }
        (ws as any).isAlive = false;
        ws.ping();
      }
    }, 15000);
  }

  public close(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    return new Promise((resolve) => {
      this.wss.close(() => resolve());
    });
  }
}
