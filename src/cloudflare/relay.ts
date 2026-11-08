import { DurableObject } from 'cloudflare:workers';

/**
 * Relay for the presenter window. The deck (laptop) and the presenter view
 * (phone) each open a WebSocket to /ws?k=<CONTROL_KEY>. Whatever one sends, the
 * other receives. The room also remembers the last deck position so a phone
 * that connects late catches up immediately.
 *
 * Everything else is static assets (the built deck), served without running this code.
 */
export interface Env {
  ROOM: DurableObjectNamespace<DeckRoom>;
  /** Shared secret for /ws. Set with `wrangler secret put CONTROL_KEY` (or .dev.vars locally). */
  CONTROL_KEY: string;
}

const enc = new TextEncoder();

/** Constant-time comparison of two strings (hash first so lengths match). */
async function sameSecret(a: string, b: string): Promise<boolean> {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  return (crypto.subtle as SubtleCrypto & { timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean }).timingSafeEqual(ha, hb);
}

export function createRelay(notes: unknown): ExportedHandler<Env> {
  return {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const isWs = url.pathname === '/ws';
    const isNotes = url.pathname === '/api/notes';
    if (!isWs && !isNotes) return new Response('Not found', { status: 404 });
    if (!env.CONTROL_KEY || !(await sameSecret(url.searchParams.get('k') ?? '', env.CONTROL_KEY))) {
      return new Response('Forbidden', { status: 403 });
    }
    // The speaker notes are bundled into this Worker, not into the public assets.
    if (isNotes) return Response.json(notes, { headers: { 'Cache-Control': 'no-store' } });
    if (request.headers.get('Upgrade') !== 'websocket') return new Response('Expected a WebSocket', { status: 426 });
    return env.ROOM.get(env.ROOM.idFromName('main')).fetch(request);
  },
} satisfies ExportedHandler<Env>;
}

export class DeckRoom extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Answered by the runtime without waking the object, so idle sockets stay cheap.
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
  }

  async fetch(_request: Request): Promise<Response> {
    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string' || message.length > 8192) return;
    let parsed: { type?: string; state?: unknown };
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }
    if (parsed.type === 'state') {
      await this.ctx.storage.put('state', parsed.state);
    } else if (parsed.type === 'hello') {
      const state = await this.ctx.storage.get('state');
      if (state) ws.send(JSON.stringify({ type: 'state', state }));
    } else if (parsed.type !== 'command' && parsed.type !== 'key' && parsed.type !== 'timer') {
      return;
    }
    for (const peer of this.ctx.getWebSockets()) {
      if (peer !== ws) peer.send(message);
    }
  }

  webSocketClose(ws: WebSocket, code: number): void {
    ws.close(code === 1005 ? 1000 : code);
  }
}
