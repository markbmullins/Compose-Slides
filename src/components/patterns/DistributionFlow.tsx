import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { delayFor, ease, type Common } from './shared';

export interface DistributionFlowProps extends Common {
  outcomes: readonly { label: string; value: number; color?: string }[];
  totalLabel?: string;
  format?: (value: number) => string;
  duration?: number;
  show?: boolean;
}
/** A compact animated distribution, often called a Sankey-style flow. */
export function DistributionFlow({
  outcomes,
  totalLabel = 'Total',
  format = String,
  duration = 1.6,
  show = true,
  accent,
  className = '',
}: DistributionFlowProps) {
  const reduce = useReducedMotion();
  const total = outcomes.reduce((n, o) => n + Math.max(0, o.value), 0);
  return (
    <div
      className={`cs-distribution ${className}`}
      style={{ '--cs-accent': accent ?? 'var(--accent)' } as CSSProperties}
      role="img"
      aria-label={`${totalLabel}: ${outcomes.map((o) => `${o.label} ${format(o.value)}`).join(', ')}`}
    >
      <div className="cs-distribution-source">
        <strong>{format(total)}</strong>
        <span>{totalLabel}</span>
      </div>
      <svg
        className="cs-distribution-branches"
        viewBox={`0 0 90 ${Math.max(180, outcomes.length * 60)}`}
        aria-hidden="true"
      >
        {outcomes.map((o, i) => {
          const h = Math.max(180, outcomes.length * 60),
            y = ((i + 0.5) * h) / outcomes.length;
          return (
            <g key={o.label}>
              <motion.path
                d={`M0 ${h / 2} C45 ${h / 2},45 ${y},90 ${y}`}
                fill="none"
                stroke={o.color ?? 'var(--cs-accent)'}
                strokeWidth="2"
                initial={false}
                animate={{ pathLength: show ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : duration, delay: delayFor(i, duration * 0.2, !!reduce) }}
              />
              {!reduce && (
                <motion.circle
                  r="3"
                  fill={o.color ?? 'var(--cs-accent)'}
                  initial={false}
                  animate={{ cx: [0, 90], cy: [h / 2, y], opacity: [0, 1, 0] }}
                  transition={{ duration: 2, delay: i * 0.35, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="cs-distribution-outcomes">
        {outcomes.map((o, i) => (
          <motion.div
            key={o.label}
            className="cs-distribution-row"
            initial={false}
            animate={{ opacity: show ? 1 : 0, x: show ? 0 : -20 }}
            transition={{
              duration: reduce ? 0 : duration * 0.45,
              delay: delayFor(i, duration * 0.2, !!reduce),
              ease,
            }}
          >
            <motion.div
              className="cs-distribution-bar"
              style={{ background: o.color ?? 'var(--cs-accent)' }}
              initial={false}
              animate={{ width: show ? `${total ? Math.max(3, (o.value / total) * 100) : 0}%` : 0 }}
              transition={{
                duration: reduce ? 0 : duration,
                delay: delayFor(i, duration * 0.2, !!reduce),
                ease,
              }}
            />
            <span>{o.label}</span>
            <strong>{format(o.value)}</strong>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
