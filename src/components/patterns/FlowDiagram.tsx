import { motion, useReducedMotion } from 'motion/react';
import { useId, type CSSProperties } from 'react';
import { delayFor, ease, type Common } from './shared';

export interface FlowNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
  detail?: string;
  tone?: string;
}
export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  tone?: string;
  dashed?: boolean;
}
export interface FlowDiagramProps extends Common {
  nodes: readonly FlowNode[];
  edges: readonly FlowEdge[];
  step?: number;
  width?: number;
  height?: number;
  nodeWidth?: number;
  stagger?: number;
}
/** Auto-place nodes or supply coordinates; edges and reveals follow data order. */
export function FlowDiagram({
  nodes,
  edges,
  step = Infinity,
  width = 900,
  height = 300,
  nodeWidth = 170,
  stagger = 0.18,
  accent,
  className = '',
}: FlowDiagramProps) {
  const reduce = useReducedMotion();
  const markerId = `cs-flow-arrow-${useId().replace(/:/g, '')}`;
  const inset = Math.min(width / 2, nodeWidth / 2 + 16);
  const positioned = nodes.map((n, i) => ({
    ...n,
    x: n.x ?? (nodes.length === 1 ? width / 2 : inset + (i * (width - inset * 2)) / (nodes.length - 1)),
    y: n.y ?? height / 2,
  }));
  const node = (id: string) => positioned.find((n) => n.id === id);
  return (
    <div
      className={`cs-flow ${className}`}
      style={{ '--cs-accent': accent ?? 'var(--accent)', aspectRatio: `${width}/${height}` } as CSSProperties}
    >
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={nodes.map((n) => n.label).join(' to ')}>
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
          </marker>
        </defs>
        {edges.map((edge, i) => {
          const a = node(edge.from),
            b = node(edge.to);
          if (!a || !b) return null;
          const direction = b.x >= a.x ? 1 : -1;
          const x1 = a.x + (direction * nodeWidth) / 2,
            x2 = b.x - (direction * nodeWidth) / 2;
          const y1 = a.y,
            y2 = b.y;
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <motion.path
                d={`M${x1} ${y1} C${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`}
                fill="none"
                stroke={edge.tone ?? 'var(--cs-accent)'}
                strokeWidth="2"
                strokeDasharray={edge.dashed ? '7 6' : undefined}
                markerEnd={`url(#${markerId})`}
                initial={false}
                animate={{ pathLength: step > i ? 1 : 0, opacity: step > i ? 1 : 0 }}
                transition={{ duration: reduce ? 0 : 0.7, delay: delayFor(i, stagger, !!reduce), ease }}
              />
              {edge.label && (
                <motion.text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 10}
                  textAnchor="middle"
                  className="cs-flow-edge-label"
                  initial={false}
                  animate={{ opacity: step > i ? 1 : 0 }}
                  transition={{ delay: delayFor(i, stagger, !!reduce) + 0.4 }}
                >
                  {edge.label}
                </motion.text>
              )}
            </g>
          );
        })}
        {positioned.map((n, i) => (
          <motion.g
            key={n.id}
            initial={false}
            animate={{ opacity: step >= i ? 1 : 0, y: step >= i ? 0 : 12 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: delayFor(i, stagger, !!reduce), ease }}
          >
            <rect
              x={n.x - nodeWidth / 2}
              y={n.y - 31}
              width={nodeWidth}
              height={62}
              rx="12"
              className="cs-flow-node"
              style={{ '--node-tone': n.tone ?? 'var(--cs-accent)' } as CSSProperties}
            />
            <text x={n.x} y={n.y - (n.detail ? 3 : -1)} textAnchor="middle" className="cs-flow-label">
              {n.label}
            </text>
            {n.detail && (
              <text x={n.x} y={n.y + 17} textAnchor="middle" className="cs-flow-detail">
                {n.detail}
              </text>
            )}
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
