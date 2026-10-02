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

// ---------- 3. Logo giữa QR (UC-24/25, KT-12/13, LO-13/18) ----------
// Logo mẫu: hình khối màu đậm kín ~ toàn khung (ca khó nhất cho máy quét), dạng PNG lẫn SVG.
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" width="120" height="80"><rect width="120" height="80" rx="14" fill="#e11d48"/><circle cx="40" cy="40" r="22" fill="#111827"/><rect x="70" y="18" width="34" height="44" rx="6" fill="#fde047"/></svg>`;
const logoPngData = 'data:image/png;base64,' + new Resvg(logoSvg, { fitTo: { mode: 'width', value: 240 } }).render().asPng().toString('base64');
const logoSvgData = 'data:image/svg+xml;base64,' + Buffer.from(logoSvg).toString('base64');
const URL_VLONG = validateUrl('https://example.com/form?' + Array.from({ length: 40 }, (_, k) => `field${k}=value${k}`).join('&'));
if (URL_VLONG.status !== 'ok') throw new Error('URL rất dài không hợp lệ');

type LogoCase = { name: string; d: Design; url: string };
const logoCases: LogoCase[] = [];
for (const [urlName, url] of [['ngắn', URL_SHORT.encoded], ['dài', URL_LONG.encoded], [`rất dài ${URL_VLONG.encoded.length}`, URL_VLONG.encoded]] as const)
  for (const plate of ['none', 'rounded', 'circle'] as const)
    for (const size of [0.1, 0.2, 0.25, 0.3])
      for (const [dots, src] of [['square', logoPngData], ['dots', logoSvgData]] as const)
        logoCases.push({
          name: `[${urlName}] nền=${plate} cỡ=${Math.round(size * 100)}% hoạ tiết=${dots} ảnh=${src.startsWith('data:image/png') ? 'png' : 'svg'}`,
          url,
          d: { ...base, dots, eyeOuter: 'rounded', eyeInner: 'circle', logo: { src, width: 120, height: 80, size, plate } },
        });

console.log(`\n=== 3. Logo giữa QR → giải mã lại (${logoCases.length} tổ hợp; có logo thì mức sửa lỗi H) ===`);
let lOk = 0, lSmall = 0;
const lFails: string[] = [];
for (const [i, c] of logoCases.entries()) {
  const { svg } = renderSvg(c.d, c.url);
  const big = await zxing(svg, 640);
  const small = await zxing(svg, 260);
  if (big === c.url) lOk++; else lFails.push(c.name);
  if (small === c.url) lSmall++;
  const warns = scanWarnings(c.d, { status: 'ok', encoded: c.url, autoPrefixed: false, dense: c.url.length >= 300, host: '' }).map((w) => w.id);
  console.log(`  ${String(i + 1).padStart(3)}. ${c.name.padEnd(62)} | ${mark(big, c.url).padEnd(9)} | ${mark(small, c.url).padEnd(9)} | ${warns.join(',')}`);
  if (savePng && i % 6 === 0) writeFileSync(new URL(`./out/logo-${String(i + 1).padStart(3, '0')}.png`, import.meta.url), pngOf(svg));
}
console.log(`\n  ZXing@640: đúng ${lOk}/${logoCases.length} · ZXing@260: đúng ${lSmall}/${logoCases.length}`);
if (lFails.length) console.log('  ZXing@640 không đọc được: ' + lFails.join(' | '));

// ---------- 4. KT-13: vùng logo không bao giờ chạm 3 mắt QR / vạch định thời ----------
{
  const { logoGeometry } = await import('../src/logo');
  const { buildMatrix, isEyeModule } = await import('../src/qr');
  let checked = 0, touched = 0, shrunk = 0, minN = Infinity;
  for (let len = 1; len <= 1000; len += 7) {
    const url = 'https://a.vn/' + 'x'.repeat(len);
    const n = buildMatrix(url, 'H').size;
    minN = Math.min(minN, n);
    for (const plate of ['none', 'rounded', 'circle'] as const)
      for (const [w, h] of [[1, 1], [3, 1], [1, 3]]) {
        const g = logoGeometry(n, { src: '', width: w, height: h, size: 0.3, plate });
        checked++;
        if (g.size < 0.3 - 1e-9) shrunk++;
        for (let r = 0; r < n; r++)
          for (let c = 0; c < n; c++)
            if (g.skip(r, c) && (isEyeModule(n, r, c) || r === 6 || c === 6)) touched++;
        const { x, y, w: iw, h: ih } = g.image;
        if (x < 8 || y < 8 || x + iw > n - 8 || y + ih > n - 8) touched++;
      }
  }
  console.log(`\n=== 4. KT-13: ${checked} tổ hợp (độ dài link 14–1013 ký tự × 3 kiểu nền × 3 tỉ lệ ảnh, cỡ 30%) ===`);
  console.log(`  QR nhỏ nhất có logo: ${minN}×${minN} ô · số lần vùng logo chạm mắt/vạch định thời: ${touched} · số lần logo tự thu nhỏ: ${shrunk}`);
}
