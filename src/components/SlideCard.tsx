import type { HTMLAttributes } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import './components.css';

/** A token-driven surface for roles, metrics, options, and diagram details. */
export function SlideCard({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`cs-card ${className}`.trim()} {...props} />;
}

/** Motion-enabled card with the same surface styling. */
export function MotionCard({ className = '', ...props }: HTMLMotionProps<'div'>) {
  return <motion.div className={`cs-card ${className}`.trim()} {...props} />;
}
