// Builds the unpacked extension into dist/: bundles the TypeScript entry points with esbuild,
// copies static files, and copies Tesseract's worker, WASM core and Serbian language data
// so nothing is loaded from a CDN at runtime (Manifest V3 forbids remote code).
import * as esbuild from 'esbuild';
import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const nm = join(root, 'node_modules');
const watch = process.argv.includes('--watch');

async function copyStatic() {
  await cp(join(root, 'static'), dist, { recursive: true });
}

// Licence texts travel with the built extension (MIT for Neleceni, Apache-2.0 for Tesseract).
async function copyLicenses() {
  const dir = join(dist, 'licenses');
  await mkdir(dir, { recursive: true });
  await Promise.all([
    cp(join(root, 'LICENSE'), join(dist, 'LICENSE')),
    cp(join(root, 'THIRD_PARTY_NOTICES.md'), join(dist, 'THIRD_PARTY_NOTICES.md')),
    cp(join(nm, 'tesseract.js', 'LICENSE.md'), join(dir, 'tesseract.js-Apache-2.0.md')),
    cp(join(nm, 'tesseract.js-core', 'LICENSE'), join(dir, 'tesseract.js-core-Apache-2.0.txt')),
  ]);
}

async function copyVendor() {
  const tess = join(dist, 'vendor', 'tesseract');
  const core = join(dist, 'vendor', 'tesseract-core');
  const data = join(dist, 'tessdata');
  await Promise.all([mkdir(tess, { recursive: true }), mkdir(core, { recursive: true }), mkdir(data, { recursive: true })]);

  await cp(join(nm, 'tesseract.js', 'dist', 'worker.min.js'), join(tess, 'worker.min.js'));
  await cp(join(nm, 'tesseract.js', 'dist', 'worker.min.js.LICENSE.txt'), join(tess, 'worker.min.js.LICENSE.txt'));

  // Only the LSTM builds are needed (we always use OEM.LSTM_ONLY); Tesseract picks the
  // plain, SIMD or relaxed-SIMD one at runtime depending on the CPU.
  const coreDir = join(nm, 'tesseract.js-core');
  for (const f of await readdir(coreDir)) {
    if (/^tesseract-core(-simd|-relaxedsimd)?-lstm\.wasm\.js$/.test(f)) await cp(join(coreDir, f), join(core, f));
  }

  for (const lang of ['srp', 'srp_latn']) {
    const file = `${lang}.traineddata.gz`;
    await cp(join(nm, '@tesseract.js-data', lang, '4.0.0_best_int', file), join(data, file));
  }
}

const options = {
  absWorkingDir: root,
  entryPoints: {
    content: 'src/content/index.ts',
    background: 'src/background/index.ts',
    offscreen: 'src/offscreen/index.ts',
    options: 'src/options/index.ts',
    popup: 'src/popup/index.ts',
  },
  outdir: dist,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'chrome116',
  // Readable output makes Chrome Web Store review easier.
  minify: false,
  sourcemap: watch ? 'inline' : false,
  legalComments: 'none',
  logLevel: 'info',
};

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await Promise.all([copyStatic(), copyVendor(), copyLicenses()]);

if (watch) {
  const ctx = await esbuild.context({
    ...options,
    plugins: [{ name: 'static', setup: (b) => b.onEnd(() => copyStatic()) }],
  });
  await ctx.watch();
  console.log('Watching… reload the extension in chrome://extensions after changes.');
} else {
  await esbuild.build(options);
}
