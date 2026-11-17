import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { MESSAGES, resolveLang, t, type MessageKey } from '../src/shared/i18n.ts';
import { sanitize } from '../src/shared/settings.ts';

const keys = Object.keys(MESSAGES.en) as MessageKey[];
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
const tags = (s: string) => [...s.matchAll(/<\/?([a-z]+)[^>]*>/g)].map((m) => m[0].replace(/>.*$/, '>')).sort();

describe('translations', () => {
  it('has every text in both languages, non-empty', () => {
    assert.deepEqual(Object.keys(MESSAGES.sr).sort(), [...keys].sort());
    for (const k of keys) {
      assert.ok(MESSAGES.en[k].trim(), `en.${k} empty`);
      assert.ok(MESSAGES.sr[k].trim(), `sr.${k} empty`);
    }
  });
  it('keeps placeholders and markup identical between languages', () => {
    for (const k of keys) {
      assert.deepEqual(placeholders(MESSAGES.sr[k]), placeholders(MESSAGES.en[k]), `placeholders in ${k}`);
      assert.deepEqual(tags(MESSAGES.sr[k]), tags(MESSAGES.en[k]), `markup in ${k}`);
    }
  });
  it('uses markup only in keys meant for HTML', () => {
    for (const k of keys) if (!k.endsWith('Html')) assert.ok(!/[<>]/.test(MESSAGES.en[k] + MESSAGES.sr[k]), k);
  });
  it('keeps badge texts within the 4 characters Chrome shows', () => {
    for (const lang of ['en', 'sr'] as const) for (const k of ['badgeOn', 'badgeMuted'] as const) assert.ok(t(lang, k).length <= 4);
  });
  it('writes Serbian in Cyrillic', () => {
    assert.match(t('sr', 'muted'), /^[\p{Script=Cyrillic} ]+$/u);
    assert.equal(t('sr', 'popupCaption', { line: 'Ана Брнабић' }), 'Натпис: Ана Брнабић');
  });
});

describe('language choice', () => {
  it('follows Chrome when automatic', () => {
    assert.equal(resolveLang('auto', 'sr'), 'sr');
    assert.equal(resolveLang('auto', 'sr-Latn-RS'), 'sr');
    assert.equal(resolveLang('auto', 'en-US'), 'en');
    assert.equal(resolveLang('auto', 'hr'), 'en');
  });
  it('uses the chosen language otherwise', () => {
    assert.equal(resolveLang('sr', 'en-US'), 'sr');
    assert.equal(resolveLang('en', 'sr'), 'en');
  });
  it('defaults to automatic and rejects unknown values', () => {
    assert.equal(sanitize({}).language, 'auto');
    assert.equal(sanitize({ language: 'sr' }).language, 'sr');
    assert.equal(sanitize({ language: 'de' }).language, 'auto');
  });
});
