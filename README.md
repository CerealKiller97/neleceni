<img src="static/icons/icon128.png" width="64" height="64" alt="">

# Neleceni

**[Српски](#српски) · [English](#english)**

---

## Српски

### Шта је Neleceni

Neleceni је проширење за Google Chrome које само утишава звук YouTube видеа док говори особа коју сте изабрали.

Проширење прати натпис са именом говорника који телевизијски пренос приказује на слици. Кад препозна име са вашег списка, утиша звук. Кад се појави натпис са именом неког другог говорника, звук се враћа.

Направљено је за званични YouTube канал Народне скупштине Републике Србије, [@ParlamentSrbija](https://www.youtube.com/@ParlamentSrbija). Као пример, подразумевано утишава **Александра Вучића**, а списак особа мењате сами у подешавањима.

### Где и када ради

- **Прегледач:** Google Chrome на рачунару (Windows, macOS, Linux), верзија 116 или новија. Тестирано и у Brave-у; требало би да ради и у осталим прегледачима заснованим на Chromium-у (нпр. Edge).
- **Сајт:** само `www.youtube.com`. Не ради у YouTube апликацији за телефон, на `m.youtube.com`, нити у YouTube плејеру уграђеном у друге сајтове.
- **Канал:** подразумевано само @ParlamentSrbija. Друге канале додајете у подешавањима, али проширење ради само ако канал приказује име говорника белим словима на слици, као што то ради Скупштина.
- **Пренос уживо и снимци:** ради на оба. На снимку можете слободно да премотавате; проширење одмах поново прочита натпис.
- **Квалитет слике:** тестирано на 720p и 1080p. На нижем квалитету (480p и мање) слова су ситна и препознавање је мање поуздано.
- **Натпис мора да буде на екрану.** Проширење „види" само оно што пише на слици. Ако говорник почне да говори пре него што се појави његов натпис (нпр. док се приказују општи кадрови сале), звук се утишава тек кад се натпис појави. За тај део користите пречицу **Alt+Shift+M**.
- **Видео треба да буде видљив.** У картици која је у позадини Chrome успорава проширење, па утишавање може да касни. Најбоље је да видео буде у свом прозору или у режиму „слика у слици" (picture-in-picture).

### Инсталација

Проширење још није у продавници Chrome Web Store, па се инсталира ручно, у режиму за програмере. Потребни су [Node.js](https://nodejs.org/) 23.6 или новији и, по жељи, [Git](https://git-scm.com/).

1. Преузмите изворни код (`git clone https://github.com/Tpojka/neleceni.git`, или на GitHub-у **Code → Download ZIP** па распакујте) и изградите проширење:
   ```sh
   cd neleceni
   npm install
   npm run build
   ```
   Готово проширење се налази у фасцикли `dist/`.
2. У Chrome-у отворите `chrome://extensions`.
3. Горе десно укључите **Developer mode** (режим за програмере).
4. Кликните **Load unpacked** и изаберите фасциклу `dist/`. Отвориће се страница са подешавањима; ако вам одговарају подразумевана, само је затворите.
5. Закачите иконицу проширења на траку са алаткама: кликните иконицу слагалице 🧩 десно од адресе, па чиоду поред **Neleceni**.
6. Отворите пренос или снимак са канала @ParlamentSrbija.

**Ажурирање:** у фасцикли пројекта покрените `git pull`, `npm install` и `npm run build`. Затим у `chrome://extensions` кликните стрелицу за поновно учитавање (↻) на картици **Neleceni** и поново учитајте отворене YouTube картице.

> Chrome памти проширење по путањи до фасцикле. Ако фасциклу преместите или преименујете, уклоните проширење и поново га учитајте преко **Load unpacked**. Подешавања се тада враћају на подразумевана.

### Коришћење

Кад је проширење инсталирано, не морате ништа да подешавате: отворите пренос са канала @ParlamentSrbija и оно ради само.

- **Ознака на видеу.** У горњем десном углу плејера стоји мала ознака:
  - зелена тачка и **Listening**: звук се чује;
  - црвено **Muted · Александар Вучић**: звук је утишан, уз име које је препознато.

  Клик на ознаку ручно утишава или враћа звук.
- **Пречица Alt+Shift+M** ради исто што и клик на ознаку. Ручни избор важи док се на екрану не појави натпис са другим именом; после тога проширење опет ради само. Пречицу мењате на `chrome://extensions/shortcuts`.
- **Иконица на траци са алаткама** показује стање картице: **ON** значи да проширење прати овај видео, **MUTE** да је звук утишан.
- **Прозорчић проширења** (клик на иконицу) има прекидач **Enabled** (укључено/искључено), тренутно стање, дугме **Mute / un-mute** и дугме **Settings** (подешавања).

YouTube-ово дугме за звук и јачину звука проширење не дира. Ако сте сами утишали YouTube, проширење то неће поништити.

### Подешавања

Отварају се кликом на иконицу проширења → **Settings**, или у `chrome://extensions` → **Neleceni** → **Details** → **Extension options**. Измене важе кад кликнете **Save**; **Reset to defaults** враћа подразумевана подешавања. Натписи на страници подешавања су за сада на енглеском, па их овде наводимо онако како стоје на екрану.

#### Кога утишати: „Speakers to mute"

Ово је главно подешавање. Упишите једно име у сваки ред, онако како пише у натпису на екрану.

**Пример: утишавање Александра Вучића** (ово је подразумевано подешавање):

```
Александар Вучић
```

- Упишите и име и презиме. Свака реч мора да се поклопи, па „Александар Вучић" не утишава, рецимо, „Александар Вулин" нити „Милош Вучевић".
- Ћирилица и латиница се рачунају као исто: „Александар Вучић" препознаје и „Aleksandar Vučić". Велика и мала слова и квачице нису битни.
- Ако упишете само презиме („Вучић"), утишава се свако са тим презименом.
- Још једну особу додајете у нови ред:
  ```
  Александар Вучић
  Име Презиме
  ```
- Ако привремено не желите утишавање, искључите прекидач **Enabled** у прозорчићу проширења или у подешавањима.

> Натпис у Скупштини има два реда: име говорника и, испод њега, посланичку групу (нпр. „Александар Вучић - Србија побеђује"). Проширење чита **само ред са именом говорника**. Зато посланици из групе која носи Вучићево име **не бивају** утишани.

#### На ком каналу: „Channels"

Канали на којима проширење ради, по један у реду: ознака канала (`@ParlamentSrbija`), ID канала (`UC…`) или цела адреса канала. Подразумевано: `@ParlamentSrbija` и његов ID. Ако оставите празно, проширење ради на свим YouTube видеима.

#### Где је натпис: „Caption position"

Део слике у коме проширење тражи натпис, у процентима ширине и висине слике: **Left %**, **Top %**, **Width %**, **Height %**. Подразумевано је 0 / 80 / 90 / 20, односно доњих 20 % слике, што покрива обе величине натписа које Скупштина користи. Мењајте ово само ако канал промени изглед натписа или ако додате други канал. Укључите **Debug view** (испод) да видите шта проширење чита.

#### Детаљи препознавања: „Detection"

| Подешавање | Подразумевано | Чему служи |
|---|---|---|
| **Check every (ms)** | 1500 | Колико често се проверава натпис, у милисекундама. Мање значи брже утишавање, али више посла за рачунар. |
| **White threshold (100–255)** | 225 | Колико бела морају да буду слова. Смањите ако имена не бивају препозната; повећајте ако се у текст меша позадина. |
| **OCR language** | Serbian Cyrillic | Писмо натписа. Латиницу укључите само ако канал пише латиницом. |
| **Other-name readings to un-mute** | 3 | Колико пута мора да се прочита друго име пре него што се звук врати. Мање значи да се звук враћа брже, али и да је грешка вероватнија. |
| **Min. confidence for other names (%)** | 35 | Колико поуздано мора да буде прочитано друго име да би се рачунало. Утиче само на враћање звука. |
| **Un-mute after N s without the name (0 = off)** | 0 | Враћа звук ако се име не види N секунди. Подразумевано је искључено, јер говор обично траје и кад натпис нестане са екрана. |

#### Приказ и пречица: „Display and shortcut"

- **Show the status pill on the video**: приказује ознаку Listening/Muted на видеу.
- **Debug view**: испод ознаке приказује исечак слике који проширење чита и текст који је препознало. Корисно кад подешавате „Caption position" или „White threshold".

### Шта проширење не може

- **Утишава сав звук, не само један глас.** Ако неко добаци док утишана особа говори, ни то се не чује.
- **Ради само кад је натпис на екрану.** Видети „Где и када ради".
- **Почетак може да се чује.** Утишавање креће кад се натпис прочита, обично у року од секунде или две.
- **Не препознаје глас**, само натпис.

### Приватност

Све се дешава на вашем рачунару. Слике из видеа не напуштају прегледач, проширење не шаље никакве податке и не повезује се ни са каквим сервером. Тражи само две дозволе: `storage` (чување подешавања) и `offscreen` (покретање препознавања текста), и ради само на `www.youtube.com`.

### Лиценца

Neleceni је слободан софтвер под [MIT лиценцом](LICENSE): слободно га користите, мењате и делите, уз задржавање напомене о ауторским правима и текста лиценце. Уграђени алат за препознавање текста [Tesseract](https://github.com/naptha/tesseract.js) је под лиценцом Apache-2.0; видети [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

## English

### What Neleceni is

Neleceni is a Google Chrome extension that automatically mutes a YouTube video while a speaker you choose has the floor.

It watches the name caption that the broadcast shows on the picture. When it recognises a name from your list, it mutes the sound. When a caption with another speaker's name appears, the sound comes back.

It was built for the official YouTube channel of the National Assembly of Serbia, [@ParlamentSrbija](https://www.youtube.com/@ParlamentSrbija). As an example, it mutes **Aleksandar Vučić** (Александар Вучић) by default; you choose who to mute in the settings.

### Where and when it works

- **Browser:** Google Chrome on a computer (Windows, macOS, Linux), version 116 or newer. Also tested in Brave; other Chromium-based browsers (such as Edge) should work too.
- **Site:** `www.youtube.com` only. Not the YouTube phone app, not `m.youtube.com`, and not YouTube players embedded in other sites.
- **Channel:** @ParlamentSrbija only, by default. You can add other channels in the settings, but the extension only works where the channel shows the speaker's name in white letters on the picture, as the Assembly does.
- **Live streams and replays:** both. You can skip around in a replay; the extension reads the caption again right away.
- **Video quality:** tested at 720p and 1080p. At lower quality (480p and below) the letters are small and recognition is less reliable.
- **The caption must be on screen.** The extension only "sees" what is written on the picture. If someone starts speaking before their caption appears (for example over wide shots of the chamber), the sound is muted only once the caption appears. Use **Alt+Shift+M** for that part.
- **Keep the video visible.** In a background tab Chrome slows the extension down, so muting can lag. Best results: the video in its own window, or in picture-in-picture.

### Installation

The extension is not in the Chrome Web Store yet, so you install it by hand, in developer mode. You need [Node.js](https://nodejs.org/) 23.6 or newer and, optionally, [Git](https://git-scm.com/).

1. Get the source (`git clone https://github.com/Tpojka/neleceni.git`, or on GitHub **Code → Download ZIP** and unzip it) and build the extension:
   ```sh
   cd neleceni
   npm install
   npm run build
   ```
   The finished extension is in the `dist/` folder.
2. In Chrome, open `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and choose the `dist/` folder. The settings page opens; if the defaults suit you, just close it.
5. Pin the extension to the toolbar: click the puzzle icon 🧩 to the right of the address bar, then the pin next to **Neleceni**.
6. Open a live stream or a replay on @ParlamentSrbija.

**Updating:** in the project folder run `git pull`, `npm install` and `npm run build`. Then click the reload arrow (↻) on the **Neleceni** card in `chrome://extensions` and reload any open YouTube tabs.

> Chrome identifies the extension by its folder path. If you move or rename the folder, remove the extension and load it again with **Load unpacked**. Its settings then go back to the defaults.

### Using it

Once installed, nothing needs setting up: open a stream on @ParlamentSrbija and it works on its own.

- **Status pill on the video.** A small label sits in the top-right corner of the player:
  - green dot and **Listening**: sound is on;
  - red **Muted · Александар Вучић**: sound is muted, with the name that was recognised.

  Click the pill to mute or un-mute by hand.
- **Alt+Shift+M** does the same as clicking the pill. A manual choice holds until a caption with a different name appears; then the extension takes over again. Change the shortcut at `chrome://extensions/shortcuts`.
- **Toolbar icon** shows the tab's state: **ON** means the extension is watching this video, **MUTE** means the sound is muted.
- **Popup** (click the toolbar icon): an **Enabled** switch, the current state, a **Mute / un-mute** button and a **Settings** button.

The extension does not touch YouTube's own mute button or volume. If you muted YouTube yourself, the extension won't undo it.

### Settings

Open them from the toolbar icon → **Settings**, or in `chrome://extensions` → **Neleceni** → **Details** → **Extension options**. Changes apply when you click **Save**; **Reset to defaults** restores the defaults.

#### Who to mute: "Speakers to mute"

This is the main setting. Enter one name per line, as it appears in the on-screen caption.

**Example: muting Aleksandar Vučić** (this is the default):

```
Александар Вучић
```

- Enter both first name and surname. Every word must match, so "Александар Вучић" does not mute, for instance, "Александар Вулин" or "Милош Вучевић".
- Cyrillic and Latin count as the same: "Александар Вучић" also matches "Aleksandar Vučić". Upper/lower case and diacritics don't matter.
- A surname alone ("Вучић") mutes everyone with that surname.
- Add another person on a new line:
  ```
  Александар Вучић
  First Last
  ```
- To pause muting, turn off **Enabled** in the popup or in the settings.

> The Assembly's caption has two lines: the speaker's name and, below it, the parliamentary group (e.g. "Александар Вучић - Србија побеђује"). The extension reads **only the speaker's name line**. So members of the group named after Vučić are **not** muted.

#### Which channels: "Channels"

Channels the extension works on, one per line: a channel handle (`@ParlamentSrbija`), a channel ID (`UC…`) or the full channel URL. Default: `@ParlamentSrbija` and its ID. Leave it empty to work on every YouTube video.

#### Where the caption is: "Caption position"

The part of the picture searched for the caption, in percent of the picture's width and height: **Left %**, **Top %**, **Width %**, **Height %**. The default is 0 / 80 / 90 / 20, the bottom 20 % of the picture, which covers both caption sizes the Assembly uses. Only change it if the channel changes its caption layout or you add another channel. Turn on **Debug view** (below) to see what the extension reads.

#### Recognition details: "Detection"

| Setting | Default | What it does |
|---|---|---|
| **Check every (ms)** | 1500 | How often the caption is checked, in milliseconds. Lower mutes sooner but costs more CPU. |
| **White threshold (100–255)** | 225 | How white the letters must be. Lower it if names are missed; raise it if the background gets mixed into the text. |
| **OCR language** | Serbian Cyrillic | Script of the captions. Add Latin only if the channel writes in Latin script. |
| **Other-name readings to un-mute** | 3 | How many times another name must be read before the sound comes back. Lower brings the sound back sooner but makes mistakes more likely. |
| **Min. confidence for other names (%)** | 35 | How confidently another name must be read to count. Only affects un-muting. |
| **Un-mute after N s without the name (0 = off)** | 0 | Brings the sound back when the name has not been seen for N seconds. Off by default, because a speech usually goes on after the caption disappears. |

#### Display and shortcut

- **Show the status pill on the video**: shows the Listening/Muted pill.
- **Debug view**: shows, under the pill, the image strip the extension reads and the text it recognised. Useful when adjusting "Caption position" or "White threshold".

### What it cannot do

- **It mutes all sound, not one voice.** If someone interrupts while the muted person is speaking, you won't hear that either.
- **It only works while the caption is on screen.** See "Where and when it works".
- **The start may be heard.** Muting starts when the caption is read, usually within a second or two.
- **It does not recognise voices**, only the caption.

### Privacy

Everything happens on your computer. Video frames never leave the browser; the extension sends no data and connects to no server. It asks for two permissions only: `storage` (to keep your settings) and `offscreen` (to run text recognition), and it runs only on `www.youtube.com`.

### Licence

Neleceni is free software under the [MIT License](LICENSE): you may use, change and share it, keeping the copyright notice and licence text. The bundled text-recognition engine [Tesseract](https://github.com/naptha/tesseract.js) is under the Apache-2.0 licence; see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

---

## За програмере · For developers

How it works inside, the caption layouts it was tuned on, test results and build commands: [docs/how-it-works.md](docs/how-it-works.md).
