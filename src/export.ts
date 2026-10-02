// Xuất file (UC-13→16, KT-05, LO-10, LO-11).
import { PNG_SIZES, type Design, type PngSize } from './design';
import { captionTextFor } from './layout';
import { embeddedFontCss, browserMeasure } from './fonts';
import { renderSvg } from './render';

/** Mã lỗi; câu chữ do giao diện dịch (i18n.ts, khoá export.error.*). */
export class ExportError extends Error {
  constructor(
    readonly code: 'size' | 'canvas' | 'memory' | 'clipboard',
    readonly size?: number,
  ) {
    super(code);
  }
}

/** UC-16: tên file theo tên miền. */
export function fileBase(host: string): string {
  const safe = host.replace(/^www\./, '').replace(/[^a-z0-9.-]/gi, '-');
  return `qr-${safe || 'link'}`;
}

async function svgForExport(d: Design, encoded: string): Promise<{ svg: string; width: number; height: number }> {
  const fontFaceCss = captionTextFor(d) ? await embeddedFontCss(d.caption.font, d.caption.bold) : undefined;
  return renderSvg(d, encoded, { idPrefix: 'qrx', measure: browserMeasure, fontFaceCss });
}

export async function svgBlob(d: Design, encoded: string): Promise<Blob> {
  const { svg } = await svgForExport(d, encoded);
  return new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n', svg], { type: 'image/svg+xml' });
}

export async function pngBlob(d: Design, encoded: string, size: PngSize): Promise<Blob> {
  if (!PNG_SIZES.includes(size)) throw new ExportError('size'); // KT-05
  const { svg, width, height } = await svgForExport(d, encoded);
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = Math.round((size * height) / width);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new ExportError('canvas');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) throw new ExportError('memory', size); // LO-11
    return blob;
  } catch (e) {
    if (e instanceof ExportError) throw e;
    throw new ExportError('memory', size);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** UC-15 + LO-10. */
export async function copyPng(d: Design, encoded: string, size: PngSize): Promise<void> {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new ExportError('clipboard');
  }
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob(d, encoded, size) })]);
  } catch (e) {
    if (e instanceof ExportError) throw e;
    throw new ExportError('clipboard');
  }
}
