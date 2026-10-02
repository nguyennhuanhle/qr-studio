// Tạo ảnh minh hoạ cho README: docs/samples.png (4 thiết kế mẫu đặt cạnh nhau).
//   npx tsx scripts/samples.ts
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { defaultDesign, type Design } from '../src/design';
import { renderSvg } from '../src/render';

const url = 'https://github.com/nguyennhuanhle/qr-studio';
const mk = (f: (d: Design) => void) => {
  const d = defaultDesign();
  f(d);
  return d;
};
const designs = [
  mk((d) => {
    d.dots = 'connected'; d.eyeOuter = 'rounded'; d.eyeInner = 'circle';
    d.fg = { mode: 'linear', c1: '#1d4ed8', c2: '#7c3aed', angle: 45 };
    d.frame = { type: 'bubble', color: '#1d4ed8', thickness: 8 };
    d.caption = { ...d.caption, text: 'Scan to view the source' };
  }),
  mk((d) => {
    d.dots = 'dots'; d.eyeOuter = 'circle'; d.eyeInner = 'circle';
    d.fg = { mode: 'radial', c1: '#0f766e', c2: '#164e63', angle: 0 };
    d.bg = { color: '#f0fdf4', transparent: false };
    d.frame = { type: 'banner', color: '#0f766e', thickness: 6 };
    d.caption = { ...d.caption, position: 'top' };
    const mark = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#0f766e"/><path d="M30 50h40M50 30v40" stroke="#fff" stroke-width="12" stroke-linecap="round"/></svg>';
    d.logo = { src: 'data:image/svg+xml;base64,' + Buffer.from(mark).toString('base64'), width: 100, height: 100, size: 0.22, plate: 'circle' };
  }),
  mk((d) => {
    d.dots = 'classy'; d.eyeOuter = 'leaf'; d.eyeInner = 'rounded';
    d.eyeOuterColor = '#b91c1c'; d.eyeInnerColor = '#111827';
    d.frame = { type: 'rounded', color: '#111827', thickness: 4 };
    d.caption = { ...d.caption, text: 'Library — Open daily', font: 'serif', bold: false, size: 20, color: '#b91c1c' };
  }),
  mk((d) => {
    d.dots = 'vlines'; d.eyeOuter = 'square'; d.eyeInner = 'diamond';
    d.caption = { ...d.caption, text: 'github.com', font: 'mono', size: 18 };
  }),
];

const rendered = designs.map((d, i) => renderSvg(d, url, { idPrefix: `s${i}` }));
const gap = 40;
const H = Math.max(...rendered.map((r) => r.height));
let x = gap;
const parts = rendered.map((r) => {
  // resvg không đọc được woff2 của app, nên ảnh minh hoạ dùng phông hệ thống gần giống.
  const inner = r.svg
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>$/, '')
    .replace(/font-family="[^"]*Be Vietnam Pro[^"]*"/g, 'font-family="Segoe UI"')
    .replace(/font-family="[^"]*Lora[^"]*"/g, 'font-family="Georgia"')
    .replace(/font-family="[^"]*JetBrains Mono[^"]*"/g, 'font-family="Consolas"');
  const g = `<g transform="translate(${x} ${gap + (H - r.height) / 2})">${inner}</g>`;
  x += r.width + gap;
  return g;
});
const W = x;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H + 2 * gap}" width="${W}" height="${H + 2 * gap}"><rect width="100%" height="100%" fill="#f4f2ee"/>${parts.join('')}</svg>`;
const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1600 }, font: { loadSystemFonts: true } }).render().asPng();
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
writeFileSync(new URL('../docs/samples.png', import.meta.url), png);
console.log(`docs/samples.png ${png.length} bytes`);
