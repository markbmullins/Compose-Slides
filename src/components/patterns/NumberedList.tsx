import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { delayFor, ease, type Common } from './shared';

export interface NumberedListProps extends Common {
  items: readonly { title: ReactNode; detail?: ReactNode }[];
  start?: number;
  show?: number;
  stagger?: number;
  formatNumber?: (number: number) => string;
}
export function NumberedList({
  items,
  start = 1,
  show = items.length,
  stagger = 0.18,
  formatNumber = (n) => String(n).padStart(2, '0'),
  accent,
  className = '',
}: NumberedListProps) {
  const reduce = useReducedMotion();
  return (
    <ol
      className={`cs-numbered-list ${className}`}
      style={{ '--cs-accent': accent ?? 'var(--accent)' } as CSSProperties}
    >
      {items.map((item, i) => (
        <motion.li
          key={i}
          initial={false}
          animate={{ opacity: i < show ? 1 : 0, y: i < show ? 0 : 16 }}
          transition={{ duration: reduce ? 0 : 0.6, delay: delayFor(i, stagger, !!reduce), ease }}
        >
          <span>{formatNumber(start + i)}</span>
          <div>
            <strong>{item.title}</strong>
            {item.detail && <p>{item.detail}</p>}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
