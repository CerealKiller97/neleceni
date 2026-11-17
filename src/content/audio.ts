/**
 * Silences a <video> without touching YouTube's own mute button or volume.
 *
 * The element is routed through Web Audio (source → gain → speakers) the first time a mute is
 * needed, and the gain is ramped to 0 or 1. A media element can be connected to Web Audio only
 * once, so if another extension already did that we fall back to `video.muted`.
 */
export class AudioGate {
  private ctx: AudioContext | null = null;
  private readonly gains = new WeakMap<HTMLMediaElement, GainNode>();
  /** Elements we muted through the `muted` property (fallback path). */
  private readonly mutedByUs = new WeakSet<HTMLMediaElement>();
  private resumeHooked = false;
  muted = false;
  /** Set when audio is held back by the browser's autoplay policy until the user clicks. */
  needsGesture = false;

  set(video: HTMLMediaElement, muted: boolean): void {
    this.muted = muted;
    let gain = this.gains.get(video);
    if (!gain && muted && !this.mutedByUs.has(video)) gain = this.hook(video) ?? undefined;

    if (gain && this.ctx) {
      gain.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.03);
      this.ensureRunning();
      return;
    }
    // Fallback path.
    if (muted && !video.muted) {
      video.muted = true;
      this.mutedByUs.add(video);
    } else if (!muted && this.mutedByUs.has(video)) {
      video.muted = false;
      this.mutedByUs.delete(video);
    }
  }

  private hook(video: HTMLMediaElement): GainNode | null {
    try {
      this.ctx ??= new AudioContext();
      const source = this.ctx.createMediaElementSource(video);
      const gain = this.ctx.createGain();
      gain.gain.value = 1;
      source.connect(gain).connect(this.ctx.destination);
      this.gains.set(video, gain);
      return gain;
    } catch (err) {
      console.warn('[shut-down-577] Web Audio routing failed, using video.muted instead:', err);
      return null;
    }
  }

  private ensureRunning(): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state === 'running') {
      this.needsGesture = false;
      return;
    }
    ctx.resume().then(
      () => (this.needsGesture = ctx.state !== 'running'),
      () => (this.needsGesture = true),
    );
    if (this.resumeHooked) return;
    // Chrome only lets an AudioContext start after a user gesture on the page.
    this.resumeHooked = true;
    const resume = (): void => {
      void ctx.resume().then(() => {
        this.needsGesture = ctx.state !== 'running';
        if (!this.needsGesture) {
          window.removeEventListener('pointerdown', resume, true);
          window.removeEventListener('keydown', resume, true);
          this.resumeHooked = false;
        }
      });
    };
    window.addEventListener('pointerdown', resume, true);
    window.addEventListener('keydown', resume, true);
  }
}
