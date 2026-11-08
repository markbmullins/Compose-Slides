import { useEffect, useState } from 'react';
import {
  ProgressSplit,
  FlowDiagram,
  ComparisonBarChart,
  SequenceStory,
  ComparisonMatrix,
  Timeline,
  DistributionFlow,
  Roadmap,
  NumberedList,
} from '../../src';
import './gallery.css';

export const galleryIds = [
  'progress',
  'journey',
  'bars',
  'architecture',
  'sequence',
  'matrix',
  'timeline',
  'distribution',
  'roadmap',
  'numbered',
] as const;
export type GalleryId = (typeof galleryIds)[number];
const meta: Record<GalleryId, [string, string]> = {
  progress: ['01 / PROGRESS', 'A total becomes a decision.'],
  journey: ['02 / JOURNEY', 'Draw the path, one step at a time.'],
  bars: ['03 / COMPARISON', 'Compare measures in either direction.'],
  architecture: ['04 / ARCHITECTURE', 'Make the system legible.'],
  sequence: ['05 / SEQUENCE', 'Show who speaks to whom.'],
  matrix: ['06 / MATRIX', 'Reveal the meaningful difference.'],
  timeline: ['07 / TIMELINE', 'Put milestones on one line.'],
  distribution: ['08 / DISTRIBUTION', 'Where did the work go?'],
  roadmap: ['09 / ROADMAP', 'Move from now to next.'],
  numbered: ['10 / SUMMARY', 'Land the final three points.'],
};

export function Gallery({ id }: { id: GalleryId }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = performance.now();
    const timer = window.setInterval(() => setElapsed((performance.now() - started) / 1000), 40);
    return () => clearInterval(timer);
  }, [id]);
  const step = Math.floor(elapsed / 0.68);
  const common = { accent: '#7662e9' };
  return (
    <div className="gallery-stage">
      <div className="gallery-top">
        <b>
          COMPOSE<span>·</span>SLIDES
        </b>
        <span>COMPONENT GALLERY / {meta[id][0]}</span>
      </div>
      <main>
        <div className="gallery-eyebrow">{meta[id][0]}</div>
        <h1>{meta[id][1]}</h1>
        <div className={`gallery-example gallery-${id}`}>
          {id === 'progress' && (
            <ProgressSplit
              {...common}
              total={100}
              used={64}
              format={(n) => `${n}%`}
              labels={{ total: 'planned', used: 'complete', remaining: 'to go' }}
            />
          )}
          {id === 'journey' && (
            <FlowDiagram
              {...common}
              step={step}
              width={980}
              height={240}
              nodes={[
                { id: 'discover', label: 'Discover', detail: 'listen' },
                { id: 'design', label: 'Design', detail: 'shape' },
                { id: 'deliver', label: 'Deliver', detail: 'ship' },
              ]}
              edges={[
                { from: 'discover', to: 'design', label: 'insight' },
                { from: 'design', to: 'deliver', label: 'decision' },
              ]}
            />
          )}
          {id === 'bars' && (
            <div className="gallery-bars-pair">
              <ComparisonBarChart
                bars={[
                  { id: 'a', label: 'Draft', value: 38, color: '#ad9af6' },
                  { id: 'b', label: 'Review', value: 62, color: '#8d77eb' },
                  { id: 'c', label: 'Ready', value: 84, color: '#6650d5' },
                ]}
                max={100}
                ticks={[0, 25, 50, 75, 100]}
                width={560}
                plotWidth={410}
                rowHeight={58}
                barHeight={25}
                axisHeight={36}
                formatValue={(n) => `${n}%`}
                ariaLabel="Progress by stage"
                show={elapsed > 0.2}
              />
              <ComparisonBarChart
                bars={[
                  { id: 'a', label: 'A', value: 38, color: '#ad9af6' },
                  { id: 'b', label: 'B', value: 62, color: '#8d77eb' },
                  { id: 'c', label: 'C', value: 84, color: '#6650d5' },
                ]}
                orientation="vertical"
                max={100}
                ticks={[0, 50, 100]}
                width={480}
                plotHeight={210}
                barHeight={72}
                formatValue={(n) => `${n}%`}
                ariaLabel="Vertical comparison"
                show={elapsed > 0.2}
              />
            </div>
          )}
          {id === 'architecture' && (
            <FlowDiagram
              {...common}
              step={step}
              width={1050}
              height={300}
              nodes={[
                { id: 'input', label: 'Input', detail: 'events', x: 100, y: 150 },
                { id: 'router', label: 'Router', detail: 'validate', x: 410, y: 150 },
                { id: 'store', label: 'Store', detail: 'persist', x: 740, y: 70 },
                { id: 'view', label: 'View', detail: 'present', x: 940, y: 220 },
              ]}
              edges={[
                { from: 'input', to: 'router' },
                { from: 'router', to: 'store', label: 'write' },
                { from: 'router', to: 'view', label: 'read', dashed: true },
              ]}
            />
          )}
          {id === 'sequence' && (
            <SequenceStory
              width={1000}
              interval={0.8}
              lanes={['Reader', 'App', 'Service']}
              calls={[
                { from: 'Reader', to: 'App', label: 'open report' },
                { from: 'App', to: 'Service', label: 'fetch summary' },
                { from: 'Service', to: 'App', label: 'return data', color: '#58b0a8' },
                { from: 'App', to: 'Reader', label: 'render view', color: '#58b0a8' },
              ]}
            />
          )}
          {id === 'matrix' && (
            <ComparisonMatrix
              {...common}
              columns={['Current', 'Proposed']}
              revealColumn={1}
              show={step >= 2}
              rows={[
                { label: 'Setup', values: ['Manual', 'Guided'] },
                { label: 'Reporting', values: ['Weekly', 'Live'] },
                { label: 'Ownership', values: ['Shared inbox', 'Clear owner'] },
                { label: 'Review', values: ['Ad hoc', 'Scheduled'] },
              ]}
            />
          )}
          {id === 'timeline' && (
            <Timeline
              {...common}
              active={Math.min(step, 3)}
              events={[
                { date: '2026-01', label: 'JAN', title: 'Explore', detail: 'Find the signal' },
                { date: '2026-03', label: 'MAR', title: 'Prototype', detail: 'Make it tangible' },
                { date: '2026-06', label: 'JUN', title: 'Pilot', detail: 'Learn with a team' },
                { date: '2026-09', label: 'SEP', title: 'Launch', detail: 'Put it to work' },
              ]}
            />
          )}
          {id === 'distribution' && (
            <DistributionFlow
              {...common}
              outcomes={[
                { label: 'Completed', value: 72, color: '#7662e9' },
                { label: 'In review', value: 19, color: '#55b9a8' },
                { label: 'Deferred', value: 9, color: '#e5a864' },
              ]}
              totalLabel="Items"
              format={String}
              show={elapsed > 0.15}
            />
          )}
          {id === 'roadmap' && (
            <Roadmap
              {...common}
              step={step}
              now={[
                { title: 'Clarify the goal', detail: 'One shared outcome' },
                { title: 'Simplify the path', detail: 'Fewer decisions to make' },
                { title: 'Test with users', detail: 'Evidence before scale' },
              ]}
              next={[
                { title: 'Pilot', detail: 'Start with one team' },
                { title: 'Measure', detail: 'Review the result' },
              ]}
              headings={{ now: 'What we learned', next: 'What comes next' }}
            />
          )}
          {id === 'numbered' && (
            <NumberedList
              {...common}
              show={Math.min(step + 1, 3)}
              items={[
                { title: 'Start with the question', detail: 'Make the stakes clear.' },
                { title: 'Let the evidence move', detail: 'Reveal only what matters.' },
                { title: 'End with a decision', detail: 'Give the audience a next step.' },
              ]}
            />
          )}
        </div>
      </main>
      <footer>
        NEUTRAL EXAMPLES · REPLACE WITH YOUR OWN STORY
        <span>{String(galleryIds.indexOf(id) + 1).padStart(2, '0')} / 10</span>
      </footer>
    </div>
  );
}
