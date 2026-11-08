import { useEffect, useRef } from 'react';
import type { TimerOp } from './timer';

/**
 * Keeps the audience deck and the presenter window (`/?presenter`) in step.
 *
 * With a control key (`?k=...`, remembered in localStorage) both windows talk
 * through the Cloudflare Worker over a WebSocket, so the presenter can be a
 * phone. Without one they fall back to BroadcastChannel (same browser only),
 * which is what `npm run dev` uses. The deck is the source of truth and
 * broadcasts its position; the presenter sends keys and commands back.
 */
export type DeckCommand = 'next' | 'prev' | 'home' | 'end' | 'resetTimer';

export interface DeckPosition {
  sceneId: string;
  step: number;
  stepCount: number;
  /** Timer fields on the DECK's clock; see timer.ts. */
  startedAt: number | null;
  pausedAt: number | null;
  /** The deck's clock when this was sent. The presenter uses it to compute elapsed without trusting its own clock. */
  sentAt: number;
  /** Set by the presenter when the deck sent the old message format: its timer can't be trusted or controlled. */
  legacy?: boolean;
}

export type SyncMessage =
  | { type: 'state'; state: DeckPosition }
  | { type: 'hello' }
  | { type: 'command'; command: DeckCommand }
  | { type: 'timer'; timer: TimerOp }
  /** A raw key from the presenter window, replayed in the deck so both share one key path. */
  | { type: 'key'; key: string; repeat: boolean };

const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Wire data is not trusted to be current: the relay remembers the last position, and a deck tab
 * opened before an update may still send the old shape (no `sentAt` / `pausedAt`). Anything we
 * can't do exact timer maths with is treated as "timer not started" until a fresh snapshot arrives,
 * rather than producing NaN.
 */
export function normalizeState(raw: Partial<DeckPosition> | null | undefined): DeckPosition | null {
  if (!raw || typeof raw.sceneId !== 'string' || !num(raw.step) || !num(raw.stepCount)) return null;
  const timerOk = num(raw.startedAt) && num(raw.sentAt) && (raw.pausedAt == null || num(raw.pausedAt));
  return {
    sceneId: raw.sceneId,
    step: raw.step,
    stepCount: raw.stepCount,
    startedAt: timerOk ? raw.startedAt! : null,
    pausedAt: timerOk && num(raw.pausedAt) ? raw.pausedAt : null,
    sentAt: num(raw.sentAt) ? raw.sentAt : 0,
    legacy: !num(raw.sentAt),
  };
}

export interface Link {
  post: (m: SyncMessage) => void;
  close: () => void;
}

interface LinkHandlers {
  onMessage: (m: SyncMessage) => void;
  /** The link is (re)connected. Announce yourself here. */
  onOpen?: () => void;
  onStatus?: (connected: boolean) => void;
}

let localChannel = 'presentation-deck';
/** Set a unique channel when two decks may be open on the same origin. */
export function configureSyncChannel(name: string) { localChannel = name; }
const KEY_STORAGE = 'deck-control-key';

/** Reads `?k=` once, remembers it, and removes it from the address bar. */
export function controlKey(): string | null {
  try {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get('k');
    if (fromUrl) {
      localStorage.setItem(KEY_STORAGE, fromUrl);
      url.searchParams.delete('k');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
      return fromUrl;
    }
    return localStorage.getItem(KEY_STORAGE);
  } catch {
    return null;
  }
}

/** Remember the key in this browser (used by the pairing screen). */
export function saveControlKey(key: string) {
  localStorage.setItem(KEY_STORAGE, key);
}

function openSocket(key: string, h: LinkHandlers): Link {
  let ws: WebSocket | null = null;
  let closed = false;
  let retry = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let keepAlive: ReturnType<typeof setInterval> | undefined;

  const connect = () => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const sock = new WebSocket(`${proto}//${window.location.host}/ws?k=${encodeURIComponent(key)}`);
    ws = sock;
    sock.onopen = () => {
      retry = 0;
      h.onStatus?.(true);
      h.onOpen?.();
      // Answered by the edge without waking the room; keeps phones from dropping the socket.
      keepAlive = setInterval(() => sock.readyState === WebSocket.OPEN && sock.send('ping'), 20_000);
    };
    sock.onmessage = (e: MessageEvent<string>) => {
      if (e.data === 'pong') return;
      try {
        h.onMessage(JSON.parse(e.data) as SyncMessage);
      } catch {
        /* ignore malformed */
      }
    };
    sock.onclose = () => {
      clearInterval(keepAlive);
      h.onStatus?.(false);
      if (closed) return;
      timer = setTimeout(connect, Math.min(5000, 400 * 2 ** retry++));
    };
  };
  connect();

  // A phone that slept comes back with a dead socket: reconnect as soon as it's visible.
  const onVisible = () => {
    if (document.visibilityState === 'visible' && ws && ws.readyState > WebSocket.OPEN) {
      clearTimeout(timer);
      connect();
    }
  };
  document.addEventListener('visibilitychange', onVisible);

  return {
    post: (m) => ws?.readyState === WebSocket.OPEN && ws.send(JSON.stringify(m)),
    close: () => {
      closed = true;
      clearTimeout(timer);
      clearInterval(keepAlive);
      document.removeEventListener('visibilitychange', onVisible);
      ws?.close();
    },
  };
}

function openLocal(h: LinkHandlers): Link | null {
  if (typeof BroadcastChannel === 'undefined') return null;
  const ch = new BroadcastChannel(localChannel);
  ch.onmessage = (e: MessageEvent<SyncMessage>) => h.onMessage(e.data);
  h.onStatus?.(true);
  queueMicrotask(() => h.onOpen?.());
  return { post: (m) => ch.postMessage(m), close: () => ch.close() };
}

export function openLink(h: LinkHandlers): Link | null {
  const key = controlKey();
  return key ? openSocket(key, h) : openLocal(h);
}

/** Deck side: publish position changes, answer "hello", replay keys and run commands. */
export function useDeckSync(
  position: Omit<DeckPosition, 'sentAt'>,
  onCommand: (c: DeckCommand) => void,
  onTimer: (o: TimerOp) => void,
) {
  const link = useRef<Link | null>(null);
  const latest = useRef(position);
  const handlers = useRef({ onCommand, onTimer });
  useEffect(() => {
    latest.current = position;
    handlers.current = { onCommand, onTimer };
  });

  useEffect(() => {
    const announce = () => link.current?.post({ type: 'state', state: { ...latest.current, sentAt: Date.now() } });
    const l = openLink({
      onOpen: announce,
      onMessage: (m) => {
        if (m.type === 'hello') announce();
        else if (m.type === 'command') handlers.current.onCommand(m.command);
        else if (m.type === 'timer') handlers.current.onTimer(m.timer);
        else if (m.type === 'key') {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: m.key, repeat: m.repeat, cancelable: true }));
        }
      },
    });
    link.current = l;
    return () => {
      l?.close();
      link.current = null;
    };
  }, []);

  const { sceneId, step, stepCount, startedAt, pausedAt } = position;
  useEffect(() => {
    link.current?.post({ type: 'state', state: { sceneId, step, stepCount, startedAt, pausedAt, sentAt: Date.now() } });
  }, [sceneId, step, stepCount, startedAt, pausedAt]);
}
