// Cảnh báo khả năng quét (LO-04, LO-05, LO-06, LO-07, LO-12).
import { LOGO_SIZE, type Design } from './design';
import type { UrlResult } from './url';

export const MIN_CONTRAST = 4;

/** Câu chữ do giao diện dịch theo `id` (xem i18n.ts, khoá warn.*). */
export interface Warning {
  id: 'dense' | 'contrast' | 'inverted' | 'transparent' | 'logoEc' | 'logoBig';
  level: 'warn' | 'info';
  params?: Record<string, string | number>;
}

export function parseHex(hex: string): [number, number, number] {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((ch) => ch + ch).join('');
  const v = parseInt(h.slice(0, 6), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Màu chữ đen/trắng đọc rõ trên nền cho trước (UC-12). */
export function readableOn(hex: string): string {
  return contrastRatio(hex, '#ffffff') >= contrastRatio(hex, '#111111') ? '#ffffff' : '#111111';
}

/** Mọi màu tiền cảnh thực sự xuất hiện trên QR: hoạ tiết (1 hoặc 2 màu) + màu mắt riêng. */
export function foregroundColors(d: Design): string[] {
  const colors = [d.fg.c1];
  if (d.fg.mode !== 'solid') colors.push(d.fg.c2);
  if (d.eyeOuterColor) colors.push(d.eyeOuterColor);
  if (d.eyeInnerColor) colors.push(d.eyeInnerColor);
  return colors;
}

export function scanWarnings(d: Design, url: UrlResult): Warning[] {
  const out: Warning[] = [];
  if (url.status === 'ok' && url.dense) {
    out.push({ id: 'dense', level: 'warn' });
  }
  // LO-18
  if (d.logo) {
    out.push({ id: 'logoEc', level: 'info' });
    if (d.logo.size > LOGO_SIZE.warnAbove) out.push({ id: 'logoBig', level: 'warn' });
  }
  if (d.bg.transparent) {
    out.push({ id: 'transparent', level: 'info' });
    return out;
  }
  const fgs = foregroundColors(d);
  const worst = Math.min(...fgs.map((c) => contrastRatio(c, d.bg.color)));
  if (worst < MIN_CONTRAST) {
    out.push({ id: 'contrast', level: 'warn', params: { ratio: worst.toFixed(1), min: MIN_CONTRAST } });
  }
  const bgL = luminance(d.bg.color);
  if (fgs.some((c) => luminance(c) > bgL)) {
    out.push({ id: 'inverted', level: 'warn' });
  }
  return out;
}
