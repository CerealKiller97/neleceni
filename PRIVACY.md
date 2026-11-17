# Политика приватности · Privacy policy

**Neleceni** (Chrome проширење / Chrome extension) · важи од / effective from 17. 11. 2026.

**[Српски](#српски) · [English](#english)**

---

## Српски

**Укратко: проширење не прикупља, не чува и не шаље никакве личне податке. Све се обрађује на вашем рачунару.**

### Шта проширење обрађује

- **Слику видеа на YouTube-у.** Док гледате видео са канала који сте навели у подешавањима (подразумевано @ParlamentSrbija), проширење на сваких 1,5 секунде узима исечак доњег дела слике у коме стоји натпис са именом говорника. Тај исечак се обрађује **само у меморији прегледача**, на вашем рачунару, алатом за препознавање текста (Tesseract) који је уграђен у проширење. Исечак и препознати текст се не чувају и одмах се одбацују; користе се искључиво да би се одлучило да ли треба утишати звук.
- **Ваша подешавања** (имена која утишавате, канали, положај натписа, језик и сл.) чувају се помоћу `chrome.storage.sync`. Ако сте у Chrome-у укључили синхронизацију, Google их преноси између ваших уређаја као и подешавања других проширења. Проширење их не шаље никоме другом.

### Шта проширење не ради

- Не шаље податке ни на један сервер и не повезује се ни са каквим спољним сервисом. Сав код и подаци за препознавање текста налазе се у самом проширењу.
- Не прикупља историју прегледања, адресе, личне податке, податке за пријаву нити податке о понашању.
- Не продаје нити дели податке са трећим лицима, не користи их у сврхе које нису повезане са утишавањем и не користи их за процену кредитне способности.
- Не мења YouTube-ове податке нити подешавања вашег налога; утишавање важи само у вашој картици.

### Дозволе

- `storage`: чување подешавања.
- `offscreen`: покретање уграђеног алата за препознавање текста у позадинском документу.
- Приступ страницама `https://www.youtube.com/*`: читање натписа са видеа и утишавање звука видеа.

### Контакт

Питања и пријаве: <https://github.com/Tpojka/neleceni/issues>

Ако се ова политика промени, нова верзија ће бити објављена на овој адреси.

---

## English

**In short: the extension does not collect, store or send any personal data. Everything is processed on your computer.**

### What the extension processes

- **The YouTube video picture.** While you watch a video from a channel listed in the settings (by default @ParlamentSrbija), the extension takes a crop of the lower part of the picture, where the speaker's name caption sits, every 1.5 seconds. That crop is processed **only in the browser's memory**, on your computer, by the text-recognition engine (Tesseract) bundled with the extension. The crop and the recognised text are not stored and are discarded right away; they are used only to decide whether to mute the sound.
- **Your settings** (names to mute, channels, caption position, language and so on) are saved with `chrome.storage.sync`. If Chrome sync is turned on, Google carries them between your devices like any other extension settings. The extension sends them to no one else.

### What the extension does not do

- It sends no data to any server and connects to no outside service. All code and text-recognition data ship inside the extension.
- It collects no browsing history, addresses, personal details, login data or activity data.
- It does not sell or share data with third parties, does not use it for purposes unrelated to muting, and does not use it to determine creditworthiness.
- It does not change YouTube data or your account settings; muting applies only in your tab.

### Permissions

- `storage`: to save settings.
- `offscreen`: to run the bundled text-recognition engine in an offscreen document.
- Access to `https://www.youtube.com/*`: to read the caption from the video and mute the video's sound.

### Contact

Questions and reports: <https://github.com/Tpojka/neleceni/issues>

If this policy changes, the new version will be published at this address.
