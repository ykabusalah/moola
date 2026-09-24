const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'store', 'screenshots', 'raw');
const OUT = path.join(ROOT, 'store', 'screenshots', 'final');

// App Store Connect iPhone display sizes. Layout below is designed at 1320 wide and scaled.
const SIZES = [
  { dir: '', label: '6.9"', w: 1320, h: 2868 },
  { dir: '6.5-inch', label: '6.5"', w: 1284, h: 2778 },
];
const BASE_W = 1320;

const BG = '#ece7de';
const INK = '#2a251c';
const SUB = '#8a8070';
const BORDER = '#d6cfc2';

const FONTS = 'C:/Windows/Fonts';
const HEAD = { name: 'Segoe UI Light', file: `${FONTS}/segoeuil.ttf`, size: 100 };
const SUBLINE = { name: 'Segoe UI Semilight Italic', file: `${FONTS}/seguisli.ttf`, size: 44 };

// Raw shots are iPhone 16 Pro (1206x2622); crop the status bar so every image matches.
const STATUS_BAR = 160;
const SHOT_W = 1000;
const SHOT_TOP = 660;
const RADIUS = 72;

const shots = [
  { file: '01-year.png',     head: 'Every coin,\nquietly counted',   sub: 'Your whole year at a glance' },
  { file: '02-add.png',      head: 'Log it in seconds',              sub: 'An amount, a note, done' },
  { file: '03-month.png',    head: 'Know where the\nmonth stands',   sub: 'Day, week, month, and year views' },
  { file: '04-lock.png',     head: 'Private by design',              sub: 'No accounts. No cloud. Optional PIN lock.' },
  { file: '05-export.png',   head: 'Your data,\nyour file',          sub: 'Export to CSV anytime' },
  { file: '06-accent.png',   head: 'Make it yours',                  sub: 'Five accent colors, light and dark mode' },
  { file: '07-reminder.png', head: 'Gentle nudges,\nif you want them', sub: 'Optional daily and backup reminders' },
];

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function renderText(text, font, color, letterSpacing, k, W) {
  const markup = `<span foreground="${color}" letter_spacing="${Math.round(letterSpacing * k)}">${escape(text)}</span>`;
  const { data, info } = await sharp({
    text: {
      text: markup,
      font: `${font.name} ${Math.round(font.size * k)}`,
      fontfile: font.file,
      width: W - Math.round(160 * k),
      align: 'centre',
      rgba: true,
      dpi: 72,
    },
  }).png().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function renderShot(file, k) {
  const shotW = Math.round(SHOT_W * k);
  const radius = Math.round(RADIUS * k);
  const src = path.join(RAW, file);
  const meta = await sharp(src).metadata();
  const { data, info } = await sharp(src)
    .extract({ left: 0, top: STATUS_BAR, width: meta.width, height: meta.height - STATUS_BAR })
    .resize(shotW)
    .png()
    .toBuffer({ resolveWithObject: true });
  const h = info.height;

  const mask = Buffer.from(
    `<svg width="${shotW}" height="${h}"><rect width="${shotW}" height="${h}" rx="${radius}" ry="${radius}"/></svg>`
  );
  const rounded = await sharp(data).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

  const bw = Math.max(2, Math.round(3 * k));
  const border = Buffer.from(
    `<svg width="${shotW}" height="${h}"><rect x="${bw / 2}" y="${bw / 2}" width="${shotW - bw}" height="${h - bw}" rx="${radius - bw / 2}" fill="none" stroke="${BORDER}" stroke-width="${bw}"/></svg>`
  );

  const pad = Math.round(120 * k);
  const shadow = await sharp(Buffer.from(
    `<svg width="${shotW + pad * 2}" height="${h + pad * 2}"><rect x="${pad}" y="${pad + Math.round(28 * k)}" width="${shotW}" height="${h}" rx="${radius}" fill="#000" fill-opacity="0.16"/></svg>`
  )).blur(Math.round(40 * k)).png().toBuffer();

  return { rounded, border, shadow, shotW, pad };
}

async function build(shot, size) {
  const { w: W, h: H } = size;
  const k = W / BASE_W;
  const shotTop = Math.round(SHOT_TOP * k);

  const head = await renderText(shot.head, HEAD, INK, -512, k, W);
  const sub = await renderText(shot.sub, SUBLINE, SUB, 512, k, W);
  const gap = Math.round(30 * k);
  const blockH = head.height + gap + sub.height;
  const blockTop = Math.round((shotTop - blockH) / 2 + 10 * k);

  const s = await renderShot(shot.file, k);
  const shotLeft = Math.round((W - s.shotW) / 2);

  const composed = await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
    .composite([
      { input: head.data, left: Math.round((W - head.width) / 2), top: blockTop },
      { input: sub.data, left: Math.round((W - sub.width) / 2), top: blockTop + head.height + gap },
      { input: s.shadow, left: shotLeft - s.pad, top: shotTop - s.pad },
      { input: s.rounded, left: shotLeft, top: shotTop },
      { input: s.border, left: shotLeft, top: shotTop },
    ])
    .png()
    .toBuffer();

  // Second pass: sharp applies flatten before composite, so strip alpha after compositing.
  const out = path.join(OUT, size.dir, shot.file);
  await sharp(composed).flatten({ background: BG }).removeAlpha().png().toFile(out);
  console.log(`\u2713 ${size.label} ${shot.file}`);
}

(async () => {
  for (const size of SIZES) {
    fs.mkdirSync(path.join(OUT, size.dir), { recursive: true });
    for (const shot of shots) await build(shot, size);
  }
})().catch((err) => { console.error(err); process.exit(1); });
