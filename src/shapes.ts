// Path SVG cho hoạ tiết (UC-03) và mắt QR (UC-04). Toạ độ tính theo đơn vị "ô": ô (hàng r, cột c) chiếm [c, c+1]×[r, r+1].
import type { DotStyle, EyeInnerStyle, EyeOuterStyle } from './design';
import { isEyeModule, type Matrix } from './qr';

export const n3 = (v: number) => String(Math.round(v * 1000) / 1000);

type Radii = [tl: number, tr: number, br: number, bl: number];

export function roundedRect(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: Radii): string {
  const arc = (r: number, ex: number, ey: number) => (r > 0 ? `A${n3(r)} ${n3(r)} 0 0 1 ${n3(ex)} ${n3(ey)}` : `L${n3(ex)} ${n3(ey)}`);
  return (
    `M${n3(x + tl)} ${n3(y)}H${n3(x + w - tr)}` +
    arc(tr, x + w, y + tr) +
    `V${n3(y + h - br)}` +
    arc(br, x + w - br, y + h) +
    `H${n3(x + bl)}` +
    arc(bl, x, y + h - bl) +
    `V${n3(y + tl)}` +
    arc(tl, x + tl, y) +
    'Z'
  );
}

export function circle(cx: number, cy: number, r: number): string {
  return `M${n3(cx - r)} ${n3(cy)}a${n3(r)} ${n3(r)} 0 1 0 ${n3(2 * r)} 0a${n3(r)} ${n3(r)} 0 1 0 ${n3(-2 * r)} 0Z`;
}

function diamond(x: number, y: number, s: number): string {
  const h = s / 2;
  return `M${n3(x + h)} ${n3(y)}L${n3(x + s)} ${n3(y + h)}L${n3(x + h)} ${n3(y + s)}L${n3(x)} ${n3(y + h)}Z`;
}

/** Toàn bộ ô dữ liệu (trừ 3 mắt) gộp thành 1 path. */
export function dotsPath(m: Matrix, style: DotStyle): string {
  const n = m.size;
  const on = (r: number, c: number) => m.isDark(r, c) && !isEyeModule(n, r, c);
  const parts: string[] = [];

  if (style === 'vlines' || style === 'hlines') {
    const vertical = style === 'vlines';
    for (let a = 0; a < n; a++) {
      let b = 0;
      while (b < n) {
        const isOn = (k: number) => (vertical ? on(k, a) : on(a, k));
        if (!isOn(b)) { b++; continue; }
        let end = b;
        while (end + 1 < n && isOn(end + 1)) end++;
        const len = end - b + 1;
        const w = 0.72, inset = (1 - w) / 2, r = w / 2;
        parts.push(
          vertical
            ? roundedRect(a + inset, b + 0.04, w, len - 0.08, [r, r, r, r])
            : roundedRect(b + 0.04, a + inset, len - 0.08, w, [r, r, r, r]),
        );
        b = end + 1;
      }
    }
    return parts.join('');
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!on(r, c)) continue;
      switch (style) {
        case 'square':
          parts.push(`M${c} ${r}h1v1h-1Z`);
          break;
        case 'dots':
          parts.push(circle(c + 0.5, r + 0.5, 0.46));
          break;
        case 'rounded':
          parts.push(roundedRect(c + 0.05, r + 0.05, 0.9, 0.9, [0.3, 0.3, 0.3, 0.3]));
          break;
        case 'diamond':
          parts.push(diamond(c - 0.05, r - 0.05, 1.1));
          break;
        case 'connected':
        case 'classy': {
          const t = on(r - 1, c), b = on(r + 1, c), l = on(r, c - 1), rt = on(r, c + 1);
          const R = 0.5;
          const radii: Radii =
            style === 'connected'
              ? [!t && !l ? R : 0, !t && !rt ? R : 0, !b && !rt ? R : 0, !b && !l ? R : 0]
              : [!t && !l ? R : 0, 0, !b && !rt ? R : 0, 0];
          parts.push(roundedRect(c, r, 1, 1, radii));
          break;
        }
      }
    }
  }
  return parts.join('');
}

/** Vị trí góc trên-trái của 3 mắt. */
export function eyeOrigins(n: number): Array<{ x: number; y: number; corner: 'tl' | 'tr' | 'bl' }> {
  return [
    { x: 0, y: 0, corner: 'tl' },
    { x: n - 7, y: 0, corner: 'tr' },
    { x: 0, y: n - 7, corner: 'bl' },
  ];
}

/** Khung mắt 7×7 dày 1 ô — vẽ với fill-rule="evenodd". */
export function eyeOuterPath(x: number, y: number, style: EyeOuterStyle, corner: 'tl' | 'tr' | 'bl'): string {
  switch (style) {
    case 'square':
      return roundedRect(x, y, 7, 7, [0, 0, 0, 0]) + roundedRect(x + 1, y + 1, 5, 5, [0, 0, 0, 0]);
    case 'rounded':
      return roundedRect(x, y, 7, 7, [2.2, 2.2, 2.2, 2.2]) + roundedRect(x + 1, y + 1, 5, 5, [1.2, 1.2, 1.2, 1.2]);
    case 'circle':
      return circle(x + 3.5, y + 3.5, 3.5) + circle(x + 3.5, y + 3.5, 2.5);
    case 'leaf': {
      const o: Radii = corner === 'tl' ? [2.4, 0, 2.4, 0] : [0, 2.4, 0, 2.4];
      const i: Radii = corner === 'tl' ? [1.4, 0, 1.4, 0] : [0, 1.4, 0, 1.4];
      return roundedRect(x, y, 7, 7, o) + roundedRect(x + 1, y + 1, 5, 5, i);
    }
  }
}

/** Tròng mắt 3×3 ở giữa khung. */
export function eyeInnerPath(x: number, y: number, style: EyeInnerStyle): string {
  const ix = x + 2, iy = y + 2;
  switch (style) {
    case 'square':
      return roundedRect(ix, iy, 3, 3, [0, 0, 0, 0]);
    case 'rounded':
      return roundedRect(ix, iy, 3, 3, [0.9, 0.9, 0.9, 0.9]);
    case 'circle':
      return circle(ix + 1.5, iy + 1.5, 1.5);
    case 'diamond':
      return diamond(ix - 0.25, iy - 0.25, 3.5);
  }
}
