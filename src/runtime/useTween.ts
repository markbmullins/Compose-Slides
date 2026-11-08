import { useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';

interface TweenOpts {
  /** Starting value on mount (defaults to the target, i.e. no initial tween). */
  from?: number;
  duration?: number;
  ease?: 'easeOut' | 'easeInOut' | 'linear';
}

/** Count a number toward `target`. Numbers tick; they never jump. */
export function useTween(target: number, { from, duration = 0.8, ease = 'easeOut' }: TweenOpts = {}): number {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(from ?? target);
  const cur = useRef(value);

  useEffect(() => {
    if (reduced || cur.current === target) {
      cur.current = target;
      setValue(target);
      return;
    }
    const controls = animate(cur.current, target, {
      duration,
      ease,
      onUpdate: (v) => {
        cur.current = v;
        setValue(v);
      },
    });
    return () => controls.stop();
  }, [target, duration, ease, reduced]);

  return value;
}
