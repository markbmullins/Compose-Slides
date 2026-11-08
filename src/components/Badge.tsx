import type { HTMLAttributes } from 'react';
import './components.css';

/** Compact label for state, category, or timing. */
export function Badge({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`cs-badge ${className}`.trim()} {...props} />;
}
