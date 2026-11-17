// Renders the Chrome Web Store images into store/images/.
//
// Needs a Chromium browser started with remote debugging and the built extension loaded, e.g.
//   "Brave Browser" or Chrome for Testing --remote-debugging-port=9333 --load-extension=$PWD/dist
// then: node store/render.mjs [port]
import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'images');
const port = process.argv[2] ?? '9333';
const base = `http://127.0.0.1:${port}`;
const scenes = pathToFileURL(join(here, 'src', 'scenes.html')).href;

async function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.addEventListener('open', r); ws.addEventListener('error', j); });
  let id = 0;
  const pending = new Map();
  const events = [];
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else events.push(m);
  });
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  return { ws, send, events };
}

async function shoot(url, width, height, file, before) {
  // Open the URL directly: Chrome does not let a blank tab navigate to an extension page.
  const target = await (await fetch(`${base}/json/new?${url}`, { method: 'PUT' })).json();
  const { ws, send } = await connect(target.webSocketDebuggerUrl);
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await send('Page.reload');
  await new Promise((r) => setTimeout(r, 1500));
  if (before) await send('Runtime.evaluate', { expression: before, awaitPromise: true });
  await new Promise((r) => setTimeout(r, 300));
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height, scale: 1 } });
  await writeFile(join(out, file), Buffer.from(shot.result.data, 'base64'));
  ws.close();
  await fetch(`${base}/json/close/${target.id}`);
  console.log('wrote', file);
}

// Chrome derives an unpacked extension's ID from its folder path: SHA-256, first 32 hex digits,
// each digit 0-f written as a-p. Override with EXT_ID if the extension was loaded from elsewhere.
function extensionId(path) {
  const hex = createHash('sha256').update(path).digest('hex').slice(0, 32);
  return [...hex].map((c) => String.fromCharCode(97 + parseInt(c, 16))).join('');
}

await mkdir(out, { recursive: true });
const origin = `chrome-extension://${process.env.EXT_ID ?? extensionId(join(here, '..', 'dist'))}`;

for (const lang of ['sr', 'en']) {
  await shoot(`${scenes}?action.${lang}`, 1280, 800, `${lang}-1-action.png`);
  await shoot(`${scenes}?lines.${lang}`, 1280, 800, `${lang}-2-name-line.png`);
  // The real settings page, after choosing the language in storage (the page re-reads it on load).
  await shoot(`${origin}/options.html`, 1280, 800, `${lang}-3-settings.png`,
    `chrome.storage.sync.set({ settings: { language: '${lang}' } }).then(() => new Promise((r) => { location.reload(); setTimeout(r, 1200); }))`);
  await shoot(`${scenes}?popup.${lang}`, 1280, 800, `${lang}-4-controls.png`);
}
await shoot(`${origin}/options.html`, 400, 300, '.reset.png', 'chrome.storage.sync.clear()');

await shoot(`${scenes}?promo-small`, 440, 280, 'promo-small-440x280.png');
await shoot(`${scenes}?promo-marquee`, 1400, 560, 'promo-marquee-1400x560.png');
await rm(join(out, '.reset.png'), { force: true });
