# API reference

| Export | Purpose |
| --- | --- |
| `Deck` | Live stage, keyboard navigation, progress, timer and sync. Props: `scenes`. |
| `PrintDeck` | Printable pages. Props: `scenes`, `options`. |
| `PresenterView` (`/presenter`) | Speaker UI. Props: `scenes`, `loadNotes`, optional `sceneControls` map and `showPreview` (renders the current scene in the desktop notes view; import `compose-slides/preview.css`). |
| `PairView` (`/pair`) | Control-key entry. Props: `next` (`deck` or `presenter`), optional `verify` (default true; false for a local dev server). |
| `SlideFrame` | Full-stage scene surface. Props: `children`, optional `className`, `style`. |
| `StepSequence` | Reveal one item per step. Props: `step`, `items`, `renderItem`, optional `className`. |
| `Reveal` | Animate a child as `show` changes. Optional `delay`, `className`, `style`. |
| `SlideHeading` | Section label, title, and optional subtitle. Supports `titleAs`, wrapper and child class names. |
| `SlideCard`, `MotionCard` | Token-driven card surfaces; `MotionCard` accepts Motion div props. |
| `Badge`, `IconTile`, `QuoteCallout` | Small presentational surfaces for labels, icons, and emphasized statements. |
| `DrawPath`, `DiagramNode` | Animated SVG path and positioned, revealed diagram node. |
| `CountUp`, `StaggeredItem` | Animated numeric text and sequenced entrance for repeated items. |
| `ComparisonBarChart` | Data-driven horizontal or vertical comparison with ticks, labels, values, notes, and colors. |
| `ProgressSplit`, `FlowDiagram` | Animated progress and node/edge story diagrams. |
| `ComparisonMatrix`, `Timeline` | Column reveal and dated milestones. |
| `DistributionFlow`, `Roadmap`, `NumberedList` | Weighted outcomes, expanding plan, and staggered summary. |
| `SequenceStory` | Autoplay sequence from participant names and ordered calls. |
| `SequenceDiagram` | Timed participant lanes and calls. Props: `time`, ordered `lanes`, ordered `calls`, optional `width` and `streamLabel`. |
| `useTween` | Animate a numeric target with Motion; respects reduced motion. |
| `readPrintOptions` | Parse `?print`, `?print=final`, and optional `&scenes=id,id`. |
| `forceReducedMotion` | Call before React mounts when print options exist. |
| `controlKey`, `saveControlKey` | Read and store a pairing key. |
| `configureSyncChannel` | Set a unique local BroadcastChannel name per presentation. Call before mounting. |
| `loadProtectedNotes` | Fetch protected notes in production; select a dynamic import in dev. |
| `createRelay`, `DeckRoom` (`/cloudflare`) | Optional Cloudflare Worker and Durable Object relay. |

`SceneDef` requires `id`, `label`, `window: [startMinutes, endMinutes]`, `steps`, and `Component`. Optional `printVariants` is an array of `{variant, label}`. `SceneProps` contains `step`, `setStepCount`, `goToStep`, `variant?`, and `print?`.

`NotesMap` maps scene IDs to `SceneNotes`. Each entry has a `goal` and `cues: {phase, say, do?}[]`. Optional fields are `principle`, `qa`, `timing`, and `reminders`.

Import the default token sheet from `compose-slides/theme.css` and component CSS from `compose-slides/styles.css`. Override tokens in your own stylesheet loaded afterward.
