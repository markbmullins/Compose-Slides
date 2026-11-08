import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { STAGE_WIDTH, type SceneDef } from './types';
import { stepCue, type NotesMap } from './notes';
import TimerModal from './TimerModal';
import type { TimerOp } from './timer';
import { normalizeState, openLink, type DeckPosition, type Link, type SyncMessage } from './sync';
import './presenter.css';

const mmss = (s: number) => {
  const t = Number.isFinite(s) ? Math.max(0, Math.floor(s)) : 0;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};

/**
 * Notes text at a comfortable reading size (scaled to the screen width, never huge), shrunk
 * only if the notes wouldn't otherwise fit above the Back/Next bar. Because it stays modest,
 * the principle, "Up next" and Q&A sit right underneath and are often visible without scrolling.
 */
function FitText({ children, deps, big }: { children: ReactNode; deps: unknown; big?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const fit = () => {
      // Phones ~20px, tablets/desktop up to 28px.
      // `big` is for a single line you're reading aloud (live narration): larger so it works at a glance.
      const cap = big ? Math.min(40, Math.max(24, el.clientWidth / 12.5)) : Math.min(28, Math.max(17, el.clientWidth / 19));
      // The box is height:auto with a max-height, so it only overflows when the notes truly don't fit.
      let lo = 14;
      let hi = cap;
      el.style.fontSize = `${hi}px`;
      if (el.scrollHeight <= el.clientHeight + 1) return;
      for (let i = 0; i < 8 && hi - lo > 0.4; i++) {
        const mid = (lo + hi) / 2;
        el.style.fontSize = `${mid}px`;
        if (el.scrollHeight <= el.clientHeight + 1) lo = mid; else hi = mid;
      }
      el.style.fontSize = `${lo}px`;
    };
    fit();
    window.addEventListener('resize', fit);
    void document.fonts?.ready.then(fit);
    return () => window.removeEventListener('resize', fit);
  }, [deps]);
  return <div className="pv-fit" ref={box}>{children}</div>;
}

function SlidePreview({ scene, step, count }: { scene: SceneDef; step: number; count: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && matchMedia('(min-width: 1050px)').matches);
  const [scale, setScale] = useState(0.32);
  useEffect(() => {
    const query = matchMedia('(min-width: 1050px)');
    const update = () => setWide(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useLayoutEffect(() => {
    if (!wide) return;
    const el = box.current;
    if (!el) return;
    const fit = () => setScale(el.clientWidth / STAGE_WIDTH);
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    fit();
    return () => observer.disconnect();
  }, [wide]);
  if (!wide) return null;
  const Component = scene.Component;
  return <aside className="pv-preview" aria-label="Current slide preview">
    <div className="pv-preview-head"><span>ON STAGE</span><span>LIVE PREVIEW ●</span></div>
    <div className="pv-preview-stage" ref={box} aria-hidden="true">
      <div className="pv-preview-canvas" style={{ transform: `scale(${scale})` }}>
        <Component step={step} setStepCount={() => {}} goToStep={() => {}} />
      </div>
    </div>
    <div className="pv-preview-foot"><span>{scene.label}</span><span>STEP {String(step + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span></div>
  </aside>;
}

/**
 * `/?presenter`: speaker notes for whatever the audience window is showing.
 * Open it in a second window on your own screen. Arrow keys here drive the deck.
 */
export interface PresenterControl { label: string; key: string }

export default function PresenterView({ scenes, loadNotes, sceneControls, showPreview = false }: { scenes: SceneDef[]; loadNotes: () => Promise<NotesMap>; sceneControls?: Record<string, PresenterControl[]>; showPreview?: boolean }) {
  const [pos, setPos] = useState<DeckPosition | null>(null);
  const recvAt = useRef(Date.now());
  const [timerOpen, setTimerOpen] = useState(false);
  const timerOpenRef = useRef(false);
  useEffect(() => { timerOpenRef.current = timerOpen; }, [timerOpen]);
  const [now, setNow] = useState(() => Date.now());
  const [connected, setConnected] = useState(false);
  const [notesMap, setNotesMap] = useState<NotesMap | null>(null);
  const [notesError, setNotesError] = useState(false);
  useEffect(() => { loadNotes().then(setNotesMap).catch(() => setNotesError(true)); }, [loadNotes]);
  const link = useRef<Link | null>(null);

  useEffect(() => {
    document.title = 'Presenter notes';
    const l = openLink({
      onStatus: setConnected,
      onMessage: (m) => {
        if (m.type !== 'state') return;
        const next = normalizeState(m.state);
        if (!next) return;
        recvAt.current = Date.now();
        setPos(next);
      },
      onOpen: () => link.current?.post({ type: 'hello' }),
    });
    link.current = l;
    // Ask again in case the deck was opened after this window.
    const retry = setInterval(() => l?.post({ type: 'hello' }), 3000);
    return () => {
      clearInterval(retry);
      l?.close();
      link.current = null;
    };
  }, []);

  // Keep a phone's screen on while presenting.
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const request = () => { navigator.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {}); };
    request();
    const onVisible = () => document.visibilityState === 'visible' && request();
    document.addEventListener('visibilitychange', onVisible);
    return () => { document.removeEventListener('visibilitychange', onVisible); void lock?.release(); };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  const post = (m: SyncMessage) => link.current?.post(m);
  const sendKey = (key: string, repeat = false) => post({ type: 'key', key, repeat });

  // Same keys as the deck. They are replayed in the deck window, so behaviour is identical
  // (including held-arrow scrubbing and scene-specific shortcuts).
  useEffect(() => {
    const forward = new Set([
      'ArrowRight', 'ArrowLeft', ' ', 'PageDown', 'PageUp', 'Enter', 'Backspace', 'Home', 'End',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'p', 'P', '[', ']',
    ]);
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (timerOpenRef.current) return; // the timer dialog handles its own keys
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        if (!e.repeat) post({ type: 'timer', timer: { op: 'reset' } });
        return;
      }
      if (!forward.has(e.key)) return;
      // preventDefault also stops a focused button from "clicking" on Space/Enter as well.
      e.preventDefault();
      const arrow = e.key === 'ArrowRight' || e.key === 'ArrowLeft';
      if (!e.repeat || arrow) sendKey(e.key, e.repeat);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const view = useMemo(() => {
    if (!pos) return null;
    const i = scenes.findIndex((s) => s.id === pos.sceneId);
    if (i < 0) return null;
    const scene = scenes[i];
    const nextIsSameScene = pos.step + 1 < pos.stepCount;
    const nextScene = nextIsSameScene ? scene : scenes[i + 1];
    const nextStep = nextIsSameScene ? pos.step + 1 : 0;
    return { scene, sceneNotes: notesMap?.[scene.id], nextScene, nextStep, nextIsSameScene };
  }, [pos, scenes, notesMap]);

  if (!pos || !view) {
    return (
      <div className="pv pv-wait">
        <h1>{connected ? 'Waiting for the deck…' : 'Connecting…'}</h1>
        <p>{connected
          ? <>The deck window isn't connected yet. On your laptop, open <code>{window.location.origin}/?pair</code> once and paste your key. After that the browser remembers it.</>
          : 'Reaching the sync server. If this stays here, this device may need pairing: open /?pair.'}</p>
      </div>
    );
  }

  const { scene, sceneNotes, nextScene, nextStep, nextIsSameScene } = view;
  const [start, end] = scene.window;
  const legacy = !!pos.legacy;
  const started = pos.startedAt != null;
  const paused = pos.pausedAt != null;
  // Elapsed at the moment the deck sent this, then advanced by THIS device's clock: immune to clock skew.
  const elapsedAtSend = started ? Math.max(0, (pos.pausedAt ?? pos.sentAt) - pos.startedAt!) : 0;
  const elapsedMsNow = started && !paused ? elapsedAtSend + (now - recvAt.current) : elapsedAtSend;
  const elapsed = elapsedMsNow / 1000;
  const over = elapsed - end * 60;
  let status = 'Not started';
  let tone = legacy ? 'warn' : 'dim';
  if (started) {
    if (paused) { status = 'Paused'; tone = 'warn'; }
    else if (over > 0) { status = `Over by ${mmss(over)}`; tone = over > 120 ? 'fail' : 'warn'; }
    else if (elapsed < start * 60) { status = `Ahead by ${mmss(start * 60 - elapsed)}`; tone = 'ok'; }
    else { status = 'On time'; tone = 'ok'; }
  }
  // Every scene is scripted: one spoken line per step, shown big, with the next line previewed.
  const cues = sceneNotes?.cues?.length ? sceneNotes.cues : null;
  const cueIdx = cues ? Math.min(pos.step, cues.length - 1) : -1;
  const cue = cues && cueIdx >= 0 ? cues[cueIdx] : null;
  const cueNext = cues && cueIdx >= 0 ? cues[cueIdx + 1] ?? null : null;
  const upNext = nextScene && !nextIsSameScene ? stepCue(notesMap, nextScene.id, nextStep) : null;
  const controls = sceneControls?.[scene.id];

  const timerText = started ? mmss(elapsed) : '--:--';
  const shortStatus = legacy ? 'reload laptop deck' : !started ? 'tap to start' : paused ? 'paused' : over > 0 ? `+${mmss(over)} over` : status.toLowerCase();

  return (
    <div className={`pv${showPreview ? ' pv-has-preview' : ''}`}>
      <header className="pv-top">
        <span className="pv-where">{scene.label} <b>{pos.step + 1}/{pos.stepCount}</b></span>
        <span className="pv-meta">
          <button className="pv-timer-btn" onClick={() => setTimerOpen(true)} aria-label={`Timer ${timerText}, ${shortStatus}. Open timer options`}>
            <span className="pv-time">{timerText}</span>
            <span className={`pv-status pv-${tone}`}>{shortStatus}</span>
          </button>
          <span className={`pv-dot ${connected ? 'pv-ok' : 'pv-fail'}`} role="img" aria-label={connected ? 'live' : 'offline'}>●</span>
        </span>
      </header>

      {showPreview && <SlidePreview scene={scene} step={pos.step} count={pos.stepCount} />}

      <section className="pv-fold" aria-label="Notes for this step">
        <div className="pv-label">Say now</div>
        {cue && cues ? (
          <FitText big deps={`${scene.id}:cue:${cueIdx}`}>
            <div className="pv-cue-phase">{cue.phase}<span>{cueIdx + 1} / {cues.length}</span></div>
            <p className="pv-cue-say">{cue.say}</p>
            {cue.do && <p className="pv-cue-do">{cue.do}</p>}
            {cueNext && <p className="pv-cue-next"><b>Next · {cueNext.phase}</b> {cueNext.say}</p>}
          </FitText>
        ) : (
          <p className="pv-empty">{notesError ? 'Notes unavailable: re-pair this device at /?pair=presenter.' : notesMap ? 'No notes for this step.' : 'Loading notes…'}</p>
        )}
      </section>

      {/* Reads top to bottom in the order you use it: say now (above), then name, next, asked, reference. */}
      <div className="pv-more">
        {sceneNotes?.principle && <p className="pv-principle"><b>Principle:</b> {sceneNotes.principle}</p>}

        {/* On a scripted slide the next line is already previewed under the current one. */}
        {!(cues && nextIsSameScene) && <div className="pv-card">
          <h2>Up next{nextScene && !nextIsSameScene ? ` · ${nextScene.label}` : ''}</h2>
          {nextScene ? (
            upNext ? <p className="pv-upnext"><b>{upNext.phase}</b> {upNext.say}</p> : <p className="pv-empty">No notes.</p>
          ) : (
            <p className="pv-empty">End of the deck.</p>
          )}
        </div>}

        {sceneNotes?.qa && sceneNotes.qa.length > 0 && (
          <div className="pv-card">
            <h2>If asked</h2>
            <dl>
              {sceneNotes.qa.map(([q, a]) => (
                <div key={q}><dt>{q}</dt><dd>{a}</dd></div>
              ))}
            </dl>
          </div>
        )}

        {cues && (
          <div className="pv-card">
            <h2>The whole script, in order</h2>
            <ol className="pv-script">
              {cues.map((c, i) => (
                <li key={i} className={i === cueIdx ? 'is-now' : ''}><b>{c.phase}</b> {c.say}</li>
              ))}
            </ol>
          </div>
        )}

        {sceneNotes?.reminders && sceneNotes.reminders.length > 0 && (
          <div className="pv-card">
            <h2>Remember</h2>
            <ul>{sceneNotes.reminders.map((r, i) => <li key={i}>{r}</li>)}</ul>
          </div>
        )}

        {(sceneNotes?.goal || sceneNotes?.timing) && (
          <div className="pv-card">
            <h2>About this section</h2>
            <ul>
              {sceneNotes?.goal && <li>{sceneNotes.goal}</li>}
              {sceneNotes?.timing ? <li>{sceneNotes.timing}</li> : <li>Window: {start}–{end} min.</li>}
            </ul>
          </div>
        )}

        {controls && controls.length > 0 && (
          <div className="pv-tools">
            {controls.map(({ label, key }) => (
              <button key={`${label}:${key}`} onClick={(e) => { e.currentTarget.blur(); sendKey(key); }}>{label}</button>
            ))}
          </div>
        )}
        <div className="pv-tools">
          <button onClick={(e) => { e.currentTarget.blur(); sendKey('Home'); }}>Home</button>
          <button onClick={(e) => { e.currentTarget.blur(); post({ type: 'timer', timer: { op: 'reset' } }); }}>Reset timer</button>
        </div>
      </div>

      {timerOpen && (
        <TimerModal
          elapsedMs={elapsedMsNow}
          started={started}
          paused={paused}
          legacy={legacy}
          scene={scene.label}
          window={scene.window}
          onOp={(op: TimerOp) => post({ type: 'timer', timer: op })}
          onClose={() => setTimerOpen(false)}
        />
      )}

      <nav className="pv-nav" aria-label="Slide controls">
        <button onClick={(e) => { e.currentTarget.blur(); sendKey('ArrowLeft'); }}>← Back</button>
        <button className="pv-next" onClick={(e) => { e.currentTarget.blur(); sendKey('ArrowRight'); }}>Next →</button>
      </nav>
    </div>
  );
}
