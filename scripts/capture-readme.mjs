import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const base = process.env.DEMO_URL ?? 'http://127.0.0.1:5175';
await mkdir('docs/images', { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
const context = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
for (const [name, hash] of [['opening', '#title/1'], ['signal', '#signal/2'], ['method', '#process/2']]) {
  const audience = await context.newPage();
  await audience.goto(`${base}/${hash}`);
  await audience.locator('.stage').waitFor();
  await audience.waitForTimeout(900);
  await audience.screenshot({ path: `docs/images/${name}.png` });
  await audience.close();
}
const audience = await context.newPage();
await audience.goto(`${base}/#signal/2`);
const presenter = await context.newPage();
await presenter.setViewportSize({ width: 1440, height: 900 });
await presenter.goto(`${base}/?presenter`);
await presenter.getByText('Say now').waitFor();
await presenter.locator('.pv-timer-btn').click();
await presenter.getByRole('button', { name: 'Start timer' }).click();
await presenter.getByRole('button', { name: /Jump to plan/ }).click();
await presenter.getByRole('button', { name: 'Close' }).click();
await presenter.waitForTimeout(300);
await presenter.screenshot({ path: 'docs/images/presenter-desktop.png' });
await presenter.setViewportSize({ width: 390, height: 844 });
await presenter.screenshot({ path: 'docs/images/presenter-phone.png' });
await browser.close();
