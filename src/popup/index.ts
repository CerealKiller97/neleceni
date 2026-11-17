import { resolveLang, t, type Lang } from '../shared/i18n.ts';
import { applyTranslations } from '../shared/i18n-dom.ts';
import type { GetStatusMessage, TabStatus, ToggleMessage } from '../shared/messages.ts';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../shared/settings.ts';

const enabled = document.getElementById('enabled') as HTMLInputElement;
const stateBox = document.getElementById('state') as HTMLDivElement;
const headline = document.getElementById('headline') as HTMLDivElement;
const detail = document.getElementById('detail') as HTMLDivElement;
const toggleBtn = document.getElementById('toggle') as HTMLButtonElement;

let lang: Lang = resolveLang(DEFAULT_SETTINGS.language);
let last: TabStatus | null = null;

async function activeTabId(): Promise<number | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.id;
}

function show(s: TabStatus | null): void {
  last = s;
  stateBox.className = 'state';
  toggleBtn.disabled = !s?.active;
  if (!s) {
    headline.textContent = t(lang, 'popupNotYoutube');
    detail.textContent = t(lang, 'popupNotYoutubeDetail');
    return;
  }
  if (!s.enabled) {
    headline.textContent = t(lang, 'popupOff');
    detail.textContent = t(lang, 'popupOffDetail');
    return;
  }
  if (!s.active) {
    headline.textContent = t(lang, 'popupIdle');
    detail.textContent = t(lang, 'popupIdleDetail');
    return;
  }
  stateBox.classList.add(s.muted ? 'muted' : 'listening');
  headline.textContent = `${t(lang, s.muted ? 'muted' : 'listening')}${s.manual ? ` ${t(lang, 'manual')}` : ''}`;
  detail.textContent = s.error
    ? t(lang, 'noteOcrError', { error: s.error })
    : s.line
      ? t(lang, 'popupCaption', { line: s.line })
      : t(lang, 'popupNoCaption');
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

applyTranslations(document, lang);
void loadSettings().then((s) => {
  enabled.checked = s.enabled;
  lang = resolveLang(s.language);
  applyTranslations(document, lang);
  show(last);
});
void send({ type: 'get-status' });
setInterval(() => void send({ type: 'get-status' }), 1000);
