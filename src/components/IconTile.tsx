import type { HTMLAttributes } from 'react';
import './components.css';

/** A framed icon surface that composes inside a card or diagram node. */
export function IconTile({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`cs-icon-tile ${className}`.trim()} {...props} />;
}
