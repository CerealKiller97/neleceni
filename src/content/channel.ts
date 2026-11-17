/** Works out which channel the video on screen belongs to, from YouTube's watch-page DOM. */

/** Canonical key for a channel: lower-cased `@handle` or `uc…` channel ID. Accepts full URLs too. */
export function channelKey(input: string): string {
  const s = input.trim();
  const handle = s.match(/@[\w.\-·]+/u);
  if (handle) return handle[0].toLowerCase();
  const id = s.match(/UC[\w-]{22}/);
  if (id) return id[0].toLowerCase();
  return s.toLowerCase();
}

/** Video ID from /watch?v=… or /live/…, else null. */
export function currentVideoId(loc: Location = location): string | null {
  if (loc.pathname === '/watch') return new URLSearchParams(loc.search).get('v');
  return loc.pathname.match(/^\/live\/([\w-]{11})/)?.[1] ?? null;
}

const OWNER_LINKS = [
  'ytd-watch-metadata #owner a[href]',
  'ytd-video-owner-renderer a[href]',
  'ytd-watch-flexy #upload-info a[href]',
].join(',');

/**
 * Channel keys of the video owner, or null while the page is still showing the previous
 * video's metadata (YouTube is a single-page app and updates the DOM lazily).
 */
export function ownerChannels(videoId: string): string[] | null {
  const flexy = document.querySelector('ytd-watch-flexy');
  const shownId = flexy?.getAttribute('video-id');
  if (shownId && shownId !== videoId) return null;
  const keys = new Set<string>();
  for (const a of document.querySelectorAll<HTMLAnchorElement>(OWNER_LINKS)) {
    const href = a.getAttribute('href') ?? '';
    if (href.startsWith('/@') || href.startsWith('/channel/')) keys.add(channelKey(href));
  }
  return keys.size ? [...keys] : null;
}

export function channelMatches(owners: string[], wanted: string[]): boolean {
  if (!wanted.length) return true;
  const want = new Set(wanted.map(channelKey));
  return owners.some((o) => want.has(o));
}
