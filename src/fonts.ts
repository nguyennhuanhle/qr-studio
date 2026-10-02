// Phông caption (UC-10). Trang dùng CSS của fontsource; file xuất thì nhúng thẳng phông (base64)
// để SVG/PNG mở ở máy khác vẫn đúng phông và đủ dấu tiếng Việt.
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/lora/400.css';
import '@fontsource/lora/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/700.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import { FONT_FAMILIES, fontStack, type FontKey } from './design';
import type { Measure } from './layout';

const files = import.meta.glob('/node_modules/@fontsource/*/files/*-{latin,vietnamese}-{400,700}-normal.woff2', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const RANGES = {
  latin: 'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD',
  vietnamese: 'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
} as const;

function fileUrl(key: FontKey, subset: keyof typeof RANGES, weight: 400 | 700): string {
  const name = `${FONT_FAMILIES[key].file}-${subset}-${weight}-normal.woff2`;
  const hit = Object.entries(files).find(([path]) => path.endsWith('/' + name));
  if (!hit) throw new Error('Missing font file ' + name);
  return hit[1];
}

const cache = new Map<string, string>();

async function toDataUrl(url: string): Promise<string> {
  const cached = cache.get(url);
  if (cached) return cached;
  const buf = await (await fetch(url)).arrayBuffer(); // tải file phông của chính app (cùng origin)
  let bin = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  const data = 'data:font/woff2;base64,' + btoa(bin);
  cache.set(url, data);
  return data;
}

/** CSS @font-face (base64) cho đúng phông + độ đậm đang dùng. */
export async function embeddedFontCss(key: FontKey, bold: boolean): Promise<string> {
  const weight = bold ? 700 : 400;
  const family = FONT_FAMILIES[key].family;
  const faces = await Promise.all(
    (Object.keys(RANGES) as Array<keyof typeof RANGES>).map(async (subset) => {
      const src = await toDataUrl(fileUrl(key, subset, weight));
      return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(${src}) format('woff2');unicode-range:${RANGES[subset]};}`;
    }),
  );
  return faces.join('');
}

export async function ensureFontLoaded(key: FontKey, bold: boolean): Promise<void> {
  try {
    await document.fonts.load(`${bold ? 700 : 400} 20px ${fontStack(key)}`, 'Quét đăng ký ẮỸ');
  } catch {
    /* phông lỗi thì trình duyệt dùng phông dự phòng */
  }
}

const ctx = document.createElement('canvas').getContext('2d');

export const browserMeasure: Measure = (text, font, bold, size) => {
  if (!ctx) return Array.from(text).length * size * 0.58;
  ctx.font = `${bold ? 700 : 400} ${size}px ${fontStack(font)}`;
  return ctx.measureText(text).width;
};
