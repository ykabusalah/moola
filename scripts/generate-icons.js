const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const buildSvg = ({ withBg }) => `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  ${withBg ? '<rect width="1024" height="1024" fill="#faf9f6" />' : ''}
  <g transform="translate(122 122) scale(13)">
    <path d="M30,5 Q50,3 55,25 Q57,50 30,55 Q8,57 5,30 Q3,10 30,5"
          stroke="#3a3428" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  </g>
  <circle cx="512" cy="512" r="48" fill="#3a3428" />
</svg>
`.trim();

const targets = [
  { file: 'icon.png',          size: 1024, withBg: true  },
  { file: 'adaptive-icon.png', size: 1024, withBg: false },
  { file: 'splash-icon.png',   size: 1024, withBg: false },
  { file: 'favicon.png',       size: 48,   withBg: true  },
];

(async () => {
  const assetsDir = path.join(__dirname, '..', 'assets');
  for (const t of targets) {
    const svg = Buffer.from(buildSvg({ withBg: t.withBg }));
    const out = path.join(assetsDir, t.file);
    await sharp(svg).resize(t.size, t.size).png().toFile(out);
    console.log(`✓ ${t.file} (${t.size}x${t.size})`);
  }
})().catch(err => { console.error(err); process.exit(1); });
