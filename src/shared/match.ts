/**
 * Pure text logic: Serbian transliteration, fuzzy name matching and picking the
 * speaker-name line out of OCR output. No browser APIs here, so it runs under `node --test`.
 */

const CYR_TO_LAT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'dj', е: 'e', ж: 'z', з: 'z', и: 'i',
  ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', ћ: 'c', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'c', џ: 'dz', ш: 's',
};

/**
 * Lower-case, transliterate Serbian Cyrillic to Latin, drop diacritics and
 * turn everything that is not a letter into a single space.
 * "Александар Вучић" and "Aleksandar Vučić" both become "aleksandar vucic".
 */
export function normalize(text: string): string {
  let out = '';
  for (const ch of text.toLowerCase()) out += CYR_TO_LAT[ch] ?? ch;
  return out
    .replace(/đ/g, 'dj')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z]+/g, ' ')
    .trim();
}

/** Plain Levenshtein distance. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/**
 * Smallest edit distance between `needle` and any substring of `hay`
 * (Sellers' algorithm). Catches names that OCR glued to a neighbour, e.g. "aleksandarvucic".
 */
export function substringDistance(hay: string, needle: string): number {
  if (!needle.length) return 0;
  let prev = new Array<number>(hay.length + 1).fill(0);
  for (let i = 1; i <= needle.length; i++) {
    const cur = [i];
    for (let j = 1; j <= hay.length; j++) {
      const cost = needle[i - 1] === hay[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = cur;
  }
  return Math.min(...prev);
}

/** How many OCR mistakes a name token of this length may have. */
export function allowedErrors(tokenLength: number): number {
  if (tokenLength >= 8) return 2;
  if (tokenLength >= 4) return 1;
  return 0;
}

/**
 * True when `line` shows `name`.
 *
 * Every word of the name must be found in the line, fuzzily. At least one word must be found
 * whole; the others may also be found as a recognisable piece, because letters over a bright
 * background get lost: the replay read "Александар Вучић" as "А екса · р Вучић", where "екса"
 * is a piece of "Александар". A piece must be at least 3 letters and 40 % of the word.
 */
export function lineMatchesName(line: string, name: string): boolean {
  const tokens = normalize(name).split(' ').filter(Boolean);
  if (!tokens.length) return false;
  const words = normalize(line).split(' ').filter(Boolean);
  const compact = words.join('');
  if (!compact.length) return false;

  const whole = (t: string) => substringDistance(compact, t) <= allowedErrors(t.length);
  const piece = (t: string) =>
    words.some(
      (w) => w.length >= Math.max(3, Math.ceil(t.length * 0.4)) && w.length < t.length &&
        substringDistance(t, w) <= allowedErrors(w.length),
    );

  const found = tokens.map(whole);
  return found.some(Boolean) && tokens.every((t, i) => found[i] || piece(t));
}

export interface OcrLine {
  text: string;
  /** 0–100 as reported by Tesseract. */
  confidence: number;
  /** Top and bottom of the line, in pixels of the OCR image. */
  y0: number;
  y1: number;
}

/** A line whose centre lies below this fraction of the crop is treated as the group/party line. */
export const NAME_ZONE = 0.6;

/** Parliamentary group lines read like "Александар Вучић - Србија побеђује": a dash with spaces around it. */
const GROUP_LINE = /\s[-–—]\s/;

const trimNoise = (s: string): string => s.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');

/** Readable version of an OCR line for display: words of 2+ letters, edge punctuation removed. */
export function cleanLine(text: string): string {
  return text
    .split(/\s+/)
    .map(trimNoise)
    .filter((w) => (w.match(/\p{L}/gu)?.length ?? 0) >= 2)
    .join(' ');
}

/** Words of at least 3 letters, which is what a real name is made of. */
export const nameWords = (text: string): string[] => normalize(text).split(' ').filter((w) => w.length >= 3);

/**
 * Pick the line that holds the speaker's name.
 *
 * The parliament caption has two lines: the name, then the parliamentary group. The group
 * often contains a party leader's name, so only the top line may decide anything. Lines that
 * look like a group line, or that sit in the lower part of the crop, are skipped.
 */
export function pickSpeakerLine(lines: OcrLine[], imageHeight: number): OcrLine | null {
  const candidates = lines
    .map((l) => ({ ...l, text: trimNoise(l.text.trim()) }))
    .filter((l) => nameWords(l.text).length >= 1 && !GROUP_LINE.test(l.text))
    .sort((a, b) => a.y0 - b.y0);
  const top = candidates[0];
  if (!top) return null;
  if (imageHeight > 0 && (top.y0 + top.y1) / 2 > imageHeight * NAME_ZONE) return null;
  return top;
}

export type Observation =
  | { kind: 'none' }
  | { kind: 'target'; name: string; line: string }
  | { kind: 'other'; line: string };

/** Turn OCR output into one observation for the mute state machine. */
export function classify(
  lines: OcrLine[],
  imageHeight: number,
  speakers: string[],
  minConfidence: number,
): Observation {
  const line = pickSpeakerLine(lines, imageHeight);
  if (!line) return { kind: 'none' };
  const hit = speakers.find((name) => lineMatchesName(line.text, name));
  // Report the configured spelling, not the (often garbled) OCR text.
  if (hit) return { kind: 'target', name: hit, line: hit };
  // Another speaker needs a confident, name-shaped line: at least two real words.
  if (line.confidence >= minConfidence && nameWords(line.text).length >= 2) {
    return { kind: 'other', line: cleanLine(line.text) };
  }
  return { kind: 'none' };
}

/**
 * True when two OCR readings are probably the same caption. OCR noise changes a letter or two
 * between frames, while a new speaker's name differs in most letters.
 */
export function similarLines(a: string, b: string): boolean {
  const ca = normalize(a).replace(/ /g, '');
  const cb = normalize(b).replace(/ /g, '');
  const longest = Math.max(ca.length, cb.length);
  if (longest === 0) return true;
  return levenshtein(ca, cb) <= Math.floor(longest * 0.35);
}
