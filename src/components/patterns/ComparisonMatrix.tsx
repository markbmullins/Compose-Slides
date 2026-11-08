import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import { delayFor, type Common } from './shared';

export interface ComparisonMatrixProps extends Common {
  columns: readonly string[];
  rows: readonly { label: string; values: readonly string[] }[];
  revealColumn?: number;
  show?: boolean;
  stagger?: number;
}
export function ComparisonMatrix({
  columns,
  rows,
  revealColumn,
  show = true,
  stagger = 0.22,
  accent,
  className = '',
}: ComparisonMatrixProps) {
  const reduce = useReducedMotion();
  return (
    <div
      className={`cs-matrix ${className}`}
      style={
        {
          '--cs-accent': accent ?? 'var(--accent)',
          gridTemplateColumns: `minmax(160px,1.25fr) repeat(${columns.length}, minmax(110px,1fr))`,
        } as CSSProperties
      }
      role="table"
    >
      <div role="row" className="cs-matrix-row">
        <span role="columnheader" />
        {columns.map((c) => (
          <strong role="columnheader" key={c}>
            {c}
          </strong>
        ))}
      </div>
      {rows.map((row, i) => (
        <div role="row" className="cs-matrix-row" key={row.label}>
          <span role="rowheader">{row.label}</span>
          {columns.map((c, j) => (
            <motion.span
              key={c}
              role="cell"
              className={j === revealColumn ? 'is-accent' : ''}
              initial={false}
              animate={{ opacity: show || j !== revealColumn ? 1 : 0, y: show || j !== revealColumn ? 0 : 8 }}
              transition={{
                duration: reduce ? 0 : 0.45,
                delay: j === revealColumn ? delayFor(i, stagger, !!reduce) : 0,
              }}
            >
              {row.values[j] ?? '—'}
            </motion.span>
          ))}
        </div>
      ))}
    </div>
  );
}
