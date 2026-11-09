# Build a slide

Kinetic Slides provides a deck runtime and a set of visual components. Content and theme stay in the consuming presentation. Import components from `kinetic-slides`, then load `kinetic-slides/theme.css` and `kinetic-slides/styles.css` once in the app entrypoint. Load your own CSS afterward to override the design tokens.

## Structure and surfaces

| Component | Use it for |
| --- | --- |
| `SlideFrame` | A full-stage surface inside a scene. |
| `SlideHeading` | A section label, title, and optional subtitle. Use `titleAs="h2"` when the slide already has a main heading. |
| `SlideCard` | A bordered surface for a role, option, or metric. It accepts normal `div` attributes. |
| `MotionCard` | The same surface with Motion props such as `initial`, `animate`, and `layout`. |
| `Badge` | A compact status or category label. |
| `IconTile` | A framed icon inside a card or diagram. Supply your own SVG as its child. |
| `QuoteCallout` | A short statement with an accent rule. |

These components use theme variables and low-specificity defaults. Pass `className` or the `SlideHeading` class props to shape them for your presentation without copying their base styles.

```tsx
import { Badge, IconTile, SlideCard, SlideHeading } from 'kinetic-slides';

function Overview() {
  return <>
    <SlideHeading eyebrow="Overview" title="One clear idea" subtitle="What the audience should remember" />
    <SlideCard>
      <IconTile><svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="6" /></svg></IconTile>
      <Badge>New</Badge>
      <p>Put the story-specific content here.</p>
    </SlideCard>
  </>;
}
```

## Steps and motion

| Component | Use it for |
| --- | --- |
| `Reveal` | Show or hide one piece of content at a scene step. |
| `StepSequence` | Reveal a list one item at a time while keeping earlier items visible. |
| `StaggeredItem` | Enter a repeated item after its peers. Pass its `index`, initial `y`, `delay`, and `stagger`. |
| `DrawPath` | Draw an SVG path with optional color, delay, and duration. Place it inside an SVG. |
| `DiagramNode` | Position and reveal a labeled node at `{x, y}` on a fixed-size diagram canvas. |
| `CountUp` | Animate a number, with a custom `format` function if needed. |

Scenes should derive visible state from `SceneProps.step`. Pass `reduce` to `CountUp` and `StaggeredItem` when `useReducedMotion()` is active, and settle the scene before print export. `Reveal`, `DrawPath`, and `DiagramNode` also accept a `show` condition tied to the step.

```tsx
import { DiagramNode, DrawPath } from 'kinetic-slides';

function Journey({ step }: { step: number }) {
  return <div style={{ position: 'relative', width: 900, height: 200 }}>
    <svg width="900" height="200" aria-hidden>
      <DrawPath d="M260 80 H620" show={step >= 1} delay={0.2} color="var(--accent)" />
    </svg>
    <DiagramNode x={0} y={30}>Start</DiagramNode>
    <DiagramNode x={640} y={30} show={step >= 1} delay={0.5}>Finish</DiagramNode>
  </div>;
}
```

## Compare data

`ComparisonBarChart` draws labeled horizontal or vertical bars, ticks, values, and optional notes. It accepts data and colors as props, so the chart does not know anything about your presentation's subject. `max` sets the scale; `formatValue` formats both ticks and values. The horizontal layout defaults to 1600 × `(bars.length × 92 + 40)` on the 1920 × 1080 stage. Set `orientation="vertical"` for columns, and use `animation={{ duration, stagger }}` to tune pacing. `plotWidth` sizes the horizontal measure; `plotHeight` sizes vertical columns.

```tsx
import { ComparisonBarChart } from 'kinetic-slides';

<ComparisonBarChart
  ariaLabel="Time by option"
  max={100}
  ticks={[0, 25, 50, 75, 100]}
  bars={[
    { id: 'a', label: 'Option A', value: 72, color: 'var(--accent)' },
    { id: 'b', label: 'Option B', value: 48, note: 'estimate' },
  ]}
  show={step >= 1}
  formatValue={(value) => `${value}%`}
/>
```

## Show a timed sequence

`SequenceDiagram` renders participants as lanes and timed calls as arrows. It also supports a call to itself and a `stream` band for repeated messages. Pass the current playback `time` from your scene; the component derives the active call and highlighted lanes. Keep calls ordered by `at`. Colors and labels come from your data, so the same component works for service calls, manufacturing steps, or a customer journey.

```tsx
import { SequenceDiagram } from 'kinetic-slides';

<SequenceDiagram
  time={playbackTime}
  lanes={[
    { id: 'visitor', name: 'Visitor', x: 100 },
    { id: 'site', name: 'Site', x: 430 },
    { id: 'service', name: 'Service', x: 760 },
  ]}
  calls={[
    { at: 0.5, from: 'visitor', to: 'site', label: 'Open page' },
    { at: 1.2, from: 'site', to: 'service', label: 'Fetch details', color: 'var(--accent)' },
    { at: 2, from: 'service', to: 'site', label: 'Return result' },
  ]}
/>
```

Use the [API reference](api.md) for contracts and the [demo](../demo/src/scenes.tsx) for a complete presentation. For a new deck, follow the [authoring guide](authoring.md) and the [agent skill](../.agents/skills/create-presentation/SKILL.md).

## Slide-level patterns

The [README motion gallery](../README.md#motion-gallery) shows each of these in a runnable neutral scene with an animated GIF. The components stay data-driven; pass your own content and design tokens.

| Component | Required data | Useful options |
| --- | --- | --- |
| `ProgressSplit` | `total`, `used` | `labels`, `format`, `duration`, `show`, `accent` |
| `FlowDiagram` | `nodes: {id,label,x?,y?}[]`, `edges: {from,to}[]` | `step`, `width`, `height`, `nodeWidth`, `stagger`; node `detail` and `tone`; edge `label`, `tone`, `dashed` |
| `ComparisonBarChart` | `bars`, `max`, `ariaLabel` | `orientation`, `ticks`, `show`, `formatValue`, `animation`, sizes |
| `SequenceStory` | `lanes: string[]`, `calls: {from,to,label}[]` | `interval`, `width`, `playing`, call `color` and `dashed` |
| `ComparisonMatrix` | `columns`, `rows: {label,values}[]` | `revealColumn`, `show`, `stagger`, `accent` |
| `Timeline` | `events: {date,title}[]` | `active`, `showSpans`, `formatSpan`, `stagger`, event `label`, `detail`, `color` |
| `DistributionFlow` | `outcomes: {label,value}[]` | `totalLabel`, `format`, `duration`, `show`, outcome `color` |
| `Roadmap` | `now`, `next`, `step` | `nextAt`, `headings`, `stagger`, item `detail` |
| `NumberedList` | `items: {title,detail?}[]` | `start`, `show`, `stagger`, `formatNumber`, `accent` |

Use ISO dates such as `2026-03` in `Timeline`; `label` controls the shorter visible text. `SequenceStory` plays on mount. For speaker-controlled timing, use `SequenceDiagram` and pass a time value derived from your scene. Motion respects reduced-motion preferences; the print renderer settles all Motion animations.
