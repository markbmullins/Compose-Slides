import { useEffect, useRef, useState } from 'react';
import type { TimerOp } from './timer';

const mmss = (ms: number) => {
  const t = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / 1000)) : 0;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

interface Props {
  /** Live elapsed time, re-rendered by the parent every tick. */
  elapsedMs: number;
  started: boolean;
  paused: boolean;
  /** The deck is an old version that can't report or take timer controls. */
  legacy?: boolean;
  /** Current scene label and its planned window in minutes. */
  scene: string;
  window: [number, number];
  onOp: (op: TimerOp) => void;
  onClose: () => void;
}

const NUDGES: { label: string; seconds: number }[] = [
  { label: '−5:00', seconds: -300 },
  { label: '−1:00', seconds: -60 },
  { label: '−0:10', seconds: -10 },
  { label: '+0:10', seconds: 10 },
  { label: '+1:00', seconds: 60 },
  { label: '+5:00', seconds: 300 },
];

/** Bottom sheet on phones, centred card on larger screens. Changes apply immediately. */
export default function TimerModal({ elapsedMs, started, paused, legacy, scene, window: win, onOp, onClose }: Props) {
  const sheet = useRef<HTMLDivElement>(null);
  // Prefill the exact-time fields once, from the time the modal opened.
  const [min, setMin] = useState(() => String(Math.floor(elapsedMs / 60000)));
  const [sec, setSec] = useState(() => String(Math.floor(elapsedMs / 1000) % 60));

  useEffect(() => {
    sheet.current?.querySelector<HTMLButtonElement>('button.pv-m-primary')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
      // Keep Tab inside the dialog.
      if (e.key === 'Tab' && sheet.current) {
        const f = [...sheet.current.querySelectorAll<HTMLElement>('button, input')].filter((x) => !(x as HTMLButtonElement).disabled);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    const prev = document.activeElement as HTMLElement | null;
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);

  const target = win[0] * 60;
  const state = !started ? 'Not started' : paused ? 'Paused' : 'Running';
  const over = started ? elapsedMs / 1000 - win[1] * 60 : 0;
  const plan = !started ? '' : over > 0 ? `${mmss(over * 1000)} over this section's window` : elapsedMs / 1000 < win[0] * 60 ? `${mmss((win[0] * 60 - elapsedMs / 1000) * 1000)} ahead of plan` : 'on plan';

  const clampInt = (v: string, max: number) => Math.min(max, Math.max(0, parseInt(v, 10) || 0));
  const applyExact = () => onOp({ op: 'set', seconds: clampInt(min, 599) * 60 + clampInt(sec, 59) });

  return (
    <div className="pv-modal-back" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pv-modal" role="dialog" aria-modal="true" aria-labelledby="pv-m-title" ref={sheet}>
        <div className="pv-m-head">
          <h2 id="pv-m-title">Timer</h2>
          <button className="pv-m-x" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {legacy && (
          <p className="pv-m-legacy" role="alert">
            The laptop deck is running an older version, so it can't show or change the timer. Reload the deck tab on the laptop, then try again.
          </p>
        )}
        <div className="pv-m-clock" aria-live="off">{started ? mmss(elapsedMs) : '--:--'}</div>
        <div className={`pv-m-state ${paused ? 'pv-warn' : started ? 'pv-ok' : 'pv-dim'}`}>
          {state}{plan && <span className="pv-m-plan"> · {plan}</span>}
        </div>

        <div className="pv-m-row">
          {!started && <button className="pv-m-primary" onClick={() => onOp({ op: 'start' })}>Start timer</button>}
          {started && !paused && <button className="pv-m-primary" onClick={() => onOp({ op: 'pause' })}>Pause</button>}
          {started && paused && <button className="pv-m-primary" onClick={() => onOp({ op: 'resume' })}>Resume</button>}
          <button className="pv-m-danger" onClick={() => { onOp({ op: 'reset' }); setMin('0'); setSec('0'); }} disabled={!started}>Reset</button>
        </div>

        <div className="pv-m-label">Nudge</div>
        <div className="pv-m-nudges">
          {NUDGES.map((n) => (
            <button key={n.label} onClick={() => onOp({ op: 'adjust', seconds: n.seconds })}>{n.label}</button>
          ))}
        </div>

        <div className="pv-m-label">Set exact time</div>
        <form className="pv-m-set" onSubmit={(e) => { e.preventDefault(); applyExact(); }}>
          <label><input inputMode="numeric" pattern="[0-9]*" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, '').slice(0, 3))} aria-label="Minutes" /><span>min</span></label>
          <label><input inputMode="numeric" pattern="[0-9]*" value={sec} onChange={(e) => setSec(e.target.value.replace(/\D/g, '').slice(0, 2))} aria-label="Seconds" /><span>sec</span></label>
          <button type="submit">Set</button>
        </form>

        <button className="pv-m-plan-btn" onClick={() => onOp({ op: 'set', seconds: target })}>
          Jump to plan: {scene} starts at {win[0]}:00
        </button>
      </div>
    </div>
  );
}
