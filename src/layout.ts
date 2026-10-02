// Bố cục QR + khung + caption (UC-09→12, KT-03, KT-08).
// QR và quiet zone là một hộp vuông riêng; khung và caption luôn đặt BÊN NGOÀI hộp này.
import { DEFAULT_LABEL, type Design } from './design';

/** Cạnh hộp QR (gồm quiet zone) theo đơn vị cơ sở; khi xuất sẽ được co giãn. */
export const QR_BOX = 400;
/** KT-03: quiet zone cố định 4 ô (chuẩn ISO), không có ô chỉnh. */
export const QUIET_ZONE = 4;

export type Measure = (text: string, fontKey: Design['caption']['font'], bold: boolean, size: number) => number;

/** Ước lượng bề rộng chữ khi không có trình duyệt (script kiểm thử). */
export const approxMeasure: Measure = (text, font, bold, size) =>
  Array.from(text).length * size * (font === 'mono' ? 0.6 : bold ? 0.6 : 0.55);

export interface Rect { x: number; y: number; w: number; h: number; r: [number, number, number, number] }

export interface Layout {
  width: number;
  height: number;
  qr: { x: number; y: number; size: number };
  /** Vùng nền (màu nền QR) — nằm trong khung. */
  hole: Rect;
  /** Hình ngoài của khung; null = không khung. */
  outer: Rect | null;
  tail: string | null;
  caption: { text: string; x: number; y: number; size: number; inBand: boolean } | null;
}

export function captionTextFor(d: Design): string {
  const t = d.caption.text.trim();
  if (t) return t;
  return d.frame.type === 'banner' || d.frame.type === 'bubble' ? DEFAULT_LABEL : ''; // LO-09
}

export function computeLayout(d: Design, measure: Measure): Layout {
  const text = captionTextFor(d);
  const type = d.frame.type;
  const hasBand = type === 'banner' || type === 'bubble';
  const t = type === 'none' ? 0 : d.frame.thickness;
  const R = type === 'rounded' ? 28 : type === 'banner' ? 20 : type === 'bubble' ? 36 : 0;
  const Q = QR_BOX;
  const W = Q + 2 * t;
  const top = d.caption.position === 'top';

  // Cỡ chữ: thu nhỏ nếu caption dài hơn bề rộng khả dụng.
  let fs = d.caption.size;
  const maxW = W - 2 * (t + 16);
  if (text) {
    const w = measure(text, d.caption.font, d.caption.bold, fs);
    if (w > maxW) fs = Math.max(8, (fs * maxW) / w);
  }
  const fsBase = d.caption.size; // chiều cao dải giữ theo cỡ người dùng chọn để bố cục không nhảy

  const zero: Rect['r'] = [0, 0, 0, 0];

  if (hasBand) {
    const bandH = Math.round(fsBase * 2.3);
    const bodyH = 2 * t + Q + bandH;
    const tailH = type === 'bubble' ? 28 : 0;
    const qrY = top ? t + bandH : t;
    const ir = Math.max(R - t, 0);
    const hole: Rect = { x: t, y: qrY, w: Q, h: Q, r: top ? [0, 0, ir, ir] : [ir, ir, 0, 0] };
    const capY = top ? (t + bandH) / 2 + t / 4 : (qrY + Q + bodyH) / 2 - t / 4;
    const tail =
      type === 'bubble'
        ? `M${W / 2 - 24} ${bodyH - 2}L${W / 2} ${bodyH + tailH}L${W / 2 + 24} ${bodyH - 2}Z`
        : null;
    return {
      width: W,
      height: bodyH + tailH,
      qr: { x: t, y: qrY, size: Q },
      hole,
      outer: { x: 0, y: 0, w: W, h: bodyH, r: [R, R, R, R] },
      tail,
      caption: { text, x: W / 2, y: capY, size: fs, inBand: true },
    };
  }

  const blockH = text ? Math.round(fsBase * 1.7) : 0;
  const H = Q + blockH + 2 * t;
  const qrY = t + (top ? blockH : 0);
  // Quiet zone đã tạo khoảng cách với QR, nên kéo chữ sát về phía QR một chút.
  const capY = top ? t + blockH * 0.6 : t + Q + blockH * 0.4;
  const ir = Math.max(R - t, 0);
  return {
    width: W,
    height: H,
    qr: { x: t, y: qrY, size: Q },
    hole: { x: t, y: t, w: Q, h: Q + blockH, r: type === 'none' ? zero : [ir, ir, ir, ir] },
    outer: type === 'none' ? null : { x: 0, y: 0, w: W, h: H, r: [R, R, R, R] },
    tail: null,
    caption: text ? { text, x: W / 2, y: capY, size: fs, inBand: false } : null,
  };
}
