import type { ReactNode } from 'react';
import { motion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

export interface StaggeredItemProps {
  index: number;
  children: ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: number;
  duration?: number;
  reduce?: boolean;
}

/** Enter one item after another without tying content to a specific layout. */
export function StaggeredItem({ index, children, className, y = 16, delay = 0, stagger = 0.2, duration = 0.6, reduce = false }: StaggeredItemProps) {
  return <motion.div className={className} initial={{ opacity: 0, y: reduce ? 0 : y }} animate={{ opacity: 1, y: 0 }} transition={{ duration, delay: delay + index * stagger, ease: EASE }}>{children}</motion.div>;
}
