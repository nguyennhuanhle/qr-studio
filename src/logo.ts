// Hình học logo giữa QR (UC-24/25, KT-12, KT-13). Toạ độ theo đơn vị "ô" của vùng mã (0..n).
import { LOGO_MAX_BYTES, LOGO_SIZE, LOGO_TYPES, type Logo } from './design';
import { roundedRect, circle } from './shapes';

export interface LogoGeometry {
  /** Vị trí ảnh (đã giữ đúng tỉ lệ). */
  image: { x: number; y: number; w: number; h: number };
  /** Path nền sau logo; null khi plate = 'none'. */
  platePath: string | null;
  /** Ô dữ liệu bị chừa trống dưới logo. */
  skip: (r: number, c: number) => boolean;
  /** Cỡ thực dùng (có thể nhỏ hơn cỡ chọn nếu QR quá nhỏ — KT-13). */
  size: number;
}

/** Khoảng trống giữa logo và các ô xung quanh. */
const GAP = 0.5;
/** Vùng logo không được vượt quá: chừa 3 mắt (7 ô) + 1 ô ngăn cách ở mỗi phía. */
const EYE_KEEP = 8;

export function logoGeometry(n: number, logo: Logo): LogoGeometry {
  const aspect = logo.width > 0 && logo.height > 0 ? logo.width / logo.height : 1;
  const limit = n / 2 - EYE_KEEP; // nửa cạnh tối đa của vùng logo
  let size = Math.min(Math.max(logo.size, LOGO_SIZE.min), LOGO_SIZE.max); // KT-12

  const measure = (s: number) => {
    const long = s * n;
    const w = aspect >= 1 ? long : long * aspect;
    const h = aspect >= 1 ? long / aspect : long;
    const half = (logo.plate === 'circle' ? Math.hypot(w, h) : Math.max(w, h)) / 2 + GAP;
    return { w, h, half };
  };

  let m = measure(size);
  while (m.half > limit && size > 0.02) {
    size *= 0.95; // KT-13: QR nhỏ thì logo tự thu nhỏ, không bao giờ chạm mắt
    m = measure(size);
  }

  const c = n / 2;
  const image = { x: c - m.w / 2, y: c - m.h / 2, w: m.w, h: m.h };
  const EPS = 0.02;

  let platePath: string | null = null;
  let skip: (r: number, col: number) => boolean;

  if (logo.plate === 'circle') {
    const R = m.half;
    platePath = circle(c, c, R);
    // Ô bị chừa nếu bất kỳ phần nào của ô nằm trong vòng tròn.
    skip = (r, col) => {
      const nx = Math.max(col, Math.min(c, col + 1));
      const ny = Math.max(r, Math.min(c, r + 1));
      return Math.hypot(nx - c, ny - c) < R - EPS;
    };
  } else {
    const hw = logo.plate === 'rounded' ? m.half : m.w / 2 + GAP;
    const hh = logo.plate === 'rounded' ? m.half : m.h / 2 + GAP;
    if (logo.plate === 'rounded') {
      const rad = hw * 0.35;
      platePath = roundedRect(c - hw, c - hh, 2 * hw, 2 * hh, [rad, rad, rad, rad]);
    }
    skip = (r, col) => col + 1 > c - hw + EPS && col < c + hw - EPS && r + 1 > c - hh + EPS && r < c + hh - EPS;
  }

  return { image, platePath, skip, size };
}

export type LogoReadError = 'type' | 'tooBig' | 'unreadable';

/** Đọc file ảnh ngay trong trình duyệt (KT-11) và kiểm LO-15/16/17. */
export async function readLogoFile(file: File): Promise<{ ok: true; src: string; width: number; height: number } | { ok: false; error: LogoReadError }> {
  const typeOk = LOGO_TYPES.includes(file.type) || /\.(png|jpe?g|svg|webp)$/i.test(file.name);
  if (!typeOk) return { ok: false, error: 'type' };
  if (file.size > LOGO_MAX_BYTES) return { ok: false, error: 'tooBig' };
  let src: string;
  try {
    src = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.onerror = () => reject(fr.error);
      fr.readAsDataURL(file);
    });
  } catch {
    return { ok: false, error: 'unreadable' };
  }
  // Một số máy không gán MIME cho .svg/.webp → suy ra từ đuôi file.
  const ext = /\.(png|jpe?g|svg|webp)$/i.exec(file.name)?.[1].toLowerCase();
  const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', webp: 'image/webp' }[ext ?? ''];
  if (mime && /^data:(application\/octet-stream)?[;,]/.test(src)) src = src.replace(/^data:[^;,]*/, 'data:' + mime);
  if (!/^data:image\/(png|jpeg|svg\+xml|webp)[;,]/.test(src)) {
    // Trình duyệt không nhận ra loại ảnh (đuôi đúng nhưng nội dung sai).
    return { ok: false, error: /^data:image\//.test(src) ? 'type' : 'unreadable' };
  }
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    return { ok: true, src, width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return { ok: false, error: 'unreadable' };
  }
}
