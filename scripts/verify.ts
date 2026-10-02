// Kiểm thử bằng lời gọi thật: chạy đúng các hàm của app, in kết quả ra để người xem tự đánh giá.
//   npm run verify            → kiểm URL + giải mã lại QR của mọi tổ hợp
//   npm run verify -- --png   → kèm lưu ảnh mẫu vào scripts/out/
import { Resvg } from '@resvg/resvg-js';
import jsQR from 'jsqr';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { prepareZXingModule, readBarcodes } from 'zxing-wasm/reader';
import { defaultDesign, type Design, type DotStyle, type EyeInnerStyle, type EyeOuterStyle, type FrameType } from '../src/design';
import { scanWarnings } from '../src/checks';
import { renderSvg } from '../src/render';
import { validateUrl } from '../src/url';

const savePng = process.argv.includes('--png');
if (savePng) mkdirSync(new URL('./out/', import.meta.url), { recursive: true });

// ---------- 1. URL ----------
console.log('\n=== 1. Kiểm tra URL (UC-01/02, KT-01, LO-01→04) ===');
const urlInputs = [
  '',
  '   ',
  'https://edtechcorner.vn',
  'edtechcorner.vn/khoa-hoc?id=12',
  'http://example.com/',
  'localhost:5173',
  'ten-mien.vn:8080/a',
  'abc',
  'http://',
  'có dấu cách.vn',
  'javascript:alert(1)',
  'data:text/html,<b>x</b>',
  'mailto:a@b.com',
  'file:///C:/x.txt',
  'https://vi.wikipedia.org/wiki/Mã_QR',
  'https://tênmiền.vn/đường-dẫn',
  'https://example.com/?q=' + 'a'.repeat(400),
  'https://example.com/?q=' + 'a'.repeat(1200),
];
for (const raw of urlInputs) {
  const r = validateUrl(raw);
  const shown = raw.length > 60 ? raw.slice(0, 57) + '…' : raw;
  const detail =
    r.status === 'ok'
      ? `→ mã hoá: ${r.encoded.length > 70 ? r.encoded.slice(0, 67) + '…' : r.encoded}${r.autoPrefixed ? '  [tự thêm https://]' : ''}${r.dense ? '  [cảnh báo QR dày]' : ''}`
      : r.status === 'scheme'
        ? `(scheme "${r.scheme}")`
        : r.status === 'too-long'
          ? `(${r.length} ký tự)`
          : '';
  console.log(`  ${JSON.stringify(shown).padEnd(42)} ${r.status.padEnd(8)} ${detail}`);
}

// ---------- 2. Giải mã lại QR ----------
// ZXing-C++ (lõi của nhiều app quét trên điện thoại) là bộ đọc chính; jsQR (kén hơn nhiều) để tham khảo.
const wasm = readFileSync(createRequire(import.meta.url).resolve('zxing-wasm/reader/zxing_reader.wasm'));
prepareZXingModule({ overrides: { wasmBinary: wasm.buffer.slice(wasm.byteOffset, wasm.byteOffset + wasm.byteLength) as ArrayBuffer }, fireImmediately: true });

async function zxing(svg: string, width: number): Promise<string | null> {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: width }, background: 'white', font: { loadSystemFonts: true } }).render().asPng();
  const r = await readBarcodes(new Uint8Array(png), { formats: ['QRCode'], tryHarder: true });
  return r[0]?.text ?? null;
}
function jsqr(svg: string): string | null {
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 640 }, background: 'white', font: { loadSystemFonts: true } }).render();
  const res = jsQR(new Uint8ClampedArray(png.pixels), png.width, png.height, { inversionAttempts: 'attemptBoth' });
  return res ? res.data : null;
}
function pngOf(svg: string, width = 480): Buffer {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width }, font: { loadSystemFonts: true } }).render().asPng();
}

const URL_SHORT = validateUrl('edtechcorner.vn/khoa-hoc?id=12');
const URL_LONG = validateUrl('https://example.com/landing?utm_source=poster&utm_medium=print&utm_campaign=open-day-2026&ref=' + 'x'.repeat(120));
if (URL_SHORT.status !== 'ok' || URL_LONG.status !== 'ok') throw new Error('URL mẫu không hợp lệ');

type Case = { name: string; d: Design; url: string };
const cases: Case[] = [];
const base = defaultDesign();
const dots: DotStyle[] = ['square', 'dots', 'rounded', 'connected', 'classy', 'diamond', 'vlines', 'hlines'];
const outers: EyeOuterStyle[] = ['square', 'rounded', 'circle', 'leaf'];
const inners: EyeInnerStyle[] = ['square', 'circle', 'rounded', 'diamond'];
const frames: FrameType[] = ['none', 'square', 'rounded', 'banner', 'bubble'];

for (const url of [URL_SHORT.encoded, URL_LONG.encoded])
  for (const dt of dots)
    for (let i = 0; i < outers.length; i++)
      cases.push({ name: `hoạ tiết=${dt} mắt=${outers[i]}/${inners[(i + 1) % 4]}`, url, d: { ...base, dots: dt, eyeOuter: outers[i], eyeInner: inners[(i + 1) % 4] } });

const colorCases: Array<[string, Partial<Design>]> = [
  ['màu đơn xanh/nền kem', { fg: { mode: 'solid', c1: '#1e3a8a', c2: '#000', angle: 0 }, bg: { color: '#fff7e6', transparent: false } }],
  ['gradient tuyến tính 45°', { fg: { mode: 'linear', c1: '#7c3aed', c2: '#db2777', angle: 45 } }],
  ['gradient toả tròn', { fg: { mode: 'radial', c1: '#0f766e', c2: '#1d4ed8', angle: 0 } }],
  ['mắt màu riêng', { eyeOuterColor: '#dc2626', eyeInnerColor: '#111827' }],
  ['nền trong suốt', { bg: { color: '#ffffff', transparent: true } }],
  ['TƯƠNG PHẢN THẤP (phải cảnh báo)', { fg: { mode: 'solid', c1: '#bbbbbb', c2: '#000', angle: 0 }, bg: { color: '#ffffff', transparent: false } }],
  ['ĐẢO MÀU (phải cảnh báo)', { fg: { mode: 'solid', c1: '#ffffff', c2: '#000', angle: 0 }, bg: { color: '#111827', transparent: false } }],
];
for (const [name, patch] of colorCases) cases.push({ name, url: URL_SHORT.encoded, d: { ...base, dots: 'rounded', ...patch } });

for (const f of frames)
  for (const pos of ['bottom', 'top'] as const)
    for (const text of ['', 'Quét để đăng ký khoá học tiếng Anh miễn phí — hạn chót 30/10'])
      cases.push({
        name: `khung=${f} caption=${text ? 'dài' : 'trống'} ${pos}`,
        url: URL_SHORT.encoded,
        d: { ...base, dots: 'connected', eyeOuter: 'rounded', eyeInner: 'circle', frame: { type: f, color: '#1d4ed8', thickness: 8 }, caption: { ...base.caption, text, position: pos } },
      });

console.log(`\n=== 2. Render → PNG → giải mã lại (${cases.length} tổ hợp) ===`);
console.log('  cột: ZXing@640px | ZXing@260px (ảnh nhỏ/xa) | jsQR@640px   — "đúng" = đọc ra đúng y chuỗi đã mã hoá');
let ok = 0, okSmall = 0, okJs = 0;
const fails: string[] = [];
const mark = (got: string | null, want: string) => (got === null ? 'không đọc' : got === want ? 'đúng' : 'SAI CHUỖI');
for (const [i, c] of cases.entries()) {
  const { svg } = renderSvg(c.d, c.url);
  const [big, small, js] = [await zxing(svg, 640), await zxing(svg, 260), jsqr(svg)];
  const got = big;
  if (big === c.url) ok++;
  else fails.push(c.name);
  if (small === c.url) okSmall++;
  if (js === c.url) okJs++;
  const warns = scanWarnings(c.d, { status: 'ok', encoded: c.url, autoPrefixed: false, dense: c.url.length >= 300, host: '' }).map((w) => w.id);
  const urlTag = c.url === URL_SHORT.encoded ? 'ngắn' : 'dài ';
  console.log(
    `  ${String(i + 1).padStart(3)}. [${urlTag}] ${c.name.padEnd(46)} → ${(got ?? '(không đọc được)').slice(0, 40).padEnd(40)} | ${mark(big, c.url).padEnd(9)} | ${mark(small, c.url).padEnd(9)} | ${mark(js, c.url).padEnd(9)}${warns.length ? `  cảnh báo: ${warns.join(',')}` : ''}`,
  );
  if (savePng && (c.url === URL_SHORT.encoded || i % 4 === 0)) {
    writeFileSync(new URL(`./out/${String(i + 1).padStart(3, '0')}.png`, import.meta.url), pngOf(svg));
  }
}
console.log(`\n  ZXing@640: đúng ${ok}/${cases.length} · ZXing@260: đúng ${okSmall}/${cases.length} · jsQR: đúng ${okJs}/${cases.length}`);
if (fails.length) console.log('  ZXing@640 không đọc được: ' + fails.join(' | '));
