import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { delayFor, ease, type Common } from './shared';

export interface RoadmapItem {
  title: string;
  detail?: string;
}
export interface RoadmapProps extends Common {
  now: readonly RoadmapItem[];
  next: readonly RoadmapItem[];
  step: number;
  nextAt?: number;
  headings?: { now?: string; next?: string };
  stagger?: number;
}
export function Roadmap({
  now,
  next,
  step,
  nextAt = now.length,
  headings = {},
  stagger = 0.14,
  accent,
  className = '',
}: RoadmapProps) {
  const reduce = useReducedMotion();
  const expanded = step >= nextAt;
  return (
    <div
      className={`cs-roadmap ${className}`}
      style={{ '--cs-accent': accent ?? 'var(--accent)' } as CSSProperties}
    >
      <motion.section
        className="cs-roadmap-now"
        initial={false}
        animate={{ flexBasis: expanded ? '40%' : '100%' }}
        transition={{ duration: reduce ? 0 : 0.7, ease }}
      >
        <h3>{headings.now ?? 'Now'}</h3>
        {now.map((item, i) => (
          <motion.div
            className="cs-roadmap-item"
            key={item.title}
            initial={false}
            animate={{ opacity: step >= i ? 1 : 0, y: step >= i ? 0 : 14 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: delayFor(i, stagger, !!reduce) }}
          >
            <span className="cs-roadmap-mark" />
            <div>
              <strong>{item.title}</strong>
              {item.detail && <p>{item.detail}</p>}
            </div>
          </motion.div>
        ))}
      </motion.section>
      {expanded && (
        <section className="cs-roadmap-next">
          <h3>{headings.next ?? 'Next'}</h3>
          {next.map((item, i) => (
            <motion.article
              key={item.title}
              initial={false}
              animate={{ opacity: step >= nextAt + i ? 1 : 0, y: step >= nextAt + i ? 0 : 18 }}
              transition={{ duration: reduce ? 0 : 0.55, delay: delayFor(i, stagger, !!reduce) }}
            >
              <small>{String(i + 1).padStart(2, '0')}</small>
              <strong>{item.title}</strong>
              {item.detail && <p>{item.detail}</p>}
            </motion.article>
          ))}
        </section>
      )}
    </div>
  );
}
