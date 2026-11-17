import type { OcrLine } from './match.ts';

/** Content script → service worker: read the text in this image. */
export interface OcrRequest {
  type: 'ocr';
  /** PNG data URL of the pre-processed caption crop. */
  image: string;
  langs: string;
}

/** Service worker → offscreen document. */
export interface OffscreenOcrRequest extends Omit<OcrRequest, 'type'> {
  target: 'offscreen';
  type: 'offscreen-ocr';
}

export type OcrResponse = { ok: true; lines: OcrLine[]; ms: number } | { ok: false; error: string };

/** Content script → service worker: update the toolbar badge for this tab. */
export interface StatusMessage {
  type: 'status';
  active: boolean;
  muted: boolean;
}

/** Service worker / popup → content script. */
export interface ToggleMessage {
  type: 'toggle';
}

export interface GetStatusMessage {
  type: 'get-status';
}

/** What the content script reports to the popup. */
export interface TabStatus {
  enabled: boolean;
  /** A video from a watched channel is playing in this tab. */
  active: boolean;
  muted: boolean;
  manual: boolean;
  /** Last name line read, if any. */
  line: string;
  error: string;
}

export type ToContent = ToggleMessage | GetStatusMessage;
export type ToBackground = OcrRequest | StatusMessage;
