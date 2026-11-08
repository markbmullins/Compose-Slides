import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { delayFor, ease, monthsBetween, type Common } from './shared';

export interface TimelineEvent {
  date: string;
  title: string;
  label?: string;
  detail?: string;
  color?: string;
}
export interface TimelineProps extends Common {
  events: readonly TimelineEvent[];
  active?: number;
  showSpans?: boolean;
  formatSpan?: (from: string, to: string) => string;
  stagger?: number;
}
export function Timeline({
  events,
  active = events.length - 1,
  showSpans = true,
  formatSpan,
  stagger = 0.3,
  accent,
  className = '',
}: TimelineProps) {
  const reduce = useReducedMotion();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div
      className={`cs-timeline ${className}`}
      style={{ '--cs-accent': accent ?? 'var(--accent)' } as CSSProperties}
    >
      <div className="cs-timeline-axis">
        <motion.div
          className="cs-timeline-line"
          initial={false}
          animate={{ scaleX: active >= 0 ? 1 : 0 }}
          transition={{ duration: reduce ? 0 : 1, ease }}
        />
      </div>
      <div className="cs-timeline-events">
        {sorted.map((e, i) => (
          <motion.div
            key={`${e.date}-${i}`}
            className={`cs-timeline-event${i === active ? ' is-active' : ''}`}
            initial={false}
            animate={{ opacity: active >= i ? 1 : 0, y: active >= i ? 0 : 20 }}
            transition={{ duration: reduce ? 0 : 0.55, delay: delayFor(i, stagger, !!reduce), ease }}
          >
            <div className="cs-timeline-dot" style={{ background: e.color ?? 'var(--cs-accent)' }} />
            <time>{e.label ?? e.date}</time>
            <strong>{e.title}</strong>
            {e.detail && <p>{e.detail}</p>}
            {showSpans && i < sorted.length - 1 && (
              <small>
                {formatSpan?.(e.date, sorted[i + 1].date) ??
                  `${monthsBetween(e.date, sorted[i + 1].date)} months`}
              </small>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
