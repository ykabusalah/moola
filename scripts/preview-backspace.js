const path = require('path');
const sharp = require('sharp');

const BG = '#faf9f6';
const CARD = '#ffffff';
const BORDER = '#d4cfc4';
const TEXT = '#2a251c';
const GUIDE = '#c8b8b8';
const HALO = '#ffe0e0';

// Zoom hard on the arrow tip so any stroke clipping is obvious.
// The real-app circle is 72 px. Render at 8x = 576 px.
const SCALE = 8;
const CIRCLE_D = 72 * SCALE;

function iconAt(nativeW, nativeH, viewBox, transform) {
  const pxW = nativeW * SCALE;
  const pxH = nativeH * SCALE;
  const left = CIRCLE_D / 2 - pxW / 2;
  const top = CIRCLE_D / 2 - pxH / 2;
  const t = transform ? `transform="${transform}"` : '';
  // Red halo behind the SVG so any clipping shows as visible red bleed.
  return `
    <rect x="${left - 4}" y="${top - 4}" width="${pxW + 8}" height="${pxH + 8}" fill="none" stroke="${HALO}" stroke-width="2" stroke-dasharray="6 4"/>
    <svg x="${left}" y="${top}" width="${pxW}" height="${pxH}" viewBox="${viewBox}">
      <path d="M21 4H8l-7 8 7 8h13a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l-6 6M12 9l6 6"
        stroke="${TEXT}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" ${t}/>
    </svg>`;
}

const variants = [
  {
    label: 'D. width=26, viewBox="-1 0 26 24", translate(-2, 0): tip stroke leaks outside dashed box → CLIPPED',
    icon: iconAt(26, 24, '-1 0 26 24', 'translate(-2, 0)'),
  },
  {
    label: 'E. width=28, viewBox="-2 0 28 24", translate(-2, 0): tip has room, no clipping',
    icon: iconAt(28, 24, '-2 0 28 24', 'translate(-2, 0)'),
  },
  {
    label: 'F. width=28, viewBox="-2.5 0 28 24", translate(-2, 0): extra safety on the tip',
    icon: iconAt(28, 24, '-2.5 0 28 24', 'translate(-2, 0)'),
  },
];

function buildCanvas(v) {
  const w = 1400;
  const h = CIRCLE_D + 120;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${BG}"/>
  <circle cx="${CIRCLE_D/2}" cy="${CIRCLE_D/2}" r="${CIRCLE_D/2 - 4}" fill="${CARD}" stroke="${BORDER}" stroke-width="2"/>
  <line x1="${CIRCLE_D/2}" y1="0" x2="${CIRCLE_D/2}" y2="${CIRCLE_D}" stroke="${GUIDE}" stroke-width="1" stroke-dasharray="6 6"/>
  <line x1="0" y1="${CIRCLE_D/2}" x2="${CIRCLE_D}" y2="${CIRCLE_D/2}" stroke="${GUIDE}" stroke-width="1" stroke-dasharray="6 6"/>
  ${v.icon}
  <text x="${CIRCLE_D + 40}" y="${CIRCLE_D/2}" font-family="sans-serif" font-size="22" fill="${TEXT}" dominant-baseline="middle">${v.label}</text>
  <text x="${CIRCLE_D + 40}" y="${CIRCLE_D/2 + 34}" font-family="sans-serif" font-size="14" fill="#8a8070" dominant-baseline="middle">Dashed pink box = SVG element boundary; anything past it is clipped in the actual app.</text>
</svg>`;
}

async function main() {
  const parts = [];
  let rowH = 0;
  for (const v of variants) {
    const svg = buildCanvas(v);
    const buf = await sharp(Buffer.from(svg)).png().toBuffer();
    parts.push(buf);
  }
  const meta = await sharp(parts[0]).metadata();
  rowH = meta.height;
  const width = meta.width;
  const composite = parts.map((buf, i) => ({ input: buf, top: i * rowH, left: 0 }));
  const out = path.join(__dirname, 'preview-backspace.png');
  await sharp({
    create: { width, height: rowH * variants.length, channels: 4, background: BG }
  })
    .composite(composite)
    .png()
    .toFile(out);
  console.log(`Wrote ${out}`);
}

main().catch(e => { console.error(e); process.exit(1); });
