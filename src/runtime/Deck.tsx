import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { STAGE_HEIGHT, STAGE_WIDTH, type SceneDef } from './types';
import { useDeckKeys } from './useDeckKeys';
import ProgressBar from './ProgressBar';
import PresenterOverlay from './PresenterOverlay';
import { useDeckSync, type DeckCommand } from './sync';
import { IDLE, applyTimer, type TimerOp, type TimerState } from './timer';
import './deck.css';

interface State { scene: number; step: number; counts: Record<string, number> }
type Action =
  | { type: 'next' | 'prev' | 'home' | 'end' }
  | { type: 'count'; id: string; count: number }
  | { type: 'step'; step: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function makeReducer(scenes: SceneDef[]) {
  const count = (s: State, i: number) => s.counts[scenes[i].id] ?? scenes[i].steps;
  return (s: State, a: Action): State => {
    const last = scenes.length - 1;
    switch (a.type) {
      case 'next':
        if (s.step < count(s, s.scene) - 1) return { ...s, step: s.step + 1 };
        return s.scene < last ? { ...s, scene: s.scene + 1, step: 0 } : s;
      case 'prev':
        if (s.step > 0) return { ...s, step: s.step - 1 };
        return s.scene > 0 ? { ...s, scene: s.scene - 1, step: count(s, s.scene - 1) - 1 } : s;
      case 'home': return { ...s, scene: 0, step: 0 };
      case 'end': return { ...s, scene: last, step: 0 };
      case 'step': return { ...s, step: clamp(a.step, 0, count(s, s.scene) - 1) };
      case 'count': {
        const n = Math.max(1, Math.floor(a.count));
        const counts = { ...s.counts, [a.id]: n };
        const step = scenes[s.scene].id === a.id ? Math.min(s.step, n - 1) : s.step;
        return { ...s, counts, step };
      }
    }
  };
}

function initialState(scenes: SceneDef[]): State {
  const [id, raw] = window.location.hash.slice(1).split('/');
  const scene = Math.max(0, scenes.findIndex((s) => s.id === id));
  const step = clamp(parseInt(raw ?? '0', 10) || 0, 0, scenes[scene].steps - 1);
  return { scene, step, counts: {} };
}

function useStageScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const fit = () => setScale(Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT));
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return scale;
}

export default function Deck({ scenes }: { scenes: SceneDef[] }) {
  const reducer = useMemo(() => makeReducer(scenes), [scenes]);
  const [state, dispatch] = useReducer(reducer, scenes, initialState);
  const [showPresenter, setShowPresenter] = useState(false);
  const [timer, setTimer] = useState<TimerState>(IDLE);
  const runTimer = useCallback((o: TimerOp) => setTimer((t) => applyTimer(t, o, Date.now())), []);
  const scale = useStageScale();
  const reduced = useReducedMotion();

  const def = scenes[state.scene];
  const stepCount = state.counts[def.id] ?? def.steps;

  const setStepCount = useCallback((count: number) => dispatch({ type: 'count', id: def.id, count }), [def.id]);
  const goToStep = useCallback((step: number) => dispatch({ type: 'step', step }), []);

  useEffect(() => {
    history.replaceState(null, '', `#${def.id}/${state.step}`);
  }, [def.id, state.step]);

  const nav = useCallback((type: 'next' | 'prev' | 'home' | 'end') => () => {
    setTimer((t) => (t.startedAt == null ? applyTimer(t, { op: 'start' }, Date.now()) : t));
    dispatch({ type });
  }, []);

  const handlers = useMemo(() => ({
    next: nav('next'), prev: nav('prev'), home: nav('home'), end: nav('end'),
    fullscreen: () => {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen();
    },
    presenter: () => setShowPresenter((v) => !v),
    resetTimer: () => { if (showPresenter) runTimer({ op: 'reset' }); },
  }), [nav, showPresenter, runTimer]);
  useDeckKeys(handlers);

  // Mirror position to the presenter window, and obey its navigation commands.
  const onRemote = useCallback((c: DeckCommand) => {
    if (c === 'resetTimer') runTimer({ op: 'reset' });
    else handlers[c]();
  }, [handlers, runTimer]);
  useDeckSync({ sceneId: def.id, step: state.step, stepCount, startedAt: timer.startedAt, pausedAt: timer.pausedAt }, onRemote, runTimer);

  const Scene = def.Component;
  const y = reduced ? 0 : 24;

  return (
    <div className="deck-root">
      <div
        className="stage"
        style={{
          width: STAGE_WIDTH,
          height: STAGE_HEIGHT,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={def.id}
            className="scene-layer"
            initial={{ opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -y }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Scene step={state.step} setStepCount={setStepCount} goToStep={goToStep} />
          </motion.div>
        </AnimatePresence>
        <ProgressBar scenes={scenes} scene={state.scene} step={state.step} stepCount={stepCount} />
        {showPresenter && (
          <PresenterOverlay
            timer={timer}
            scene={def}
            next={scenes[state.scene + 1]}
            step={state.step}
            stepCount={stepCount}
          />
        )}
      </div>
    </div>
  );
}
