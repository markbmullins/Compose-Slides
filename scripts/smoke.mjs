import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.DEMO_URL ?? 'http://127.0.0.1:5175';
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined,
});
try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const deck = await context.newPage();
  await deck.goto(`${base}/#title/0`);
  await deck.locator('.stage').waitFor();
  await deck.waitForTimeout(150);
  await deck.keyboard.press('ArrowRight');
  await deck.waitForFunction(() => location.hash === '#title/1');
  await deck.keyboard.press('ArrowRight');
  await deck.waitForFunction(() => location.hash === '#signal/0');
  const presenter = await context.newPage();
  await presenter.goto(`${base}/?presenter`);
  await presenter.getByText('Say now').waitFor();
  await presenter.locator('.pv-preview').waitFor();
  assert.match(await presenter.locator('.pv-where').innerText(), /Signal\s+1\/3/);
  await presenter.getByRole('button', { name: 'Next →' }).click();
  await deck.waitForFunction(() => location.hash === '#signal/1');
  await presenter.getByText('STEP 02 / 03').waitFor();
  await presenter.setViewportSize({ width: 390, height: 844 });
  assert.equal(await presenter.locator('.pv-preview').isVisible(), false);
  assert.equal(await presenter.getByRole('button', { name: 'Next →' }).isVisible(), true);
  const print = await context.newPage();
  await print.goto(`${base}/?print=final&scenes=title,close`);
  await print.locator('.print-page').first().waitFor();
  assert.equal(await print.locator('.print-page').count(), 2);
  const gallery = await context.newPage();
  const errors = [];
  gallery.on('pageerror', (error) => errors.push(error.message));
  for (const [id, selector] of [
    ['progress', '.cs-progress-split'],
    ['journey', '.cs-flow'],
    ['bars', '.cs-comparison-chart'],
    ['architecture', '.cs-flow'],
    ['sequence', '.cs-sequence'],
    ['matrix', '.cs-matrix'],
    ['timeline', '.cs-timeline'],
    ['distribution', '.cs-distribution'],
    ['roadmap', '.cs-roadmap'],
    ['numbered', '.cs-numbered-list'],
  ]) {
    await gallery.goto(`${base}/?gallery=${id}`);
    await gallery.locator(selector).first().waitFor();
    assert.equal(await gallery.locator('.gallery-stage').count(), 1, id);
  }
  assert.deepEqual(errors, []);
  await context.close();
  console.log('PASS demo navigation, presenter sync, print selection and ten gallery routes');
} finally {
  await browser.close();
}
