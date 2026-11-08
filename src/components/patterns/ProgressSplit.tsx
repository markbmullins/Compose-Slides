import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { ease, type Common } from './shared';

export interface ProgressSplitProps extends Common {
  total: number;
  used: number;
  labels?: { total?: string; used?: string; remaining?: string };
  format?: (value: number) => string;
  duration?: number;
  show?: boolean;
}
/** A total that fills, then resolves into used and remaining portions. */
export function ProgressSplit({
  total,
  used,
  labels = {},
  format = String,
  duration = 2.4,
  show = true,
  accent,
  className = '',
}: ProgressSplitProps) {
  const reduce = useReducedMotion();
  const remaining = Math.max(0, total - used);
  const pct = total > 0 ? Math.min(100, Math.max(0, (used / total) * 100)) : 0;
  const dur = reduce ? 0 : duration;
  return (
    <div
      className={`cs-progress-split ${className}`}
      style={{ '--cs-accent': accent ?? 'var(--accent)' } as CSSProperties}
    >
      <motion.div className="cs-progress-total" initial={false} animate={{ opacity: show ? 1 : 0 }}>
        {format(total)} <span>{labels.total ?? 'total'}</span>
      </motion.div>
      <div
        className="cs-progress-track"
        role="img"
        aria-label={`${format(used)} ${labels.used ?? 'used'} of ${format(total)} ${labels.total ?? 'total'}`}
      >
        <motion.div
          className="cs-progress-used"
          initial={false}
          animate={{ width: show ? `${pct}%` : '0%' }}
          transition={{ duration: dur * 0.55, delay: dur * 0.22, ease }}
        />
        <motion.div
          className="cs-progress-remaining"
          initial={false}
          animate={{ opacity: show ? 1 : 0 }}
          transition={{ duration: dur * 0.2, delay: dur * 0.7 }}
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="cs-progress-legend">
        <motion.span initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: dur * 0.55 }}>
          {format(used)} {labels.used ?? 'used'}
        </motion.span>
        <motion.span initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ delay: dur * 0.78 }}>
          {format(remaining)} {labels.remaining ?? 'remaining'}
        </motion.span>
      </div>
    </div>
  );
}
