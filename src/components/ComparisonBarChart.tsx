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
  plotHeight?: number;
  rowHeight?: number;
  barHeight?: number;
  axisHeight?: number;
  formatValue?: (value: number) => string;
  ariaLabel: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  animation?: { duration?: number; stagger?: number };
}

/** An animated, labeled bar comparison in either orientation. */
export function ComparisonBarChart({
  bars,
  max,
  ticks = [],
  show = true,
  width,
  plotWidth,
  plotHeight,
  rowHeight = 92,
  barHeight,
  axisHeight = 40,
  formatValue = String,
  ariaLabel,
  className = '',
  orientation = 'horizontal',
  animation = {},
}: ComparisonBarChartProps) {
  const chartWidth = width ?? (orientation === 'vertical' ? 900 : 1600);
  const plotExtent = plotWidth ?? 1360;
  const thickness = barHeight ?? (orientation === 'vertical' ? 72 : 40);
  if (orientation === 'vertical') {
    const chartHeight = plotHeight ?? 480;
    const gap = chartWidth / Math.max(1, bars.length);
    const x0 = gap / 2;
    const scale = (value: number) =>
      Math.max(0, Math.min(chartHeight, (value / Math.max(1, max)) * chartHeight));
    return (
      <svg
        className={`cs-comparison-chart ${className}`.trim()}
        width={chartWidth}
        height={chartHeight + 100}
        viewBox={`0 0 ${chartWidth} ${chartHeight + 100}`}
        role="img"
        aria-label={ariaLabel}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              className="cs-comparison-grid"
              x1={0}
              x2={chartWidth}
              y1={chartHeight - scale(tick)}
              y2={chartHeight - scale(tick)}
            />
            <text className="cs-comparison-tick" x={0} y={chartHeight - scale(tick) - 8}>
              {formatValue(tick)}
            </text>
          </g>
        ))}
        {bars.map((bar, index) => {
          const h = scale(bar.value),
            x = x0 + index * gap - thickness / 2;
          const delay = show ? 0.25 + index * (animation.stagger ?? 0.18) : 0;
          return (
            <g key={bar.id}>
              <motion.rect
                x={x}
                width={thickness}
                rx={7}
                fill={bar.color ?? 'var(--accent)'}
                initial={false}
                animate={{ y: show ? chartHeight - h : chartHeight, height: show ? h : 0 }}
                transition={{ duration: show ? (animation.duration ?? 0.9) : 0.3, delay, ease: EASE }}
              />
              <motion.text
                x={x0 + index * gap}
                y={chartHeight - h - 14}
                className="cs-comparison-value"
                textAnchor="middle"
                initial={false}
                animate={{ opacity: show ? 1 : 0 }}
                transition={{ delay: delay + 0.4 }}
              >
                {formatValue(bar.value)}
              </motion.text>
              <text
                x={x0 + index * gap}
                y={chartHeight + 32}
                className="cs-comparison-rowlabel"
                textAnchor="middle"
              >
                {bar.label}
              </text>
              {bar.note && (
                <text
                  x={x0 + index * gap}
                  y={chartHeight + 58}
                  className="cs-comparison-note"
                  textAnchor="middle"
                >
                  {bar.note}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  }
  const x = (value: number) => (value / Math.max(1, max)) * plotExtent;
  const height = bars.length * rowHeight + axisHeight;
  return (
    <svg
      className={`cs-comparison-chart ${className}`.trim()}
      width={chartWidth}
      height={height}
      viewBox={`0 0 ${chartWidth} ${height}`}
      role="img"
      aria-label={ariaLabel}
    >
      {ticks.map((tick, index) => (
        <g key={tick}>
          <motion.line
            className="cs-comparison-grid"
            x1={x(tick)}
            x2={x(tick)}
            y1={0}
            y2={bars.length * rowHeight}
            initial={false}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ duration: 0.5, delay: show ? index * 0.05 : 0 }}
          />
          <motion.text
            className="cs-comparison-tick"
            x={x(tick)}
            y={bars.length * rowHeight + 28}
            initial={false}
            animate={{ opacity: show ? 1 : 0 }}
            transition={{ duration: 0.5, delay: show ? 0.2 : 0 }}
          >
            {formatValue(tick)}
          </motion.text>
        </g>
      ))}
      {bars.map((bar, index) => {
        const y = index * rowHeight;
        const barWidth = x(bar.value);
        const delay = show ? 0.25 + index * (animation.stagger ?? 0.18) : 0;
        return (
          <g key={bar.id}>
            <motion.text
              className="cs-comparison-rowlabel"
              x={0}
              y={y + 24}
              initial={false}
              animate={{ opacity: show ? 1 : 0 }}
              transition={{ duration: 0.5, delay }}
            >
              {bar.label}
            </motion.text>
            <motion.rect
              x={0}
              y={y + 36}
              height={thickness}
              rx={7}
              fill={bar.color ?? 'var(--accent)'}
              initial={false}
              animate={{ width: show ? barWidth : 0 }}
              transition={{ duration: show ? (animation.duration ?? 0.9) : 0.3, delay, ease: EASE }}
            />
            <motion.text
              x={barWidth + 20}
              y={y + 36 + thickness / 2 + 10}
              initial={false}
              animate={{ opacity: show ? 1 : 0 }}
              transition={{ duration: 0.5, delay: show ? delay + 0.6 : 0 }}
            >
              <tspan className="cs-comparison-value">{formatValue(bar.value)}</tspan>
              {bar.note && (
                <tspan className="cs-comparison-note" dx="14">
                  {bar.note}
                </tspan>
              )}
            </motion.text>
          </g>
        );
      })}
    </svg>
  );
}
