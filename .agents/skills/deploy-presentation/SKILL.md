---
name: deploy-presentation
description: Deploy a presentation built with this framework to Cloudflare Workers or Vercel, including build checks, routing, optional private notes and cross-device presenter sync. Use for deployment or deployment setup, not ordinary scene authoring.
---

# Deploy a presentation

Read `AGENTS.md` and `docs/sync.md`. Inspect the consuming app's build script, output directory, notes policy and desired host. Run its build and test the production preview before deploying. Do not publish a live site without the user's authorization. Never commit or print a control key.

## Cloudflare Workers

Use `demo/worker.ts` and `demo/wrangler.jsonc` as a starting point. The Worker imports `createRelay` and `DeckRoom` from the library's `/cloudflare` entrypoint and supplies private notes from the consuming app. Configure static `assets.directory`, `run_worker_first` for `/ws` and `/api/*`, the `ROOM` Durable Object binding, and an initial migration. After deployment is authorized, set a high-entropy `CONTROL_KEY` with `wrangler secret put CONTROL_KEY` in the target account; this command creates and deploys a new Worker version. Use `.dev.vars` only for local testing. Build, run `wrangler dev`, and verify that an unpaired `/ws` and `/api/notes` return 403. For private notes, inspect the built assets and confirm the note text is absent. The demo itself keeps its example notes public for static hosting. Pair at `/?pair`, then test a laptop deck and phone presenter across devices. Deploy with `wrangler deploy` after authorization; verify the live route and reconnect after sleep.

## Vercel

Use a static Vite build. Set Framework Preset to Vite and Output Directory to the app's build output (the demo uses `demo/dist`). Deploy via the Vercel dashboard or CLI after authorization. A static deployment supports the deck, print mode, and same-browser presenter through `BroadcastChannel`. The demo lazily loads public notes for this mode. Vercel static hosting does not provide the included Durable Object relay; for private notes or cross-device WebSocket control, deploy the Cloudflare Worker on an appropriate origin and route `/ws` and `/api/notes` there using infrastructure that supports WebSocket upgrades, or choose Cloudflare for the whole deck. Verify the actual deployed URL, direct hash links, presenter navigation, and print output.

Official references: [Cloudflare static assets](https://developers.cloudflare.com/workers/static-assets/binding/), [Cloudflare WebSockets](https://developers.cloudflare.com/workers/runtime-apis/websockets/), [Wrangler secrets](https://developers.cloudflare.com/workers/wrangler/commands/workers/), [Vercel WebSocket limits](https://vercel.com/docs/limits).
