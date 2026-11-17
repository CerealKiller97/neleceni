# Third-party notices

Neleceni itself is licensed under the MIT License (see `LICENSE`). The built extension (`dist/`, or a zip made from
it) also contains the following third-party software and data, each under its own free licence. Their licence
texts are copied into `dist/licenses/` by the build.

| Component | Used for | Licence |
|---|---|---|
| [Tesseract.js](https://github.com/naptha/tesseract.js) | OCR API and worker (`offscreen.js`, `vendor/tesseract/worker.min.js`) | Apache-2.0 |
| [tesseract.js-core](https://github.com/naptha/tesseract.js-core) | Tesseract OCR engine compiled to WebAssembly (`vendor/tesseract-core/`) | Apache-2.0 |
| [Tesseract trained data](https://github.com/tesseract-ocr/tessdata_best), via [@tesseract.js-data](https://www.npmjs.com/package/@tesseract.js-data/srp) | Serbian Cyrillic and Latin models (`tessdata/`) | Apache-2.0 (data), MIT (npm package) |
| [wasm-feature-detect](https://github.com/GoogleChromeLabs/wasm-feature-detect) | Inside the Tesseract.js worker | Apache-2.0 |
| [idb-keyval](https://github.com/jakearchibald/idb-keyval) | Inside the Tesseract.js worker | Apache-2.0 |
| [is-url](https://github.com/segmentio/is-url), [regenerator-runtime](https://github.com/facebook/regenerator), [zlib.js](https://github.com/imaya/zlib.js), [bmp-js](https://github.com/shaozilee/bmp-js), [buffer](https://github.com/feross/buffer) | Inside the Tesseract.js worker | MIT |
| [ieee754](https://github.com/feross/ieee754) | Inside the Tesseract.js worker | BSD-3-Clause |

The worker's own list of bundled licences is in `dist/vendor/tesseract/worker.min.js.LICENSE.txt`.
