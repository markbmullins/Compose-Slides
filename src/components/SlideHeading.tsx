import type { ReactNode } from 'react';
import './components.css';

export interface SlideHeadingProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  titleAs?: 'h1' | 'h2';
  className?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

/** A presentation heading with optional section label and supporting line. */
export function SlideHeading({ eyebrow, title, subtitle, titleAs: Title = 'h1', className = '', eyebrowClassName = '', titleClassName = '', subtitleClassName = '' }: SlideHeadingProps) {
  return <div className={`cs-heading ${className}`.trim()}>
    {eyebrow != null && <div className={`cs-heading-eyebrow ${eyebrowClassName}`.trim()}>{eyebrow}</div>}
    <Title className={`cs-heading-title ${titleClassName}`.trim()}>{title}</Title>
    {subtitle != null && <p className={`cs-heading-subtitle ${subtitleClassName}`.trim()}>{subtitle}</p>}
  </div>;
}
