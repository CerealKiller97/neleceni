import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { binarize, open, thinRunShare } from '../src/shared/binarize.ts';

/** RGBA image from rows of '#' (white) and '.' (dark). */
function image(rows: string[]): { rgba: Uint8Array; w: number; h: number } {
  const w = rows[0]!.length;
  const rgba = new Uint8Array(rows.length * w * 4);
  rows.forEach((r, y) => [...r].forEach((c, x) => rgba.fill(c === '#' ? 255 : 20, (y * w + x) * 4, (y * w + x) * 4 + 3)));
  return { rgba, w, h: rows.length };
}
const show = (m: Uint8Array, w: number) =>
  Array.from({ length: m.length / w }, (_, y) => [...m.slice(y * w, (y + 1) * w)].map((v) => (v ? '#' : '.')).join(''));

describe('open', () => {
  it('removes 1 px lines and keeps thick strokes', () => {
    const { rgba, w, h } = image([
      '..............',
      '.#########....',
      '.#.......#....',
      '.#.#####.#....',
      '.#.#####.#....',
      '.#.#####.#....',
      '.#.......#....',
      '.#########....',
      '..............',
    ]);
    const mask = new Uint8Array(w * h);
    for (let p = 0; p < mask.length; p++) mask[p] = rgba[p * 4]! > 128 ? 1 : 0;
    open(mask, w, h, 1);
    assert.deepEqual(show(mask, w), [
      '..............',
      '..............',
      '..............',
      '...#####......',
      '...#####......',
      '...#####......',
      '..............',
      '..............',
      '..............',
    ]);
  });
});

describe('binarize', () => {
  it('measures thin runs: rings are thin, letter strokes are not', () => {
    const ring = new Uint8Array([1, 0, 0, 1, 0, 0, 1, 0]);
    assert.equal(thinRunShare(ring, 8, 1), 1);
    const stroke = new Uint8Array(216 * 10).fill(0);
    for (let y = 0; y < 10; y++) for (let x = 10; x < 17; x++) stroke[y * 216 + x] = 1;
    assert.equal(thinRunShare(stroke, 216, 10), 0);
  });
  it('leaves ordinary captions alone', () => {
    const rows = Array.from({ length: 40 }, (_, y) =>
      y >= 10 && y < 30 ? '..' + '######......'.repeat(6) + '..' : '.'.repeat(76),
    );
    const { rgba, w, h } = image(rows);
    const out = binarize(rgba, w, h, { whiteThreshold: 225 });
    assert.equal(out.ringed, false);
    assert.equal(out.ink, 6 * 6 * 20);
  });
});
