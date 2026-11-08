import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const galleryIds = [
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
];

const base = process.env.DEMO_URL ?? 'http://127.0.0.1:5175';
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
await mkdir('docs/images/motion', { recursive: true });
for (const id of (process.argv.length > 2 ? process.argv.slice(2) : galleryIds)) {
  const dir = `/tmp/compose-gif-${id}`;
  await mkdir(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 675 }, deviceScaleFactor: 1 });
  await page.goto(`${base}/?gallery=${id}`);
  await page.locator('.gallery-stage').waitFor();
  await page.evaluate(() => document.fonts.ready);
  for (let i = 0; i < 40; i++) {
    await page.screenshot({ path: `${dir}/${String(i).padStart(3, '0')}.png` });
    await page.waitForTimeout(115);
  }
  await page.close();
  const input = `${dir}/%03d.png`,
    output = `docs/images/motion/${id}.gif`;
  const run = spawnSync(
    'ffmpeg',
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-framerate',
      '8',
      '-i',
      input,
      '-vf',
      'scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4',
      '-loop',
      '0',
      output,
    ],
    { stdio: 'inherit' },
  );
  if (run.status !== 0) throw new Error(`ffmpeg ${id} failed`);
  await rm(dir, { recursive: true, force: true });
  console.log(`captured ${id}`);
}
await browser.close();
