import type { CSSProperties, ReactNode } from 'react';
import './components.css';

/** Full-stage scene surface with a safe place for presentation-specific layout. */
export function SlideFrame({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`od-slide-frame ${className}`.trim()} style={style}>{children}</div>;
}
