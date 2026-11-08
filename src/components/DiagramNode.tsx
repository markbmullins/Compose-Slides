import type { ReactNode } from 'react';
import Reveal from '../runtime/Reveal';
import './components.css';

export interface DiagramNodeProps {
  x: number;
  y: number;
  show?: boolean;
  delay?: number;
  className?: string;
  children: ReactNode;
}

/** Position and reveal a node on a fixed-size diagram canvas. */
export function DiagramNode({ x, y, show = true, delay = 0, className = '', children }: DiagramNodeProps) {
  return <Reveal show={show} delay={delay} style={{ position: 'absolute', left: x, top: y }}>
    <div className={`cs-diagram-node ${className}`.trim()} style={{ position: 'static' }}>{children}</div>
  </Reveal>;
}
