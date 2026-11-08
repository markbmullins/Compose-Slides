import type { CSSProperties } from 'react';
import './components.css';

export interface SequenceLane {
  id: string;
  name: string;
  sub?: string;
  x: number;
}

export interface SequenceCall {
  at: number;
  from: string;
  to: string;
  label: string;
  color?: string;
  dashed?: boolean;
  stream?: { until: number };
}

export interface SequenceDiagramProps {
  time: number;
  lanes: readonly SequenceLane[];
  calls: readonly SequenceCall[];
  width?: number;
  streamLabel?: (call: SequenceCall, time: number) => string;
  className?: string;
}

const ROW = 33;
const STREAM_ROW = 64;
const SELF_ROW = 42;
const TOP = 18;
const DRAW = 0.42;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function arrowhead(x: number, y: number, dir: 1 | -1) {
  return `M${x - dir * 9} ${y - 5.5} L${x} ${y} L${x - dir * 9} ${y + 5.5}`;
}

/** A timed sequence diagram with lanes, calls, self-calls, and repeated-message streams. */
export function SequenceDiagram({ time, lanes, calls, width = 1040, streamLabel = (call) => call.label, className = '' }: SequenceDiagramProps) {
  const laneX = (id: string) => {
    const lane = lanes.find((item) => item.id === id);
    if (!lane) throw new Error(`Unknown sequence lane: ${id}`);
    return lane.x;
  };
  let rowY = TOP;
  const rows = calls.map((call) => {
    const height = call.stream ? STREAM_ROW : call.from === call.to ? SELF_ROW : ROW;
    const middle = rowY + (call.stream ? 38 : height / 2 + 6);
    rowY += height;
    return middle;
  });
  const height = (rows.at(-1) ?? TOP) + ROW;
  let now = -1;
  calls.forEach((call, index) => { if (time >= call.at) now = index; });
  const nowCall = calls[now];
  const hot = new Set(nowCall ? [nowCall.from, nowCall.to] : []);

  return <div className={`cs-sequence ${className}`.trim()}>
    <div className="cs-sequence-lanes">
      {lanes.map((lane) => <div key={lane.id} className={`cs-sequence-lane${hot.has(lane.id) ? ' is-hot' : ''}`} style={{ left: lane.x }}>
        <div className="cs-sequence-lane-name">{lane.name}</div>
        {lane.sub && <div className="cs-sequence-lane-sub mono">{lane.sub}</div>}
      </div>)}
    </div>
    <svg className="cs-sequence-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      {lanes.map((lane) => <line key={lane.id} x1={lane.x} x2={lane.x} y1={0} y2={height - 18} className={`cs-sequence-lifeline${hot.has(lane.id) ? ' is-hot' : ''}`} />)}
      {calls.map((call, index) => {
        if (time < call.at) return null;
        const y = rows[index];
        const isNow = index === now;
        const className = `cs-sequence-call${call.dashed ? ' is-dashed' : ''}${isNow ? ' is-now' : ''}`;
        const style = { '--c': call.color ?? 'var(--accent)' } as CSSProperties;
        if (call.stream) {
          const until = call.stream.until;
          const progress = clamp01((time - call.at) / 0.4);
          const x1 = laneX(call.from);
          const x2 = laneX(call.to);
          const left = Math.min(x1, x2);
          const span = Math.abs(x2 - x1);
          const live = time < until;
          return <g key={index} opacity={progress} className={`cs-sequence-call is-dashed${isNow && live ? ' is-now' : ''}`} style={{ '--c': 'var(--text-2)' } as CSSProperties}>
            <rect x={left + 10} y={y - 16} width={span - 20} height={36} rx={8} className="cs-sequence-stream-bg" />
            {[-6, 2, 10].map((dy, lineIndex) => <line key={dy} x1={x1 + 14} x2={x2 - 16} y1={y + dy} y2={y + dy} className={`cs-sequence-stream-line${live ? ' is-live' : ''}`} style={{ strokeDashoffset: live ? -time * (70 + lineIndex * 14) : 0 }} />)}
            <path d={arrowhead(x2 - 14, y + 2, x2 > x1 ? 1 : -1)} className="cs-sequence-head" />
            <text x={(x1 + x2) / 2} y={y - 22} className="cs-sequence-label">{streamLabel(call, time)}</text>
          </g>;
        }
        const progress = clamp01((time - call.at) / DRAW);
        if (call.from === call.to) {
          const x = laneX(call.from);
          const span = 30 * progress;
          return <g key={index} className={className} style={style}>
            <path d={`M${x + 4} ${y - 8} h${span} v16 h${-span}`} className="cs-sequence-line" />
            {progress >= 1 && <path d={arrowhead(x + 5, y + 8, -1)} className="cs-sequence-head" />}
            <text x={x + 44} y={y + 5} className="cs-sequence-label is-start" opacity={progress}>{call.label}</text>
          </g>;
        }
        const x1 = laneX(call.from);
        const x2 = laneX(call.to);
        const dir = x2 > x1 ? 1 : -1;
        const start = x1 + dir * 5;
        const end = x2 - dir * 5;
        const tip = start + (end - start) * (1 - Math.pow(1 - progress, 2));
        return <g key={index} className={className} style={style}>
          <line x1={start} x2={tip} y1={y} y2={y} className="cs-sequence-line" />
          <path d={arrowhead(tip, y, dir)} className="cs-sequence-head" />
          {progress < 1 && <circle cx={tip} cy={y} r={5} className="cs-sequence-packet" />}
          <text x={(x1 + x2) / 2} y={y - 8} className="cs-sequence-label" opacity={clamp01(progress * 1.6)}>{call.label}</text>
        </g>;
      })}
    </svg>
  </div>;
}
