// Design + URL → một chuỗi SVG hoàn chỉnh. PNG cũng được vẽ từ chính chuỗi này.
import { fontStack, type Design } from './design';
import { readableOn } from './checks';
import { approxMeasure, computeLayout, QUIET_ZONE, type Measure, type Rect } from './layout';
import { buildMatrix } from './qr';
import { dotsPath, eyeInnerPath, eyeOrigins, eyeOuterPath, n3, roundedRect } from './shapes';

export interface RenderOptions {
  /** Tiền tố id để nhiều SVG nằm chung một trang không đụng id gradient. */
  idPrefix?: string;
  measure?: Measure;
  /** CSS @font-face nhúng vào SVG khi xuất, để file mở ở máy khác vẫn đúng phông. */
  fontFaceCss?: string;
}

export interface Rendered {
  svg: string;
  width: number;
  height: number;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rectPath = (r: Rect) => roundedRect(r.x, r.y, r.w, r.h, r.r);

/** KT-07: `encoded` được mã hoá nguyên văn, không thêm gì. */
export function renderSvg(d: Design, encoded: string, opts: RenderOptions = {}): Rendered {
  const id = opts.idPrefix ?? 'qr';
  const matrix = buildMatrix(encoded);
  const n = matrix.size;
  const L = computeLayout(d, opts.measure ?? approxMeasure);
  const m = L.qr.size / (n + 2 * QUIET_ZONE);

  const defs: string[] = [];
  if (opts.fontFaceCss) defs.push(`<style>${opts.fontFaceCss}</style>`);

  let fgPaint = d.fg.c1;
  if (d.fg.mode === 'linear') {
    const a = (d.fg.angle * Math.PI) / 180;
    const cx = n / 2, half = (n / 2) * (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a)));
    defs.push(
      `<linearGradient id="${id}-fg" gradientUnits="userSpaceOnUse" x1="${n3(cx - Math.cos(a) * half)}" y1="${n3(cx - Math.sin(a) * half)}" x2="${n3(cx + Math.cos(a) * half)}" y2="${n3(cx + Math.sin(a) * half)}">` +
        `<stop offset="0" stop-color="${d.fg.c1}"/><stop offset="1" stop-color="${d.fg.c2}"/></linearGradient>`,
    );
    fgPaint = `url(#${id}-fg)`;
  } else if (d.fg.mode === 'radial') {
    defs.push(
      `<radialGradient id="${id}-fg" gradientUnits="userSpaceOnUse" cx="${n3(n / 2)}" cy="${n3(n / 2)}" r="${n3(n * 0.72)}">` +
        `<stop offset="0" stop-color="${d.fg.c1}"/><stop offset="1" stop-color="${d.fg.c2}"/></radialGradient>`,
    );
    fgPaint = `url(#${id}-fg)`;
  }

  const body: string[] = [];
  if (!d.bg.transparent) body.push(`<path d="${rectPath(L.hole)}" fill="${d.bg.color}"/>`);
  if (L.outer) {
    // Khung = hình ngoài trừ đi vùng nền (evenodd), nên nền trong suốt vẫn thủng đúng chỗ.
    body.push(`<path d="${rectPath(L.outer)}${rectPath(L.hole)}" fill="${d.frame.color}" fill-rule="evenodd"/>`);
  }
  if (L.tail) body.push(`<path d="${L.tail}" fill="${d.frame.color}"/>`);

  const off = QUIET_ZONE * m;
  const eyes = eyeOrigins(n);
  body.push(
    `<g transform="translate(${n3(L.qr.x + off)} ${n3(L.qr.y + off)}) scale(${n3(m)})">` +
      `<path d="${dotsPath(matrix, d.dots)}" fill="${fgPaint}"/>` +
      `<path d="${eyes.map((e) => eyeOuterPath(e.x, e.y, d.eyeOuter, e.corner)).join('')}" fill="${d.eyeOuterColor ?? fgPaint}" fill-rule="evenodd"/>` +
      `<path d="${eyes.map((e) => eyeInnerPath(e.x, e.y, d.eyeInner)).join('')}" fill="${d.eyeInnerColor ?? fgPaint}"/>` +
      `</g>`,
  );

  if (L.caption) {
    const c = L.caption;
    const color = c.inBand ? readableOn(d.frame.color) : d.caption.color;
    body.push(
      `<text x="${n3(c.x)}" y="${n3(c.y)}" text-anchor="middle" dominant-baseline="central" ` +
        `font-family="${esc(fontStack(d.caption.font))}" font-size="${n3(c.size)}" font-weight="${d.caption.bold ? 700 : 400}" fill="${color}">${esc(c.text)}</text>`,
    );
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n3(L.width)} ${n3(L.height)}" width="${n3(L.width)}" height="${n3(L.height)}">` +
    (defs.length ? `<defs>${defs.join('')}</defs>` : '') +
    body.join('') +
    `</svg>`;
  return { svg, width: L.width, height: L.height };
}
