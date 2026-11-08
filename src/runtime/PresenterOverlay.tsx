import { useEffect, useState } from 'react';
import type { SceneDef } from './types';
import { elapsedMs, type TimerState } from './timer';

const mmss = (s: number) => {
  const t = Math.max(0, Math.floor(s));
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

interface Props {
  timer: TimerState;
  scene: SceneDef;
  next?: SceneDef;
  step: number;
  stepCount: number;
}

export default function PresenterOverlay({ timer, scene, next, step, stepCount }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const startedAt = timer.startedAt;
  const elapsed = elapsedMs(timer, now) / 1000;
  const [start, end] = scene.window;
  const over = elapsed - end * 60;

  let status = timer.pausedAt != null ? 'Paused' : 'On time';
  let color = 'var(--text-2)';
  if (startedAt && over > 0) {
    status = `Over by ${mmss(over)}`;
    color = over > 120 ? 'var(--danger)' : 'var(--warning)';
  } else if (startedAt && elapsed < start * 60) {
    status = 'Ahead';
  }

  return (
    <div className="presenter">
      <div className="presenter-time tabular mono">{mmss(elapsed)}</div>
      <div className="presenter-row">
        <span>{scene.label}</span>
        <span className="mono tabular">{step + 1}/{stepCount}</span>
      </div>
      <div className="presenter-row presenter-dim">
        <span>Window</span>
        <span className="mono tabular">{start}–{end} min</span>
      </div>
      <div className="presenter-row" style={{ color }}>
        <span>Status</span>
        <span>{status}</span>
      </div>
      <div className="presenter-row presenter-dim">
        <span>Next</span>
        <span>{next ? next.label : '—'}</span>
      </div>
      <div className="presenter-hint mono">R reset</div>
    </div>
  );
}
