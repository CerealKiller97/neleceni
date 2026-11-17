/**
 * Removes white shapes that cannot be caption letters from a binary mask.
 *
 * Caption letters are white with a dark outline, so each letter is a small, separate blob.
 * White desks, papers and shirts behind the caption form large blobs, or are cut off by the
 * top or bottom edge of the crop. Dropping those before OCR keeps them from merging with the
 * letters, which is what made Tesseract misread names over the busy chamber background.
 */
export interface GlyphLimits {
  /** Tallest allowed blob, in pixels. */
  maxHeight: number;
  /** Widest allowed blob, in pixels (two touching letters should still fit). */
  maxWidth: number;
  /** Smaller blobs are specks of noise. */
  minArea: number;
}

/** Default limits for a crop `height` pixels tall that holds two caption lines. */
export function limitsFor(height: number): GlyphLimits {
  return {
    maxHeight: Math.round(height * 0.5),
    maxWidth: Math.round(height * 0.75),
    minArea: Math.max(4, Math.round(height * height * 0.0004)),
  };
}

/**
 * Clears (sets to 0) every 4-connected blob of 1s in `mask` that is too big, too small, or
 * touches the top or bottom edge. Works in place; returns how many pixels are left.
 */
export function keepGlyphs(mask: Uint8Array, width: number, height: number, limits: GlyphLimits): number {
  const seen = new Uint8Array(mask.length);
  const blob = new Int32Array(mask.length); // pixel indices of the current blob
  let kept = 0;

  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;

    // Flood fill, using `blob` both as the stack and as the list of the blob's pixels.
    let size = 0;
    let head = 0;
    blob[size++] = start;
    seen[start] = 1;
    let minX = width, maxX = -1, minY = height, maxY = -1;
    while (head < size) {
      const p = blob[head++]!;
      const x = p % width;
      const y = (p - x) / width;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (x > 0 && mask[p - 1] && !seen[p - 1]) { seen[p - 1] = 1; blob[size++] = p - 1; }
      if (x < width - 1 && mask[p + 1] && !seen[p + 1]) { seen[p + 1] = 1; blob[size++] = p + 1; }
      if (y > 0 && mask[p - width] && !seen[p - width]) { seen[p - width] = 1; blob[size++] = p - width; }
      if (y < height - 1 && mask[p + width] && !seen[p + width]) { seen[p + width] = 1; blob[size++] = p + width; }
    }

    const tooBig = maxY - minY + 1 > limits.maxHeight || maxX - minX + 1 > limits.maxWidth;
    const cutOff = minY === 0 || maxY === height - 1;
    if (tooBig || cutOff || size < limits.minArea) {
      for (let i = 0; i < size; i++) mask[blob[i]!] = 0;
    } else {
      kept += size;
    }
  }
  return kept;
}
