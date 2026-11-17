import { DEFAULT_SETTINGS, loadSettings, sanitize, saveSettings, type Settings } from '../shared/settings.ts';

const form = document.getElementById('form') as HTMLFormElement;
const saved = document.getElementById('saved') as HTMLSpanElement;

const input = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
const checkbox = (name: string) => form.elements.namedItem(name) as HTMLInputElement;
const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean);
const num = (name: string) => Number(input(name).value);

function fill(s: Settings): void {
  checkbox('enabled').checked = s.enabled;
  checkbox('showBadge').checked = s.showBadge;
  checkbox('debug').checked = s.debug;
  input('speakers').value = s.speakers.join('\n');
  input('channels').value = s.channels.join('\n');
  input('region.x').value = String(s.region.x);
  input('region.y').value = String(s.region.y);
  input('region.w').value = String(s.region.w);
  input('region.h').value = String(s.region.h);
  input('intervalMs').value = String(s.intervalMs);
  input('whiteThreshold').value = String(s.whiteThreshold);
  input('langs').value = s.langs;
  input('otherConfirmations').value = String(s.otherConfirmations);
  input('minConfidence').value = String(s.minConfidence);
  input('releaseAfterGoneSec').value = String(s.releaseAfterGoneSec);
}

function read(): Settings {
  return sanitize({
    enabled: checkbox('enabled').checked,
    showBadge: checkbox('showBadge').checked,
    debug: checkbox('debug').checked,
    speakers: lines(input('speakers').value),
    channels: lines(input('channels').value),
    region: { x: num('region.x'), y: num('region.y'), w: num('region.w'), h: num('region.h') },
    intervalMs: num('intervalMs'),
    whiteThreshold: num('whiteThreshold'),
    langs: input('langs').value,
    otherConfirmations: num('otherConfirmations'),
    minConfidence: num('minConfidence'),
    releaseAfterGoneSec: num('releaseAfterGoneSec'),
  } satisfies Settings);
}

let flashTimer: ReturnType<typeof setTimeout> | undefined;
function flash(text: string): void {
  saved.textContent = text;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => (saved.textContent = ''), 2500);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const s = read();
  await saveSettings(s);
  fill(s); // show the clamped values
  flash('Saved');
});

document.getElementById('reset')!.addEventListener('click', async () => {
  await saveSettings(DEFAULT_SETTINGS);
  fill(DEFAULT_SETTINGS);
  flash('Defaults restored');
});

document.getElementById('shortcuts')!.addEventListener('click', (e) => {
  e.preventDefault();
  void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
});

loadSettings().then(fill, () => fill(DEFAULT_SETTINGS));
