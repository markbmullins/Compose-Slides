import { motion } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

export interface DrawPathProps {
  d: string;
  show: boolean;
  delay?: number;
  duration?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

/** Animate an SVG path from hidden to fully drawn. Place it inside an SVG. */
export function DrawPath({ d, show, delay = 0, duration = 0.5, color = 'currentColor', className, strokeWidth = 2 }: DrawPathProps) {
  return <motion.path
    d={d} fill="none" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
    className={className} style={{ stroke: color }} initial={false}
    animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
    transition={{ duration: show ? duration : 0.2, delay: show ? delay : 0, ease: EASE }}
  />;
}
