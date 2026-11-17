# Chrome Web Store listing

Everything the Chrome Web Store developer dashboard asks for, ready to paste. Field names follow the dashboard.
The package to upload is `neleceni-<version>.zip` from `npm run zip` (also attached to each GitHub release).

Default language of the listing: **English** (the package's `default_locale` is `en`). The package also has a
Serbian (`sr`) locale, so the dashboard offers a second, Serbian listing: fill it with the Serbian texts below.

---

## Package

| Field | Value |
|---|---|
| Upload | `neleceni-0.1.1.zip` |
| Name (from manifest) | Neleceni |
| Summary, English (from `_locales/en`, 111/132 chars) | Mutes a YouTube stream while a chosen speaker holds the floor, by reading the speaker's name caption on screen. |
| Summary, Serbian (from `_locales/sr`, 93/132 chars) | Утишава YouTube пренос док говори изабрана особа, према натпису са именом говорника на слици. |

## Store listing tab

| Field | Value |
|---|---|
| Category | **Functionality & UI** (alternative: Well-being) |
| Language | English; add Serbian as a second listing language |
| Store icon | comes from the package (`icons/icon128.png`, 96×96 artwork with 16 px padding) |
| Screenshots, English (1280×800) | `images/en-1-action.png`, `images/en-2-name-line.png`, `images/en-3-settings.png`, `images/en-4-controls.png` |
| Screenshots, Serbian (1280×800) | `images/sr-1-action.png`, `images/sr-2-name-line.png`, `images/sr-3-settings.png`, `images/sr-4-controls.png` |
| Small promo tile (440×280) | `images/promo-small-440x280.png` |
| Marquee promo tile (1400×560, optional) | `images/promo-marquee-1400x560.png` |
| Official URL / Homepage | https://github.com/Tpojka/neleceni |
| Support URL | https://github.com/Tpojka/neleceni/issues |
| Mature content | No |

### Detailed description: English

```
Neleceni mutes a YouTube video while a speaker you choose has the floor.

It was made for the official YouTube channel of the National Assembly of Serbia (@ParlamentSrbija). The broadcast shows each speaker's name in a caption on the picture. Neleceni reads that caption and silences the video while a name from your list is shown. When another speaker's caption appears, the sound comes back.

HOW TO USE
• Open a live stream or a replay on @ParlamentSrbija. It works right away.
• A small label on the video shows "Listening" or "Muted · name". Click it, or press Alt+Shift+M, to mute or un-mute by hand.
• Open Settings to choose who to mute: one name per line, as written in the caption. Example: "Александар Вучић" (Aleksandar Vučić), which is the default. Cyrillic and Latin spellings both match.
• Only the speaker's name line is read. The parliamentary group line below it is ignored, so members of a group named after someone on your list are not muted.

SETTINGS
• Speakers to mute
• Channels to work on (leave empty for every YouTube video)
• Where the caption sits on the picture, plus recognition fine-tuning and a debug view
• Interface language: Serbian Cyrillic or English

WHERE IT WORKS
• Chrome 116 or newer on a computer, on www.youtube.com
• Live streams and replays; tested at 720p and 1080p
• Only while the speaker's name caption is on screen. Videos without a name caption, such as most press conferences, are not muted automatically; use the shortcut there.
• It mutes all sound while that person has the floor, not one voice.

PRIVACY
Everything runs on your computer. The extension reads only the caption area of the video to recognise the name, keeps nothing and sends nothing anywhere. No account, no tracking, no ads.

Free and open source (MIT licence): https://github.com/Tpojka/neleceni
```

### Detailed description: Serbian

```
Neleceni утишава YouTube видео док говори особа коју изаберете.

Направљено је за званични YouTube канал Народне скупштине Републике Србије (@ParlamentSrbija). Пренос приказује име сваког говорника у натпису на слици. Neleceni чита тај натпис и утишава видео док је на екрану име са вашег списка. Кад се појави натпис другог говорника, звук се враћа.

КАКО СЕ КОРИСТИ
• Отворите пренос уживо или снимак са канала @ParlamentSrbija. Проширење одмах ради.
• Мала ознака на видеу показује „Чује се“ или „Утишано · име“. Клик на њу или пречица Alt+Shift+M ручно утишава или враћа звук.
• У подешавањима бирате кога утишати: једно име у сваком реду, онако како пише у натпису. Пример: „Александар Вучић“, што је и подразумевано. Ћирилица и латиница се рачунају као исто.
• Чита се само ред са именом говорника. Ред са посланичком групом испод њега се занемарује, па чланови групе која носи име неког са вашег списка не бивају утишани.

ПОДЕШАВАЊА
• Кога утишати
• Канали на којима ради (празно значи сви YouTube видеи)
• Где се натпис налази на слици, фино подешавање препознавања и приказ за отклањање грешака
• Језик: српски (ћирилица) или енглески

ГДЕ РАДИ
• Chrome 116 или новији на рачунару, на www.youtube.com
• Преноси уживо и снимци; тестирано на 720p и 1080p
• Само док је натпис са именом говорника на екрану. Видеи без натписа, као што је већина конференција за новинаре, не утишавају се сами; ту користите пречицу.
• Утишава сав звук док та особа говори, не само један глас.

ПРИВАТНОСТ
Све се дешава на вашем рачунару. Проширење чита само део слике са натписом да би препознало име, ништа не чува и ништа не шаље. Без налога, без праћења, без реклама.

Слободан софтвер отвореног кода (MIT лиценца): https://github.com/Tpojka/neleceni
```

## Privacy practices tab

**Single purpose**

```
Mutes a YouTube video while a speaker chosen by the user is speaking, detected from the speaker's name caption shown on the video.
```

**Permission justifications**

| Permission | Justification |
|---|---|
| `storage` | Saves the user's settings (names to mute, channels, caption position, language) with chrome.storage.sync. |
| `offscreen` | Runs the bundled Tesseract OCR web worker in an offscreen document. Content scripts cannot start extension workers inside youtube.com and the service worker cannot start workers, so OCR of the name caption runs there. |
| Host permission `https://www.youtube.com/*` (content script) | Reads the speaker's name caption from the playing YouTube video and mutes that video's audio. It acts only on videos from the channels the user lists (by default @ParlamentSrbija) and does nothing on other sites. |

**Are you using remote code?** No, I am not using remote code. (All JavaScript and WebAssembly, including the
Tesseract OCR engine and its Serbian language data, are inside the package; the extension makes no network requests.)

**Data usage: what user data do you collect?** Tick **Website content** only.
The extension handles the pixels of the caption area of the YouTube video (website content) to recognise the
speaker's name. It is processed only in memory on the user's device, never stored and never transmitted. Google's
User Data FAQ counts local processing as handling user data that must be disclosed. Nothing else is handled:
no personal or identifying information, health, financial, authentication or communication data, location,
web history or user activity.

**Certifications:** tick all three:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

**Privacy policy URL**

```
https://github.com/Tpojka/neleceni/blob/main/PRIVACY.md
```

## Distribution tab

| Field | Value |
|---|---|
| Visibility | Public |
| Regions | All regions |
| Pricing | Free, no in-app purchases |

## Test instructions (for the reviewer)

```
The extension mutes a YouTube video while a listed speaker's name caption is on screen. The default list contains "Александар Вучић", who does not speak in the test video below, so add a name that does:

1. Click the extension icon > Settings. In "Speakers to mute" add a new line: Вјерица Радета  > Save.
2. Open https://www.youtube.com/watch?v=6amV0DvQ0t8 (National Assembly of Serbia, session of 17 Nov 2026, part I).
3. Jump to 12:45 and play. At about 12:55 the caption "Вјерица Радета" appears; within a second the label in the top-right corner of the player changes from "Listening" to "Muted · Вјерица Радета" and the video's sound is silenced.
4. Optional: tick "Debug view" in Settings to see the caption crop and the recognised text under the label. Alt+Shift+M mutes or un-mutes by hand.

No account or login is needed. All processing is local; the extension makes no network requests.
```

## Images

All images are generated from `src/scenes.html` by `render.mjs` (see the comments in both files). The video in
the "action", "name line" and promo images is an illustration in the broadcast's caption style, not real footage;
"Јована Петровић" is a made-up name. The settings screenshots are the real settings page.
