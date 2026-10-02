// Mô hình dữ liệu thiết kế (plan.md §1). Chỉ sống trong bộ nhớ — không lưu (xem "Hệ thống KHÔNG làm").

export type DotStyle = 'square' | 'dots' | 'rounded' | 'connected' | 'classy' | 'diamond' | 'vlines' | 'hlines';
export type EyeOuterStyle = 'square' | 'rounded' | 'circle' | 'leaf';
export type EyeInnerStyle = 'square' | 'circle' | 'rounded' | 'diamond';
export type FillMode = 'solid' | 'linear' | 'radial';
export type FontKey = 'sans' | 'serif' | 'mono' | 'rounded';
export type FrameType = 'none' | 'square' | 'rounded' | 'banner' | 'bubble';
export type PngSize = 512 | 1024 | 2048 | 4096;

export interface Design {
  dots: DotStyle;
  eyeOuter: EyeOuterStyle;
  eyeInner: EyeInnerStyle;
  fg: { mode: FillMode; c1: string; c2: string; angle: number };
  bg: { color: string; transparent: boolean };
  /** null = dùng màu hoạ tiết (UC-07). */
  eyeOuterColor: string | null;
  eyeInnerColor: string | null;
  caption: { text: string; position: 'top' | 'bottom'; font: FontKey; size: number; bold: boolean; color: string };
  frame: { type: FrameType; color: string; thickness: number };
  pngSize: PngSize;
}

export const PNG_SIZES: readonly PngSize[] = [512, 1024, 2048, 4096]; // KT-05
export const CAPTION_MAX = 60; // KT-04
export const CAPTION_SIZE = { min: 14, max: 40 };
export const FRAME_THICKNESS = { min: 2, max: 16 };
export const DEFAULT_LABEL = 'SCAN ME'; // LO-09

export function defaultDesign(): Design {
  return {
    dots: 'square',
    eyeOuter: 'square',
    eyeInner: 'square',
    fg: { mode: 'solid', c1: '#111827', c2: '#2563eb', angle: 45 },
    bg: { color: '#ffffff', transparent: false },
    eyeOuterColor: null,
    eyeInnerColor: null,
    caption: { text: '', position: 'bottom', font: 'sans', size: 22, bold: true, color: '#111827' },
    frame: { type: 'none', color: '#111827', thickness: 6 },
    pngSize: 1024,
  };
}

export const FONT_FAMILIES: Record<FontKey, { family: string; file: string; label: string }> = {
  sans: { family: 'Be Vietnam Pro', file: 'be-vietnam-pro', label: 'Sans' },
  serif: { family: 'Lora', file: 'lora', label: 'Serif' },
  mono: { family: 'JetBrains Mono', file: 'jetbrains-mono', label: 'Mono' },
  rounded: { family: 'Nunito', file: 'nunito', label: 'Rounded' },
};

export function fontStack(key: FontKey): string {
  const fallback = key === 'serif' ? 'serif' : key === 'mono' ? 'monospace' : 'sans-serif';
  return `'${FONT_FAMILIES[key].family}', ${fallback}`;
}

/** KT-04 + LO-08: một dòng, tối đa 60 ký tự. */
export function sanitizeCaption(s: string): string {
  return Array.from(s.replace(/[\r\n\t]+/g, ' ')).slice(0, CAPTION_MAX).join('');
}
