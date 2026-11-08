import type { ReactNode } from 'react';
import Reveal from '../runtime/Reveal';

/** Reveal one item per step while preserving earlier items on screen. */
export function StepSequence<T>({ step, items, renderItem, className }: { step: number; items: readonly T[]; renderItem: (item: T, index: number) => ReactNode; className?: string }) {
  return <div className={className}>{items.map((item, index) => <Reveal key={index} show={step >= index}>{renderItem(item, index)}</Reveal>)}</div>;
}
