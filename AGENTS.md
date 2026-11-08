# Agent guide

This repository is a content-neutral React presentation framework. Keep company, client and project-specific material in downstream presentations. `src/runtime` is the browser library, `src/cloudflare` is an optional server relay, and `demo` is the public example. The demo and `?gallery=<id>` routes are the visual reference for README screenshots and motion GIFs.

Read `docs/authoring.md` and `docs/components.md` before adding a scene and `docs/api.md` before changing a public export. Preserve the `SceneDef` and `SceneProps` contracts. Treat position, timer, and notes sync as one protocol; read `docs/sync.md` before modifying it. Export new public APIs from `src/index.ts`, or separate entrypoints when code must stay lazy.

Before finishing a change, run `npm run build`, `npm run demo:build`, `npm run typecheck`, and `npm run lint`. Check the deck at multiple steps, `/?presenter` at desktop and phone widths, and `/?print`. Enable `PresenterView.showPreview` only for scenes that can safely render twice. Refresh README screenshots and GIFs when their source demo changes: run `scripts/capture-readme.mjs` and `scripts/capture-gallery.mjs`. Never place private speaker notes, secrets, or customer assets in the public demo or README.

Agent skills: use `.agents/skills/create-presentation/SKILL.md` to build a new deck; use `.agents/skills/deploy-presentation/SKILL.md` for Cloudflare or Vercel deployment.
