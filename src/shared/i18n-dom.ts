import { t, type Lang, type MessageKey } from './i18n.ts';

/**
 * Fills every element with a `data-i18n="key"` attribute with the text for `key`. Keys ending in
 * `Html` hold fixed markup from i18n.ts and are set as HTML; the rest as plain text.
 */
export function applyTranslations(root: ParentNode, lang: Lang): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const key = el.dataset.i18n as MessageKey;
    if (key.endsWith('Html')) el.innerHTML = t(lang, key);
    else el.textContent = t(lang, key);
  }
  if (root instanceof Document) {
    root.documentElement.lang = lang === 'sr' ? 'sr-Cyrl' : 'en';
    const title = root.querySelector<HTMLElement>('[data-i18n-title]')?.dataset.i18nTitle as MessageKey | undefined;
    if (title) root.title = t(lang, title);
  }
}
