/**
 * Turns the caption crop (RGBA pixels) into a text mask for OCR. Pure code, shared by the
 * content script and the offline tests.
 */
import { keepGlyphs, limitsFor } from './glyphs.ts';

/** A white pixel must also be grey-ish: max(R,G,B) − min(R,G,B) at most this. */
const MAX_CHROMA = 40;
/** Reference crop height: the 80–100 % region of a 1080p frame. Sizes below are for this height. */
const REF_HEIGHT = 216;
/** Horizontal text runs this short (px at REF_HEIGHT) are thin lines, not letter strokes. */
const THIN_RUN = 3;
/**
 * The image has outline rings when at least this share of text runs are thin. Measured: large
 * caption mid-animation 0.53, cross-fade with it 0.38, ordinary captions at 720p/1080p 0.04–0.18.
 */
const RING_SHARE = 0.3;
/** Opening radius (px at REF_HEIGHT): removes 1–2 px lines, keeps 5–7 px letter strokes. */
const OPEN_RADIUS = 1;

export interface BinarizeOptions {
  /** A pixel is text when R, G and B are all at least this bright. */
  whiteThreshold: number;
}

export interface BinarizeResult {
  mask: Uint8Array;
  ink: number;
  /** Thin outline rings around the letters were found and removed. */
  ringed: boolean;
}

/**
 * Returns a mask (1 = caption text) and how many text pixels it has.
 *
 * 1. Bright, grey pixels are candidate text (the caption letters are white).
 * 2. Only letter-sized shapes are kept (drops desks, papers, shirts).
 * 3. Thin outline rings are removed. While the large caption animates, every letter has a thin
 *    white ring a few pixels around it. At 720p it blurs away; at 1080p it stays and OCR reads
 *    the letters as garbage. An opening (shrink, then grow by 1 px) removes the ring and keeps
 *    the 5–7 px letter strokes.
 */
export function binarize(
  rgba: Uint8ClampedArray | Uint8Array,
  width: number,
  height: number,
  opts: BinarizeOptions,
): BinarizeResult {
  const mask = new Uint8Array(width * height);
  for (let p = 0, i = 0; p < mask.length; p++, i += 4) {
    const r = rgba[i]!;
    const g = rgba[i + 1]!;
    const b = rgba[i + 2]!;
    const lo = Math.min(r, g, b);
    mask[p] = lo >= opts.whiteThreshold && Math.max(r, g, b) - lo <= MAX_CHROMA ? 1 : 0;
  }
  let ink = keepGlyphs(mask, width, height, limitsFor(height));
  const ringed = thinRunShare(mask, width, height) >= RING_SHARE;
  if (ringed) {
    open(mask, width, height, Math.max(1, Math.round((OPEN_RADIUS * height) / REF_HEIGHT)));
    ink = keepGlyphs(mask, width, height, limitsFor(height));
  }
  return { mask, ink, ringed };
}

/** Share of horizontal text runs that are thin rims rather than letter strokes. */
export function thinRunShare(mask: Uint8Array, width: number, height: number): number {
  const thin = Math.max(1, Math.round((THIN_RUN * height) / REF_HEIGHT));
  let runs = 0;
  let thinRuns = 0;
  for (let y = 0; y < height; y++) {
    let len = 0;
    for (let x = 0; x <= width; x++) {
      const on = x < width && mask[y * width + x] === 1;
      if (on) len++;
      else if (len) {
        runs++;
        if (len <= thin) thinRuns++;
        len = 0;
      }
    }
  }
  return runs ? thinRuns / runs : 0;
}

/** Morphological opening (erode, then dilate) with a square of the given radius, in place. */
export function open(mask: Uint8Array, width: number, height: number, radius: number): void {
  const shrunk = filter(mask, width, height, radius, 0);
  const grown = filter(shrunk, width, height, radius, 1);
  mask.set(grown);
}

/**
 * Separable square max (`hit` = 1, dilation) or min (`hit` = 0, erosion) filter. A pixel becomes
 * `hit` if any pixel within `radius` has that value. Outside the image counts as background for
 * dilation and as text for erosion, so shapes touching the border are not eaten away.
 */
function filter(src: Uint8Array, width: number, height: number, radius: number, hit: 0 | 1): Uint8Array {
  const tmp = new Uint8Array(src.length);
  const out = new Uint8Array(src.length);
  const miss = (1 - hit) as 0 | 1;
  for (let y = 0; y < height; y++) {
    let last = -Infinity; // last x where src == hit
    const row = y * width;
    for (let x = 0; x < width + radius; x++) {
      if (x < width && src[row + x] === hit) last = x;
      const t = x - radius;
      if (t >= 0) tmp[row + t] = x - last <= 2 * radius ? hit : miss;
    }
  }
  for (let x = 0; x < width; x++) {
    let last = -Infinity;
    for (let y = 0; y < height + radius; y++) {
      if (y < height && tmp[y * width + x] === hit) last = y;
      const t = y - radius;
      if (t >= 0) out[t * width + x] = y - last <= 2 * radius ? hit : miss;
    }
  }
  return out;
}
