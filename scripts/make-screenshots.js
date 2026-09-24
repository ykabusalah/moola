const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const RAW = path.join(ROOT, 'store', 'screenshots', 'raw');
const OUT = path.join(ROOT, 'store', 'screenshots', 'final');

// App Store Connect iPhone 6.9" size
const W = 1320;
const H = 2868;

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

async function renderText(text, font, color, letterSpacing = 0) {
  const markup = `<span foreground="${color}" letter_spacing="${letterSpacing}">${escape(text)}</span>`;
  const { data, info } = await sharp({
    text: {
      text: markup,
      font: `${font.name} ${font.size}`,
      fontfile: font.file,
      width: W - 160,
      align: 'centre',
      rgba: true,
      dpi: 72,
    },
  }).png().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function renderShot(file) {
  const src = path.join(RAW, file);
  const meta = await sharp(src).metadata();
  const { data, info } = await sharp(src)
    .extract({ left: 0, top: STATUS_BAR, width: meta.width, height: meta.height - STATUS_BAR })
    .resize(SHOT_W)
    .png()
    .toBuffer({ resolveWithObject: true });
  const h = info.height;

  const mask = Buffer.from(
    `<svg width="${SHOT_W}" height="${h}"><rect width="${SHOT_W}" height="${h}" rx="${RADIUS}" ry="${RADIUS}"/></svg>`
  );
  const rounded = await sharp(data).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();

  const border = Buffer.from(
    `<svg width="${SHOT_W}" height="${h}"><rect x="1.5" y="1.5" width="${SHOT_W - 3}" height="${h - 3}" rx="${RADIUS - 1.5}" fill="none" stroke="${BORDER}" stroke-width="3"/></svg>`
  );

  const pad = 120;
  const shadow = await sharp(Buffer.from(
    `<svg width="${SHOT_W + pad * 2}" height="${h + pad * 2}"><rect x="${pad}" y="${pad + 28}" width="${SHOT_W}" height="${h}" rx="${RADIUS}" fill="#000" fill-opacity="0.16"/></svg>`
  )).blur(40).png().toBuffer();

  return { rounded, border, shadow, height: h, pad };
}

async function build(shot) {
  const head = await renderText(shot.head, HEAD, INK, -512);
  const sub = await renderText(shot.sub, SUBLINE, SUB, 512);
  const gap = 30;
  const blockH = head.height + gap + sub.height;
  const blockTop = Math.round((SHOT_TOP - blockH) / 2) + 10;

  const s = await renderShot(shot.file);
  const shotLeft = Math.round((W - SHOT_W) / 2);

  const composed = await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
    .composite([
      { input: head.data, left: Math.round((W - head.width) / 2), top: blockTop },
      { input: sub.data, left: Math.round((W - sub.width) / 2), top: blockTop + head.height + gap },
      { input: s.shadow, left: shotLeft - s.pad, top: SHOT_TOP - s.pad },
      { input: s.rounded, left: shotLeft, top: SHOT_TOP },
      { input: s.border, left: shotLeft, top: SHOT_TOP },
    ])
    .png()
    .toBuffer();

  // Second pass: sharp applies flatten before composite, so strip alpha after compositing.
  const out = path.join(OUT, shot.file);
  await sharp(composed).flatten({ background: BG }).removeAlpha().png().toFile(out);
  console.log(`\u2713 ${shot.file}`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const shot of shots) await build(shot);
})().catch((err) => { console.error(err); process.exit(1); });
