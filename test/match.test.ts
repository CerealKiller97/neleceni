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
    // Wide-shot readings from the replay: first name partly lost, surname intact.
    assert.ok(lineMatchesName('А екса · р Вучић »“\' =“', TARGET[0]!));
    assert.ok(lineMatchesName('ЦМ екса Вучић то', TARGET[0]!));
  });
  it('does not accept pieces alone or a matching first name with another surname', () => {
    assert.ok(!lineMatchesName('екса Вучић', 'Вучић Александар Петровић'));
    assert.ok(!lineMatchesName('Ана Вучић', TARGET[0]!));
    assert.ok(!lineMatchesName('Александра Вуковић', TARGET[0]!));
    assert.ok(!lineMatchesName('Александар Ђурић', TARGET[0]!));
    assert.ok(!lineMatchesName('екса уци', TARGET[0]!));
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
  // Readings logged from the 17 Nov 2026 replay in a real browser.
  it('handles real replay readings', () => {
    const replay = (top: string, bottom: string, conf = 50) => [line(top, 18, conf), line(bottom, 82, conf)];
    const k = (l: OcrLine[]) => classify(l, H, TARGET, 35).kind;
    assert.equal(k(replay('Миленко Јованов —', 'Александар ВучиЋ- УСрбија побеђује', 54)), 'other');
    assert.equal(k(replay('Миленко Јованбв. “У __', 'Александар ВучтЋ УСрбија побеђује.', 41)), 'other');
    assert.equal(k(replay('у. ипенкађованов', 'ФЏДдександар Ву Србија побеђује', 50)), 'none');
    assert.equal(k(replay('Александар Вучић :.', 'Александар Вучић обубија побеђује', 92)), 'target');
    assert.equal(k(replay('"Халексан р Вучић “> 47 =“ ние', 'жрксан о Вужј у Србија побеђује и', 38)), 'target');
    assert.equal(k(replay('"Фалекса дар Вучић % =', 'фудександар Ву у Србија побеђује |')), 'target');
    // Wide shot: both caption lines merged into one; the group-line dash keeps it from counting.
    assert.equal(k([line('__Алекбиндарвучнијрдајр Вучић - Сромја п', 18, 57)]), 'none');
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
