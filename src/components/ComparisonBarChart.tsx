import { motion } from 'motion/react';
import './components.css';

const EASE = [0.22, 1, 0.36, 1] as const;

export interface ComparisonBar {
  id: string;
  label: string;
  value: number;
  note?: string;
  color?: string;
}

export interface ComparisonBarChartProps {
  bars: readonly ComparisonBar[];
  max: number;
  ticks?: readonly number[];
  show?: boolean;
  width?: number;
  plotWidth?: number;
  rowHeight?: number;
  barHeight?: number;
  axisHeight?: number;
  formatValue?: (value: number) => string;
  ariaLabel: string;
  className?: string;
}

/** An animated, labeled horizontal bar comparison for a fixed-size slide. */
export function ComparisonBarChart({ bars, max, ticks = [], show = true, width = 1600, plotWidth = 1360, rowHeight = 92, barHeight = 40, axisHeight = 40, formatValue = String, ariaLabel, className = '' }: ComparisonBarChartProps) {
  const x = (value: number) => (value / max) * plotWidth;
  const height = bars.length * rowHeight + axisHeight;
  return <svg className={`cs-comparison-chart ${className}`.trim()} width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
    {ticks.map((tick, index) => <g key={tick}>
      <motion.line className="cs-comparison-grid" x1={x(tick)} x2={x(tick)} y1={0} y2={bars.length * rowHeight} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.5, delay: show ? index * 0.05 : 0 }} />
      <motion.text className="cs-comparison-tick" x={x(tick)} y={bars.length * rowHeight + 28} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.5, delay: show ? 0.2 : 0 }}>{formatValue(tick)}</motion.text>
    </g>)}
    {bars.map((bar, index) => {
      const y = index * rowHeight;
      const barWidth = x(bar.value);
      const delay = show ? 0.25 + index * 0.18 : 0;
      return <g key={bar.id}>
        <motion.text className="cs-comparison-rowlabel" x={0} y={y + 24} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.5, delay }}>{bar.label}</motion.text>
        <motion.rect x={0} y={y + 36} height={barHeight} rx={7} fill={bar.color ?? 'var(--accent)'} initial={false} animate={{ width: show ? barWidth : 0 }} transition={{ duration: show ? 0.9 : 0.3, delay, ease: EASE }} />
        <motion.text x={barWidth + 20} y={y + 36 + barHeight / 2 + 10} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.5, delay: show ? delay + 0.6 : 0 }}>
          <tspan className="cs-comparison-value">{formatValue(bar.value)}</tspan>
          {bar.note && <tspan className="cs-comparison-note" dx="14">{bar.note}</tspan>}
        </motion.text>
      </g>;
    })}
  </svg>;
}
