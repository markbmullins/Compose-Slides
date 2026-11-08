# Get started with Compose Slides

This guide starts from an existing React 19 app using Vite. You will add a two-step slide, a presenter view with notes, and print mode. The [demo](../demo/src/main.tsx) is a complete working example.

## 1. Install the package

```bash
npm install compose-slides react react-dom motion
```

The npm package has not been released yet. To use this repository before the first release, run `npm install && npm run build` here and install the checkout in your app with `npm install /absolute/path/to/Compose-Slides react react-dom motion`.

## 2. Define your slides

Create `src/scenes.tsx`:

```tsx
import { Reveal, SlideFrame, type SceneDef, type SceneProps } from 'compose-slides';

function Opening({ step }: SceneProps) {
  return <SlideFrame>
    <h1>A clear idea</h1>
    <Reveal show={step >= 1}><p>Built one step at a time.</p></Reveal>
  </SlideFrame>;
}

export const scenes: SceneDef[] = [
  { id: 'opening', label: 'Opening', window: [0, 2], steps: 2, Component: Opening },
];
```

`steps` is the number of states in the scene. The first state is `step === 0`. The `window` values are planned minutes from the start, used by the presenter view. Keep each scene's visible output determined by `step` so navigation, remote control, and print mode agree.

## 3. Add speaker notes

Create `src/notes.ts`:

```ts
import type { NotesMap } from 'compose-slides';

export const notes: NotesMap = {
  opening: {
    goal: 'Introduce the idea.',
    cues: [
      { phase: 'Start', say: 'State the idea.' },
      { phase: 'Reveal', say: 'Explain what changes.' },
    ],
  },
};
```

The note key must match the scene `id`. Each cue corresponds to one step. For a private deck, serve notes from an authenticated endpoint and use `loadProtectedNotes` instead of importing a public `notes.ts` file.

## 4. Mount the deck

Create `src/main.tsx` and make sure your HTML contains `<div id="root"></div>`:

```tsx
import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { Deck, PrintDeck, forceReducedMotion, readPrintOptions } from 'compose-slides';
import 'compose-slides/theme.css';
import 'compose-slides/styles.css';
import { scenes } from './scenes';

const PresenterView = lazy(() => import('compose-slides/presenter'));
const print = readPrintOptions();
if (print) forceReducedMotion();

function App() {
  if (print) return <PrintDeck scenes={scenes} options={print} />;
  if (new URLSearchParams(location.search).has('presenter')) {
    return <Suspense fallback={null}>
      <PresenterView scenes={scenes} loadNotes={() => import('./notes').then((m) => m.notes)} />
    </Suspense>;
  }
  return <Deck scenes={scenes} />;
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
```

Start Vite. The audience deck is at `/`; `/?presenter` shows notes in a second window; `/?print` renders all steps for printing; `/?print=final` renders the final step of each scene. Two windows in the same browser synchronize through `BroadcastChannel`. Cross-device control uses the optional [WebSocket relay](sync.md) and [deployment skill](../.agents/skills/deploy-presentation/SKILL.md).

Import `compose-slides/preview.css` and set `showPreview` on `PresenterView` to show the current slide beside the notes on wide screens. This renders the scene a second time, so leave it off for scenes that perform side effects on mount.

## 5. Customize the presentation

Load your own CSS after the two package styles to override tokens such as `--accent`, `--stage`, and `--font-sans`. Add scenes to `src/scenes.tsx`; use `Reveal`, `StepSequence`, or your own React components for staged content. The stage has a fixed 1920 × 1080 logical size and scales to fit the screen. For the full component contracts, see the [API reference](api.md).
