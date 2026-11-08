/**
 * The talk timer. The deck owns it (so the projector overlay and the presenter view agree);
 * the presenter sends operations. Times are epoch ms on the deck's clock. Elapsed is always
 * derived from these two fields, so pausing and adjusting are just edits to them.
 */
export interface TimerState {
  /** Epoch ms the timer would have started at to show the current elapsed time; null = not started. */
  startedAt: number | null;
  /** Epoch ms it was paused at, or null while running. */
  pausedAt: number | null;
}

export type TimerOp =
  | { op: 'reset' }
  | { op: 'start' }
  | { op: 'pause' }
  | { op: 'resume' }
  /** Set elapsed time to exactly this many seconds. */
  | { op: 'set'; seconds: number }
  /** Move elapsed time by this many seconds (negative allowed, floors at 0). */
  | { op: 'adjust'; seconds: number };

export const IDLE: TimerState = { startedAt: null, pausedAt: null };

export const elapsedMs = (t: TimerState, now: number): number =>
  t.startedAt == null ? 0 : Math.max(0, (t.pausedAt ?? now) - t.startedAt);

export function applyTimer(t: TimerState, o: TimerOp, now: number): TimerState {
  const running = t.startedAt != null && t.pausedAt == null;
  const paused = t.startedAt != null && t.pausedAt != null;
  switch (o.op) {
    case 'reset': return IDLE;
    case 'start': return { startedAt: now, pausedAt: null };
    case 'pause': return running ? { ...t, pausedAt: now } : t;
    case 'resume': return paused ? { startedAt: t.startedAt! + (now - t.pausedAt!), pausedAt: null } : t;
    case 'set':
    case 'adjust': {
      const base = o.op === 'set' ? 0 : elapsedMs(t, now);
      const target = Math.max(0, base + o.seconds * 1000);
      // Keep the paused/running state; an unstarted timer starts running from the new value.
      return paused ? { startedAt: t.pausedAt! - target, pausedAt: t.pausedAt } : { startedAt: now - target, pausedAt: null };
    }
  }
}
