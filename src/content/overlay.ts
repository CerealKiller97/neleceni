/** The small status pill drawn over the player. Built with DOM calls only (YouTube enforces Trusted Types). */

export interface OverlayView {
  muted: boolean;
  manual: boolean;
  /** Last name line read. */
  line: string;
  /** Short note, e.g. an error or "click to enable audio". */
  note: string;
  /** Debug: processed crop and raw OCR lines. */
  debugImage?: string;
  debugText?: string;
}

const CSS = `
:host { all: initial; }
.wrap { position: absolute; top: 12px; right: 12px; z-index: 60; display: flex; flex-direction: column;
  align-items: flex-end; gap: 6px; font: 500 13px/1.3 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
.pill { display: flex; align-items: center; gap: 6px; padding: 5px 10px; border-radius: 999px; cursor: pointer;
  color: #fff; background: rgba(20, 20, 20, .72); border: 1px solid rgba(255, 255, 255, .18);
  user-select: none; max-width: 360px; }
.pill.muted { background: rgba(176, 32, 32, .88); }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #46c46a; flex: none; }
.muted .dot { background: #fff; }
.text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.note { color: #ffd479; background: rgba(20, 20, 20, .72); padding: 3px 8px; border-radius: 6px; max-width: 360px; }
.debug { background: rgba(20, 20, 20, .85); color: #eee; padding: 6px; border-radius: 6px; max-width: 420px;
  font: 11px/1.35 ui-monospace, Menlo, monospace; white-space: pre-wrap; }
.debug img { display: block; max-width: 408px; background: #fff; margin-bottom: 4px; }
[hidden] { display: none !important; }
`;

export class Overlay {
  private host: HTMLDivElement | null = null;
  private pill!: HTMLDivElement;
  private label!: HTMLSpanElement;
  private note!: HTMLDivElement;
  private debug!: HTMLDivElement;
  private debugImg!: HTMLImageElement;
  private debugText!: HTMLDivElement;

  private readonly onClick: () => void;

  constructor(onClick: () => void) {
    this.onClick = onClick;
  }

  private build(): HTMLDivElement {
    const host = document.createElement('div');
    host.id = 'shut-down-577-overlay';
    const root = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = CSS;
    const wrap = document.createElement('div');
    wrap.className = 'wrap';

    this.pill = document.createElement('div');
    this.pill.className = 'pill';
    this.pill.title = 'Shut Down 577: click (or Alt+Shift+M) to mute or un-mute by hand';
    const dot = document.createElement('span');
    dot.className = 'dot';
    this.label = document.createElement('span');
    this.label.className = 'text';
    this.pill.append(dot, this.label);
    this.pill.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onClick();
    });

    this.note = document.createElement('div');
    this.note.className = 'note';
    this.debug = document.createElement('div');
    this.debug.className = 'debug';
    this.debugImg = document.createElement('img');
    this.debugText = document.createElement('div');
    this.debug.append(this.debugImg, this.debugText);

    wrap.append(this.pill, this.note, this.debug);
    root.append(style, wrap);
    return host;
  }

  show(player: HTMLElement, view: OverlayView): void {
    this.host ??= this.build();
    if (this.host.parentElement !== player) player.append(this.host);
    this.host.hidden = false;

    this.pill.classList.toggle('muted', view.muted);
    const state = view.muted ? 'Muted' : 'Listening';
    const who = view.line ? ` · ${view.line}` : '';
    this.label.textContent = `${state}${view.manual ? ' (manual)' : ''}${who}`;

    this.note.textContent = view.note;
    this.note.hidden = !view.note;

    const showDebug = view.debugImage !== undefined;
    this.debug.hidden = !showDebug;
    if (showDebug) {
      if (view.debugImage) this.debugImg.src = view.debugImage;
      this.debugImg.hidden = !view.debugImage;
      this.debugText.textContent = view.debugText ?? '';
    }
  }

  hide(): void {
    if (this.host) this.host.hidden = true;
  }
}
