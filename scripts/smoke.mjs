import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.DEMO_URL ?? 'http://127.0.0.1:5175';
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined });
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
  assert.match(await presenter.locator('.pv-where').innerText(), /Signal\s+1\/3/);
  await presenter.getByRole('button', { name: 'Next →' }).click();
  await deck.waitForFunction(() => location.hash === '#signal/1');
  const print = await context.newPage();
  await print.goto(`${base}/?print=final&scenes=title,close`);
  await print.locator('.print-page').first().waitFor();
  assert.equal(await print.locator('.print-page').count(), 2);
  await context.close();
  console.log('PASS demo navigation, presenter sync and print selection');
} finally { await browser.close(); }
