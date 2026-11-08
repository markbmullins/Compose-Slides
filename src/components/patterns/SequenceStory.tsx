import { useReducedMotion } from 'motion/react';
import { useEffect, useState, type CSSProperties } from 'react';
import { SequenceDiagram } from '../SequenceDiagram';
import type { Common } from './shared';

export interface SequenceStoryProps extends Common {
  lanes: readonly string[];
  calls: readonly { from: string; to: string; label: string; color?: string; dashed?: boolean }[];
  interval?: number;
  width?: number;
  playing?: boolean;
}
/** A sequence diagram that lays out lanes and plays calls automatically. */
export function SequenceStory({
  lanes,
  calls,
  interval = 1,
  width = 1040,
  playing = true,
  accent,
  className = '',
}: SequenceStoryProps) {
  const reduce = useReducedMotion();
  const [time, setTime] = useState(reduce ? calls.length * interval + 1 : 0);
  useEffect(() => {
    if (reduce) {
      setTime(calls.length * interval + 1);
      return;
    }
    if (!playing) return;
    const start = performance.now();
    const timer = window.setInterval(() => setTime((performance.now() - start) / 1000), 32);
    return () => window.clearInterval(timer);
  }, [calls.length, interval, playing, reduce]);
  const positioned = lanes.map((name, i) => ({ id: name, name, x: ((i + 1) * width) / (lanes.length + 1) }));
  return (
    <div className={className} style={accent ? ({ '--accent': accent } as CSSProperties) : undefined}>
      <SequenceDiagram
        time={time}
        width={width}
        lanes={positioned}
        calls={calls.map((call, i) => ({ ...call, at: i * interval }))}
      />
    </div>
  );
}
