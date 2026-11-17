# Shut Down 577

A Chrome extension that mutes a YouTube video while a chosen speaker holds the floor.

It was built for the Serbian National Assembly channel ([@ParlamentSrbija](https://www.youtube.com/@ParlamentSrbija)),
where every speaker gets a name caption in the lower-left corner of the picture. The extension reads that caption
and silences the video while a listed name is shown. It works on **live streams and on replays** of past sessions.

By default it watches @ParlamentSrbija and mutes **Александар Вучић**. Both lists can be changed in the settings.

## How it works

```
YouTube tab (content script)            Service worker               Offscreen document
─────────────────────────────           ──────────────               ──────────────────
every 1.5 s:
  crop caption area of the frame
  keep only white caption pixels ──────▶ relays OCR request ────────▶ Tesseract.js (WASM)
                                                                       Serbian Cyrillic model
  pick the name line, match names ◀──────────────────────────────────  text lines + positions
  mute / un-mute via Web Audio gain
```

1. **Capture.** The content script draws the caption region of the current video frame onto a canvas.
   YouTube plays through MediaSource, so the pixels can be read.
2. **Clean up.** Only bright, grey pixels (the white caption letters) are kept, as black text on white.
   Then every white shape that is too big to be a letter, or is cut off by the edge of the crop, is removed:
   desks, papers and shirts behind the caption. The letters have a dark outline, so each one stays a separate
   small shape. This is what makes OCR reliable over the busy chamber background.
3. **OCR.** [Tesseract.js](https://github.com/naptha/tesseract.js) runs in an offscreen document with the Serbian
   model. All OCR files ship inside the extension, so nothing is downloaded at runtime.
4. **Name line only.** The caption has two lines: the speaker's name, then the parliamentary group. The group line
   for SNS deputies is *"Александар Вучић - Србија побеђује"*, so matching the whole caption would mute every
   member of that group. Only the top line is used; lines shaped like a group name (`name - slogan`) are skipped.
5. **Matching.** Names are compared after Cyrillic→Latin transliteration and with a few OCR mistakes allowed.
   "Александар Вучић", "Aleksandar Vučić" and an OCR reading like "Александар Вучи" all match. One word of the
   name must be read whole; the others may be read as a clear piece (the wide shot gave "А екса · р Вучић").
6. **Mute.** The video's audio goes through a Web Audio gain node, which is set to 0. YouTube's own volume and mute
   button are left alone.

The mute starts on the first reading of a listed name. It ends when another speaker's name has been read 3 times.
A caption that disappears does not end the mute, because the speech usually goes on. When you jump around in a
replay, the state resets and the caption at the new position decides.

## Tested on

The replay of the 17 Nov 2026 session (`watch?v=qkmMyGsHo9o`), in a Chromium browser with the extension loaded:

| Replay time | Caption (line 1 / line 2) | Result |
|---|---|---|
| 7:22:40 | Миленко Јованов / Александар Вучић - Србија побеђује | Listening: the group line is ignored |
| 7:23:09 | Александар Вучић / Александар Вучић - Србија побеђује | Muted about 1 s after the caption appeared (Web Audio gain 1 → 0) |
| 7:23:09, target swapped to Јованов | the same change, in reverse | Un-muted about 5 s after the new caption (3 readings) |
| jump back to 7:22:45 | Миленко Јованов | Listening again, gain back to 1 |

OCR takes 20–120 ms per frame in the offscreen document.

## Install (developer mode)

Requires Node.js 23.6 or newer.

```sh
npm install
npm run build
```

Then in Chrome:

1. Open `chrome://extensions` and turn on **Developer mode**.
2. Click **Load unpacked** and choose the `dist/` folder.
3. Open a live stream or replay from @ParlamentSrbija.

After changing the code, run `npm run build` again and click the reload icon on the extension's card.
`npm run watch` rebuilds on every save.

## Using it

- A **status pill** in the top-right corner of the player shows *Listening* or *Muted* and the last name read.
  Click it to mute or un-mute by hand.
- **Alt+Shift+M** does the same from the keyboard (change it at `chrome://extensions/shortcuts`).
  A manual choice holds until a different speaker's caption appears, then automatic control takes over again.
- The **toolbar badge** shows `ON` when the tab is being watched and `MUTE` while muted.
- The **popup** has an on/off switch, the current state and a mute button.

### Settings

Open them from the popup or from the extension's *Details → Extension options*.

| Setting | Default | Notes |
|---|---|---|
| Speakers to mute | `Александар Вучић` | One per line; every word must match. A surname alone matches anyone with that surname. |
| Channels | `@ParlamentSrbija` and its channel ID | Empty = every YouTube video. |
| Caption position | left 0 %, top 88 %, width 70 %, height 12 % | Measured on the 17 Nov 2026 broadcast. The name line must sit in the upper part of the area. |
| White threshold | 225 | Lower it if names are missed, raise it if background leaks in. |
| Check every | 1500 ms | |
| Other-name readings to un-mute | 3 | |
| Min. confidence for other names | 35 % | Only for un-muting; a listed name is accepted at any confidence. |
| Un-mute after N s without the name | 0 (off) | |
| OCR language | Serbian Cyrillic | Add Latin only if captions use Latin script. |
| Debug view | off | Shows the processed crop and raw OCR lines under the pill, which helps with tuning the caption position. |

## Limitations

- **It mutes all audio, not just one voice.** If others speak while he holds the floor, they are muted too.
  Separating voices in real time would need a source-separation model, which is far more complex.
- **It depends on the caption.** If the broadcast changes its caption layout, adjust the caption position. If a speech
  starts without a caption, use the shortcut.
- **The first second or two may be heard.** The mute starts on the first frame where the caption is read.
- **Background tabs.** Chrome slows down timers and may stop drawing video in hidden tabs, so detection can lag
  there. For reliable results keep the video visible: its own window, or picture-in-picture.

## Privacy

Everything happens on your computer. Video frames never leave the browser, and the extension makes no network
requests. Permissions: `storage` (settings) and `offscreen` (runs the OCR worker). It only runs on `www.youtube.com`.

## Development

Written in **TypeScript**, bundled with **esbuild**, no UI framework.

- TypeScript fits because the extension is mostly messages passed between four contexts (YouTube page,
  service worker, offscreen document, popup/options). Typed message shapes and `@types/chrome` catch mistakes
  at build time that would otherwise show up only in the browser.
- esbuild compiles in milliseconds. The output is left unminified, so Chrome Web Store review stays easy.
- Plain DOM code in the content script avoids YouTube's Trusted Types restrictions and keeps the bundle small.

```sh
npm run typecheck   # tsc --noEmit
npm test            # node --test (runs the .ts tests directly)
npm run check       # all of the above + build
npm run zip         # build and pack dist/ into shut-down-577.zip for the Web Store
```

```
src/
  content/      YouTube page: frame capture, audio gate, channel check, status pill, main loop
  background/   service worker: offscreen document, OCR relay, badge, keyboard shortcut
  offscreen/    Tesseract.js worker host
  options/      settings page
  popup/        toolbar popup
  shared/       settings, message types, name matching, mute state machine (pure, unit-tested)
static/         manifest, HTML, CSS, icons
scripts/        build script, icon generator
test/           unit tests
```

## License

MIT. See [LICENSE](LICENSE).
