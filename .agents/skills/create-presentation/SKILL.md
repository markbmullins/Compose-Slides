---
name: create-presentation
description: Create a new presentation with reusable scenes, steps, notes, theme and print states. Use when authoring a deck from this framework, not for runtime maintenance.
---

# Create a presentation

Read `AGENTS.md`, `docs/authoring.md`, `docs/components.md`, and `docs/api.md`. Start with the README motion gallery: `ProgressSplit`, `FlowDiagram`, `ComparisonBarChart`, `SequenceStory`, `ComparisonMatrix`, `Timeline`, `DistributionFlow`, `Roadmap`, and `NumberedList` cover common slide-level patterns. Use lower-level components when the scene needs custom geometry or timing. Copy `demo/` as the starting application or install the package in an existing React/Vite app. Define the story arc as ordered `SceneDef` entries with realistic time windows. Implement each visible step as a deterministic render of `SceneProps.step`; use `Reveal` for staged content. Keep factual content, assets, notes and theme in the consuming presentation.

Write one spoken cue per step, with a short phase label. Test navigation forward and back, direct hash loading, presenter notes on desktop and phone, and `?print`. A desktop presenter preview is available through `showPreview`; use it only when scene renders have no mount side effects. If the deck has private notes, use `loadProtectedNotes` in production, dynamically import notes only in development, and check that notes stay out of public assets. For complex animation, honor reduced motion and verify its settled print state. Run the build, typecheck and lint commands. Capture and inspect representative screenshots before delivery.
