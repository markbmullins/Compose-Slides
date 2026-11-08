import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';

interface Props {
  show: boolean;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Fades and lifts content in when `show` becomes true; reverses going back. */
export default function Reveal({ show, delay = 0, className, style, children }: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 14 }}
      transition={{ duration: 0.6, delay: show ? delay : 0, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
