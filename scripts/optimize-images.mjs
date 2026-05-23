// One-off asset optimization pass. Run: `node scripts/optimize-images.mjs`
//
// 1. Sequence frames  /frames-src/frames-png/*.png  ->  /public/frames-webp/*.webp
//    WebP, quality 80, native 1280x720 kept. WebP only (not AVIF): the frames
//    are decoded sequentially during scroll, and WebP decodes far faster than
//    AVIF, which matters more here than the last few KB of size.
//
// 2. Content images  /public/{products,sections}/*.png + /public/bg.png
//    ->  .webp AND .avif siblings, so next/image can negotiate the best format.
//    Also emits a tiny base64 blur placeholder map (src/data/blur.json) for LQIP.
//
// Originals are left untouched as a backup.

import sharp from 'sharp';
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const PUBLIC = path.join(ROOT, 'public');

const fmtKB = (n) => `${(n / 1024).toFixed(0)} KB`;

async function dirSize(dir) {
  if (!existsSync(dir)) return 0;
  const files = await readdir(dir);
  let total = 0;
  for (const f of files) total += (await stat(path.join(dir, f))).size;
  return total;
}

// ---- 1. Frame sequence -> WebP ------------------------------------------
async function convertFrames() {
  // Source PNGs live outside /public so the 131 MB of originals never ship.
  const srcDir = path.join(ROOT, 'frames-src', 'frames-png');
  const outDir = path.join(PUBLIC, 'frames-webp');
  if (!existsSync(srcDir)) {
    console.log(`No ${srcDir} — skipping sequence.`);
    return;
  }
  await mkdir(outDir, { recursive: true });

  const files = (await readdir(srcDir)).filter((f) => f.endsWith('.png')).sort();
  const beforeBytes = await dirSize(srcDir);
  console.log(`Frames: converting ${files.length} PNG -> WebP ...`);

  let done = 0;
  // Bounded concurrency so we don't spawn 208 sharp pipelines at once.
  const CONCURRENCY = 8;
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    const batch = files.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (file) => {
        const out = file.replace(/\.png$/, '.webp');
        await sharp(path.join(srcDir, file))
          .webp({ quality: 80, effort: 5 })
          .toFile(path.join(outDir, out));
        done++;
      })
    );
    process.stdout.write(`\r  ${done}/${files.length}`);
  }
  const afterBytes = await dirSize(outDir);
  console.log(
    `\n  frames: ${fmtKB(beforeBytes)} -> ${fmtKB(afterBytes)} ` +
      `(-${(100 - (afterBytes / beforeBytes) * 100).toFixed(0)}%)`
  );
}

// ---- 2. Content images -> WebP + AVIF + blur placeholders ----------------
async function convertContentImages() {
  const targets = [];
  for (const sub of ['products', 'sections']) {
    const dir = path.join(PUBLIC, sub);
    if (!existsSync(dir)) continue;
    for (const f of await readdir(dir)) {
      if (f.endsWith('.png')) targets.push(path.join(sub, f));
    }
  }
  if (existsSync(path.join(PUBLIC, 'bg.png'))) targets.push('bg.png');

  const blur = {};
  let before = 0;
  let after = 0;

  for (const rel of targets) {
    const abs = path.join(PUBLIC, rel);
    before += (await stat(abs)).size;
    const base = abs.replace(/\.png$/, '');

    await sharp(abs).webp({ quality: 78, effort: 5 }).toFile(`${base}.webp`);
    await sharp(abs).avif({ quality: 55, effort: 4 }).toFile(`${base}.avif`);

    after += (await stat(`${base}.webp`)).size;

    // Tiny LQIP: 16px-wide WebP as a base64 data URI, keyed by public path.
    const lqip = await sharp(abs)
      .resize(16, null, { fit: 'inside' })
      .webp({ quality: 30 })
      .toBuffer();
    const key = '/' + rel.replace(/\\/g, '/').replace(/\.png$/, '.webp');
    blur[key] = `data:image/webp;base64,${lqip.toString('base64')}`;
  }

  const dataDir = path.join(ROOT, 'src', 'data');
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    path.join(dataDir, 'blur.json'),
    JSON.stringify(blur, null, 2) + '\n'
  );

  console.log(
    `Content images: ${targets.length} files, ${fmtKB(before)} PNG -> ` +
      `${fmtKB(after)} WebP (+ AVIF siblings). Blur map: src/data/blur.json`
  );
}

await convertFrames();
await convertContentImages();
console.log('Done.');
