import type { User } from './auth-types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://admin.therealmusicdistro.com/api').replace(/\/$/, '');
const WS_URL = (import.meta.env.VITE_REALTIME_URL || 'wss://realtime.therealmusicdistro.com').replace(/\/$/, '');

type RealtimeEvent = { id: string; type: string; topic: string; data?: any; timestamp: string };
type Handler = (event: RealtimeEvent) => void;

class RealtimeClient {
  private socket: WebSocket | null = null;
  private handlers = new Map<string, Set<Handler>>();
  private topics = new Set<string>();
  private reconnectTimer: number | null = null;
  private reconnectAttempt = 0;
  private closed = false;
  private connecting: Promise<void> | null = null;

  async connect(user: User): Promise<void> {
    this.closed = false;
    if (this.socket?.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;
    this.connecting = (async () => {
      const response = await fetch(`${API_BASE}/auth?action=realtime-token`, { credentials: 'include', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error(`Realtime authentication failed (${response.status})`);
      const body = await response.json();
      if (!body.token) throw new Error('Realtime authentication token was not returned.');
      await new Promise<void>((resolve, reject) => {
        const socket = new WebSocket(`${WS_URL}/?token=${encodeURIComponent(body.token)}`);
        this.socket = socket;
        let settled = false;
        socket.onopen = () => { this.reconnectAttempt = 0; this.send({ action: 'subscribe', topics: [...this.topics] }); if (!settled) { settled = true; resolve(); } };
        socket.onmessage = message => {
          try {
            const event = JSON.parse(String(message.data)) as RealtimeEvent;
            if (event.type === 'realtime.ready') return;
            this.handlers.get(event.topic)?.forEach(handler => handler(event));
            this.handlers.get('*')?.forEach(handler => handler(event));
          } catch (error) { console.error('[Realtime] invalid event', error); }
        };
        socket.onerror = () => { if (!settled) { settled = true; reject(new Error('Realtime WebSocket connection failed.')); } };
        socket.onclose = () => { this.socket = null; if (!settled) { settled = true; reject(new Error('Realtime WebSocket closed before connecting.')); } if (!this.closed) this.scheduleReconnect(user); };
      });
    })();
    try { await this.connecting; } finally { this.connecting = null; }
  }

  subscribe(topic: string, handler: Handler, user: User): () => void {
    if (!this.handlers.has(topic)) this.handlers.set(topic, new Set());
    this.handlers.get(topic)!.add(handler);
    this.topics.add(topic);
    void this.connect(user).then(() => this.send({ action: 'subscribe', topics: [topic] })).catch(error => console.error('[Realtime] connect failed', error));
    return () => {
      const set = this.handlers.get(topic); set?.delete(handler);
      if (set?.size === 0) this.handlers.delete(topic);
      if (!this.handlers.has(topic)) { this.topics.delete(topic); this.send({ action: 'unsubscribe', topics: [topic] }); }
      if (this.handlers.size === 0) this.disconnect();
    };
  }

  disconnect() { this.closed = true; if (this.reconnectTimer !== null) window.clearTimeout(this.reconnectTimer); this.reconnectTimer = null; this.socket?.close(1000, 'client disconnect'); this.socket = null; }
  private send(message: any) { if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(message)); }
  private scheduleReconnect(user: User) { if (this.reconnectTimer !== null || this.closed || this.topics.size === 0) return; const delay = Math.min(30000, 1000 * 2 ** this.reconnectAttempt++); this.reconnectTimer = window.setTimeout(() => { this.reconnectTimer = null; void this.connect(user).catch(() => {}); }, delay); }
}

export const realtime = new RealtimeClient();
export const artistTopic = (userId: string) => `artist:${userId}`;
export const adminTopic = () => 'admin';
