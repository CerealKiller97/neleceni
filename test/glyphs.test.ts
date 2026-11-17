import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';
import { keepGlyphs, type GlyphLimits } from '../src/shared/glyphs.ts';

/** Build a mask from rows of '#' (1) and '.' (0). */
function mask(rows: string[]): { m: Uint8Array; w: number; h: number } {
  const w = rows[0]!.length;
  const m = new Uint8Array(rows.length * w);
  rows.forEach((r, y) => [...r].forEach((c, x) => (m[y * w + x] = c === '#' ? 1 : 0)));
  return { m, w, h: rows.length };
}
const show = (m: Uint8Array, w: number) =>
  Array.from({ length: m.length / w }, (_, y) => [...m.slice(y * w, (y + 1) * w)].map((v) => (v ? '#' : '.')).join(''));

const limits: GlyphLimits = { maxHeight: 4, maxWidth: 5, minArea: 2 };

describe('keepGlyphs', () => {
  it('keeps letter-sized blobs and drops big, tiny and edge-cut ones', () => {
    const { m, w, h } = mask([
      '..........#.......',
      '.##..#....#..######',
      '.##..##.......######',
      '.##...........######',
      '.....#..............',
      '...................#',
    ].map((r) => r.padEnd(20, '.')));
    keepGlyphs(m, w, h, limits);
    assert.deepEqual(show(m, w), [
      '....................',
      '.##..#..............', // letter kept, 6-wide block dropped
      '.##..##.............',
      '.##.................',
      '....................', // single specks dropped
      '....................', // blob touching the bottom edge dropped
    ]);
  });
});
