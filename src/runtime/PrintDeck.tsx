import { useCallback, useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { STAGE_HEIGHT, STAGE_WIDTH, type SceneDef } from './types';
import type { PrintOptions } from './print';
import './print.css';

const noop = () => {};
/** Time for opacity fades and count-ups to settle before the page is printed. */
const SETTLE_MS = 2500;

interface Group {
  def: SceneDef;
  variant?: string;
  label?: string;
  finalOnly: boolean;
}

/** One scene (optionally in a variant). It learns its real step count from the scene, then renders a page per step. */
function PrintGroup({ group }: { group: Group }) {
  const { def, variant, finalOnly } = group;
  const [count, setCount] = useState(def.steps);
  const setStepCount = useCallback((n: number) => setCount(Math.max(1, Math.floor(n))), []);
  const steps = finalOnly ? [count - 1] : Array.from({ length: count }, (_, i) => i);
  const Scene = def.Component;

  return (
    <>
      {steps.map((step) => (
        <section
          key={step}
          className="stage print-page"
          style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
          data-scene={def.id}
          data-step={step}
        >
          <div className="scene-layer">
            <Scene step={step} setStepCount={setStepCount} goToStep={noop} variant={variant} print />
          </div>
          {group.label && <div className="print-variant-tag mono">{group.label}</div>}
        </section>
      ))}
    </>
  );
}

export default function PrintDeck({ scenes, options }: { scenes: SceneDef[]; options: PrintOptions }) {
  const selected = options.scenes ? scenes.filter((s) => options.scenes!.includes(s.id)) : scenes;

  const groups: Group[] = selected.flatMap((def) => [
    { def, finalOnly: options.mode === 'final' },
    ...(def.printVariants ?? []).map((v) => ({ def, variant: v.variant, label: v.label, finalOnly: true })),
  ]);

  // Signal readiness to the export script once fonts are loaded and animations have settled.
  useEffect(() => {
    let cancelled = false;
    document.fonts.ready.then(() => {
      window.setTimeout(() => {
        if (!cancelled) document.documentElement.dataset.printReady = 'true';
      }, SETTLE_MS);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <MotionConfig reducedMotion="always">
      <main className="print-root">
        {groups.map((g) => (
          <PrintGroup key={`${g.def.id}:${g.variant ?? ''}`} group={g} />
        ))}
      </main>
    </MotionConfig>
  );
}
