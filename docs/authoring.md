# Author a presentation

Start in `demo/src/scenes.tsx`. Replace each demo scene with your own component, then update the `scenes` array. Keep content in your presentation; the runtime owns navigation, scaling, print pages and synchronization.

Each scene receives `step`, `setStepCount`, `goToStep`, and optional print fields. Write all visible states as a function of `step`. Use `Reveal` for simple entrance motion. Use Motion directly for complex sequences, but honor `prefers-reduced-motion` so print mode can show a settled frame. A scene with an interactive branch can call `setStepCount(n)` and `goToStep(0)` when the branch changes.

Add one cue per step in `demo/src/notes.ts`. For private deployments, load notes through `loadProtectedNotes` with a dynamic import for local development and a protected endpoint in production. Keep the dynamic import out of the public deck path.

Edit `demo/src/theme.css` to set tokens. The stage stays 1920 × 1080 and scales uniformly to the viewport. Avoid viewport-relative units inside a scene; test at a projector aspect ratio and a laptop aspect ratio. Keep important text inside the stage's safe margins.

Open `/?print` to check every step and any `printVariants`. Add a variant only for a state that cannot be reached by step alone. Review the presenter view at desktop and phone widths, then run the build and typecheck commands before publishing.
