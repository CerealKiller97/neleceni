import type { GetStatusMessage, TabStatus, ToggleMessage } from '../shared/messages.ts';
import { loadSettings, saveSettings } from '../shared/settings.ts';

const enabled = document.getElementById('enabled') as HTMLInputElement;
const stateBox = document.getElementById('state') as HTMLDivElement;
const headline = document.getElementById('headline') as HTMLDivElement;
const detail = document.getElementById('detail') as HTMLDivElement;
const toggleBtn = document.getElementById('toggle') as HTMLButtonElement;

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

function show(s: TabStatus | null): void {
  stateBox.className = 'state';
  toggleBtn.disabled = !s?.active;
  if (!s) {
    headline.textContent = 'Not on YouTube';
    detail.textContent = 'Open a video from a watched channel.';
    return;
  }
  if (!s.enabled) {
    headline.textContent = 'Off';
    detail.textContent = 'Turn on “Enabled” to start.';
    return;
  }
  if (!s.active) {
    headline.textContent = 'Idle';
    detail.textContent = 'This tab is not playing a video from a watched channel.';
    return;
  }
  stateBox.classList.add(s.muted ? 'muted' : 'listening');
  headline.textContent = `${s.muted ? 'Muted' : 'Listening'}${s.manual ? ' (manual)' : ''}`;
  detail.textContent = s.error ? `OCR error: ${s.error}` : s.line ? `Caption: ${s.line}` : 'No name caption read yet.';
}

async function send(msg: GetStatusMessage | ToggleMessage): Promise<void> {
  const id = await activeTabId();
  if (id === undefined) return show(null);
  try {
    show((await chrome.tabs.sendMessage(id, msg)) as TabStatus);
  } catch {
    show(null); // no content script in this tab
  }
}

enabled.addEventListener('change', async () => {
  const s = await loadSettings();
  await saveSettings({ ...s, enabled: enabled.checked });
  setTimeout(() => void send({ type: 'get-status' }), 150);
});

toggleBtn.addEventListener('click', () => void send({ type: 'toggle' }));
document.getElementById('settings')!.addEventListener('click', () => void chrome.runtime.openOptionsPage());

void loadSettings().then((s) => (enabled.checked = s.enabled));
void send({ type: 'get-status' });
setInterval(() => void send({ type: 'get-status' }), 1000);
