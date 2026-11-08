import { useEffect, useRef } from 'react';
import { animate } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;
const defaultFormat = (value: number) => Math.round(value).toLocaleString('en-US');

export interface CountUpProps {
  value: number;
  delay?: number;
  duration?: number;
  reduce?: boolean;
  format?: (value: number) => string;
  className?: string;
}

/** Animate a numeric text value; pass `reduce` for a settled reduced-motion state. */
export function CountUp({ value, delay = 0, duration = 1.6, reduce = false, format = defaultFormat, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) { el.textContent = format(value); return; }
    const control = animate(0, value, { duration, delay, ease: EASE, onUpdate: (current) => { el.textContent = format(current); } });
    return () => control.stop();
  }, [value, delay, duration, reduce, format]);
  return <span ref={ref} className={className}>0</span>;
}
