import { binarize } from '../shared/binarize.ts';
import type { Region } from '../shared/settings.ts';

export interface Capture {
  /** PNG data URL: caption text in black on white. */
  dataUrl: string;
  width: number;
  height: number;
  /** Share of pixels that passed the white filter (0–1). */
  ink: number;
  /** Coarse fingerprint of the binarised crop, to skip OCR when nothing changed. */
  signature: Uint8Array;
}

/** Crops are scaled so the caption strip is about this tall; Tesseract likes ~30–60 px letters. */
const TARGET_HEIGHT = 160;
const PAD = 12;
const SIG_W = 48;
const SIG_H = 8;

const work = document.createElement('canvas');
const workCtx = work.getContext('2d', { willReadFrequently: true })!;
const out = document.createElement('canvas');
const outCtx = out.getContext('2d')!;

/**
 * Crop the caption region from the current video frame and binarise it: letter-sized shapes of
 * bright, grey pixels (the white caption letters) become black, everything else white.
 *
 * Returns null when the frame is not available. YouTube plays through MediaSource (blob: URLs),
 * so the canvas is not tainted and pixels can be read.
 */
export function captureCaption(video: HTMLVideoElement, region: Region, whiteThreshold: number): Capture | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh || video.readyState < 2) return null;

  const sx = Math.round((region.x / 100) * vw);
  const sy = Math.round((region.y / 100) * vh);
  const sw = Math.max(1, Math.round((region.w / 100) * vw));
  const sh = Math.max(1, Math.round((region.h / 100) * vh));
  // Small crops are enlarged for Tesseract. Large ones are kept as they are: shrinking a 1080p
  // frame half-blurs the hollow cores of the large caption's letters, which then can't be filled.
  const scale = Math.min(3, Math.max(1, TARGET_HEIGHT / sh));
  const dw = Math.round(sw * scale);
  const dh = Math.round(sh * scale);

  work.width = dw;
  work.height = dh;
  workCtx.imageSmoothingQuality = 'high';
  workCtx.drawImage(video, sx, sy, sw, sh, 0, 0, dw, dh);
  const img = workCtx.getImageData(0, 0, dw, dh);
  const px = img.data;

  const { mask, ink } = binarize(px, dw, dh, { whiteThreshold });

  // Black text on white for Tesseract, plus a coarse signature of what is left.
  const sig = new Uint32Array(SIG_W * SIG_H);
  for (let y = 0; y < dh; y++) {
    const sigRow = Math.min(SIG_H - 1, Math.floor((y * SIG_H) / dh)) * SIG_W;
    for (let x = 0; x < dw; x++) {
      const p = y * dw + x;
      const i = p * 4;
      const isText = mask[p] === 1;
      px[i] = px[i + 1] = px[i + 2] = isText ? 0 : 255;
      px[i + 3] = 255;
      if (isText) sig[sigRow + Math.min(SIG_W - 1, Math.floor((x * SIG_W) / dw))]! += 1;
    }
  }

  // White border around the text helps Tesseract find line edges.
  out.width = dw + PAD * 2;
  out.height = dh + PAD * 2;
  outCtx.fillStyle = '#fff';
  outCtx.fillRect(0, 0, out.width, out.height);
  outCtx.putImageData(img, PAD, PAD);

  const cell = (dw * dh) / (SIG_W * SIG_H);
  const signature = new Uint8Array(sig.length);
  for (let i = 0; i < sig.length; i++) signature[i] = Math.min(255, Math.round((sig[i]! / cell) * 255));

  return { dataUrl: out.toDataURL('image/png'), width: out.width, height: out.height, ink: ink / (dw * dh), signature };
}

/** Mean absolute difference between two signatures, 0–1. */
export function signatureDistance(a: Uint8Array, b: Uint8Array): number {
  if (a.length !== b.length) return 1;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i]! - b[i]!);
  return sum / (a.length * 255);
}
