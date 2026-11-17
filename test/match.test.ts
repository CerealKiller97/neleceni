import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { classify, lineMatchesName, normalize, pickSpeakerLine, similarLines, type OcrLine } from '../src/shared/match.ts';
import { channelKey } from '../src/content/channel.ts';

const TARGET = ['Александар Вучић'];
// Two-line caption, as on the 17 Nov 2026 broadcast (crop ~150 px tall).
const line = (text: string, y0: number, confidence = 80): OcrLine => ({ text, confidence, y0, y1: y0 + 40 });
const H = 160;

describe('normalize', () => {
  it('maps Cyrillic and Latin spellings to the same string', () => {
    assert.equal(normalize('Александар Вучић'), 'aleksandar vucic');
    assert.equal(normalize('Aleksandar Vučić'), 'aleksandar vucic');
    assert.equal(normalize('ЂОРЂЕ Џаковић, Љиљана'), 'djordje dzakovic ljiljana');
  });
});

describe('lineMatchesName', () => {
  it('matches clean and noisy OCR of the name', () => {
    assert.ok(lineMatchesName('Александар Вучић', TARGET[0]!));
    assert.ok(lineMatchesName('__Александар Вучић, | а', TARGET[0]!)); // real OCR output
    assert.ok(lineMatchesName('__Александар Вучи ___ а', TARGET[0]!)); // real OCR output, last letter lost
    assert.ok(lineMatchesName('АлександарВучић', TARGET[0]!)); // words glued together
    assert.ok(lineMatchesName('ALEKSANDAR VUČIĆ', TARGET[0]!));
  });
  it('does not match other people', () => {
    assert.ok(!lineMatchesName('Ана Брнабић', TARGET[0]!));
    assert.ok(!lineMatchesName('Александар Јовановић', TARGET[0]!));
    assert.ok(!lineMatchesName('Милош Вучевић', TARGET[0]!));
    assert.ok(!lineMatchesName('Vuk Vučković', TARGET[0]!));
  });
});

describe('pickSpeakerLine', () => {
  it('takes the top line and skips the parliamentary group line', () => {
    const picked = pickSpeakerLine([line('– Александар Вучић - Србија побеђује', 85), line('Ана Брнабић', 20)], H);
    assert.equal(picked?.text, 'Ана Брнабић');
  });
  it('ignores a lone line in the lower part of the crop', () => {
    assert.equal(pickSpeakerLine([line('Александар Вучић Србија побеђује', 85)], H), null);
  });
});

describe('classify', () => {
  it('reports the target from the real two-line caption', () => {
    const lines = [line('__Александар Вучић, | а', 18, 63), line('– Александар Вучић - Србија побеђује“ #Ћ А', 82, 63)];
    assert.deepEqual(classify(lines, H, TARGET, 35), { kind: 'target', name: TARGET[0], line: 'Александар Вучић' });
  });
  it('does not mute a deputy whose group is named after the target', () => {
    const lines = [line('Ана Брнабић', 18), line('Александар Вучић - Србија побеђује', 82)];
    assert.deepEqual(classify(lines, H, TARGET, 35), { kind: 'other', line: 'Ана Брнабић' });
  });
  it('reads nothing when only the group line was recognised', () => {
    assert.deepEqual(classify([line('Александар Вучић - Србија побеђује', 82)], H, TARGET, 35), { kind: 'none' });
  });
  it('needs confidence before calling something another speaker', () => {
    assert.deepEqual(classify([line('Аракоашир Учи Вав', 18, 28)], H, TARGET, 35), { kind: 'none' });
  });
  it('accepts a low-confidence line that still spells the target', () => {
    assert.equal(classify([line('Александар Вучи', 18, 30)], H, TARGET, 35).kind, 'target');
  });
});

describe('similarLines', () => {
  it('treats OCR noise as the same caption and a new name as different', () => {
    assert.ok(similarLines('Александар Вучић', 'Александар Вучи'));
    assert.ok(!similarLines('Александар Вучић', 'Ана Брнабић'));
  });
});

describe('channelKey', () => {
  it('accepts handles, IDs and URLs', () => {
    assert.equal(channelKey('@ParlamentSrbija'), '@parlamentsrbija');
    assert.equal(channelKey('https://www.youtube.com/@ParlamentSrbija/streams'), '@parlamentsrbija');
    assert.equal(channelKey('/channel/UCghngrfQwzJ4aaPZ-UgNIZQ'), 'ucghngrfqwzj4aapz-ugnizq');
  });
});
