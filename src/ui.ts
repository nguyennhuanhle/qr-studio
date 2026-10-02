// Bảng điều khiển ↔ state ↔ xem trước.
import {
  CAPTION_MAX, CAPTION_SIZE, DEFAULT_LABEL, defaultDesign, FONT_FAMILIES, fontStack, FRAME_THICKNESS, LOGO_SIZE, PNG_SIZES, sanitizeCaption,
  type Design, type DotStyle, type EyeInnerStyle, type EyeOuterStyle, type FillMode, type FontKey, type FrameType, type LogoPlate, type PngSize,
} from './design';
import { scanWarnings } from './checks';
import { copyPng, download, ExportError, fileBase, pngBlob, svgBlob } from './export';
import { browserMeasure, ensureFontLoaded } from './fonts';
import { applyStatic, getLang, LANGS, setLang, t, type Key } from './i18n';
import { readLogoFile } from './logo';
import { renderSvg } from './render';
import { dotsPath, eyeInnerPath, eyeOuterPath } from './shapes';
import { validateUrl, type UrlResult } from './url';

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const HEX = /^#[0-9a-f]{6}$/i;

let design: Design = defaultDesign();
let urlState: UrlResult = { status: 'empty' };
const syncers: Array<() => void> = [];

// ---------- vẽ lại ----------
let frame = 0;
function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(update);
}

function update() {
  for (const s of syncers) s();
  const u = urlState;
  const ok = u.status === 'ok';
  const preview = $('preview');
  $('stage').classList.toggle('is-empty', !ok);
  $('empty-text').textContent = t(u.status === 'empty' ? 'empty.start' : 'empty.invalid');
  renderUrlMessage(u);
  $('stage').classList.toggle('is-transparent', ok && design.bg.transparent);
  if (u.status === 'ok') {
    preview.innerHTML = renderSvg(design, u.encoded, { idPrefix: 'pv', measure: browserMeasure }).svg;
    $('encoded').innerHTML = `${t('encoded')} <code></code>`;
    $('encoded').querySelector('code')!.textContent = u.encoded;
  } else {
    preview.innerHTML = ''; // LO-02: không giữ QR cũ
    $('encoded').textContent = '';
  }
  // KT-02
  for (const id of ['dl-png', 'dl-svg', 'copy']) ($(id) as HTMLButtonElement).disabled = !ok;

  const warnings = ok ? scanWarnings(design, u) : [];
  $('warnings').innerHTML = '';
  for (const w of warnings) {
    const li = document.createElement('li');
    li.className = `warning warning-${w.level}`;
    li.textContent = t(`warn.${w.id}`, w.params);
    $('warnings').append(li);
  }
}

// ---------- URL ----------
function initUrl() {
  const input = $<HTMLInputElement>('url');
  input.addEventListener('input', () => {
    urlState = validateUrl(input.value);
    input.classList.toggle('is-invalid', ['invalid', 'scheme', 'too-long'].includes(urlState.status));
    schedule();
  });
}

function renderUrlMessage(u: UrlResult) {
  const msg = $('url-msg');
  msg.className = 'field-msg';
  switch (u.status) {
    case 'empty':
      msg.textContent = '';
      break;
    case 'invalid':
    case 'scheme':
      msg.textContent = t(u.status === 'invalid' ? 'url.invalid' : 'url.scheme');
      msg.classList.add('is-error');
      break;
    case 'too-long':
      msg.textContent = t('url.tooLong', { n: u.length });
      msg.classList.add('is-error');
      break;
    case 'ok':
      msg.textContent = u.autoPrefixed ? t('url.prefixed') : '';
      msg.classList.toggle('is-note', u.autoPrefixed);
      break;
  }
}

// ---------- các control dùng chung ----------
function tiles<T extends string>(el: HTMLElement, options: Array<{ value: T; key: Key; svg: string }>, get: () => T, set: (v: T) => void) {
  const buttons = options.map((o) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tile';
    b.setAttribute('role', 'radio');
    b.innerHTML = `${o.svg}<span></span>`;
    b.addEventListener('click', () => {
      set(o.value);
      schedule();
    });
    el.append(b);
    return b;
  });
  syncers.push(() =>
    buttons.forEach((b, i) => {
      const label = t(options[i].key);
      b.title = label;
      b.querySelector('span')!.textContent = label;
      b.setAttribute('aria-checked', String(options[i].value === get()));
    }),
  );
}

function segmented<T extends string | boolean>(el: HTMLElement, options: Array<{ value: T; label: () => string; font?: string }>, get: () => T, set: (v: T) => void) {
  const buttons = options.map((o) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    if (o.font) b.style.fontFamily = o.font;
    b.addEventListener('click', () => {
      set(o.value);
      schedule();
    });
    el.append(b);
    return b;
  });
  syncers.push(() =>
    buttons.forEach((b, i) => {
      b.textContent = options[i].label();
      b.setAttribute('aria-checked', String(options[i].value === get()));
    }),
  );
}

function colorField(el: HTMLElement, labelKey: Key, get: () => string, set: (v: string) => void, isDisabled: () => boolean = () => false) {
  const id = el.id + '-input';
  el.classList.add('color-field');
  el.innerHTML = `<label for="${id}"></label><div class="color-pair"><input type="color" id="${id}" /><input type="text" maxlength="7" spellcheck="false" /></div>`;
  const labelEl = el.querySelector('label')!;
  const [picker, text] = Array.from(el.querySelectorAll('input'));
  picker.addEventListener('input', () => {
    set(picker.value);
    schedule();
  });
  text.addEventListener('input', () => {
    let v = text.value.trim();
    if (!v.startsWith('#')) v = '#' + v;
    if (/^#[0-9a-f]{3}$/i.test(v)) v = '#' + [...v.slice(1)].map((c) => c + c).join('');
    if (HEX.test(v)) {
      set(v.toLowerCase());
      schedule();
    }
  });
  text.addEventListener('blur', () => (text.value = get()));
  syncers.push(() => {
    const label = t(labelKey);
    labelEl.textContent = label;
    text.setAttribute('aria-label', t('color.hex', { label }));
    const v = get();
    if (picker.value !== v) picker.value = v;
    if (document.activeElement !== text) text.value = v;
    const dis = isDisabled();
    picker.disabled = dis;
    text.disabled = dis;
    el.classList.toggle('is-disabled', dis);
  });
}

function slider(id: string, range: { min: number; max: number }, get: () => number, set: (v: number) => void, fmt: (v: number) => string) {
  const input = $<HTMLInputElement>(id);
  const out = $(id + '-out');
  input.min = String(range.min);
  input.max = String(range.max);
  input.addEventListener('input', () => {
    set(Number(input.value));
    schedule();
  });
  syncers.push(() => {
    if (Number(input.value) !== get()) input.value = String(get());
    out.textContent = fmt(get());
  });
}

// ---------- hình mẫu cho các ô chọn ----------
// Ma trận giả 5×5 đặt giữa vùng 21×21 (ngoài vùng mắt) để vẽ mẫu hoạ tiết.
const SAMPLE = ['11011', '10110', '01111', '11001', '10111'];
const sampleMatrix = {
  size: 21,
  isDark: (r: number, c: number) => r >= 8 && r < 13 && c >= 8 && c < 13 && SAMPLE[r - 8][c - 8] === '1',
};
const icon = (vb: string, body: string) => `<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;
const dotIcon = (s: DotStyle) => icon('7.6 7.6 5.8 5.8', `<path d="${dotsPath(sampleMatrix, s)}"/>`);
const outerIcon = (s: EyeOuterStyle) => icon('-0.6 -0.6 8.2 8.2', `<path fill-rule="evenodd" d="${eyeOuterPath(0, 0, s, 'tl')}"/><path class="dim" d="${eyeInnerPath(0, 0, 'square')}"/>`);
const innerIcon = (s: EyeInnerStyle) => icon('-0.6 -0.6 8.2 8.2', `<path class="dim" fill-rule="evenodd" d="${eyeOuterPath(0, 0, 'square', 'tl')}"/><path d="${eyeInnerPath(0, 0, s)}"/>`);

function frameIcon(t: FrameType): string {
  const qr = `<rect class="dim" x="13" y="11" width="22" height="22" rx="2"/>`;
  switch (t) {
    case 'none':
      return icon('0 0 48 48', `<rect class="dim" x="13" y="13" width="22" height="22" rx="2"/>`);
    case 'square':
      return icon('0 0 48 48', `<path fill-rule="evenodd" d="M9 7h30v34H9zM12 10v28h24V10z"/>${qr}`);
    case 'rounded':
      return icon('0 0 48 48', `<path fill-rule="evenodd" d="M15 7h18a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6V13a6 6 0 0 1 6-6zM15 10a3 3 0 0 0-3 3v22a3 3 0 0 0 3 3h18a3 3 0 0 0 3-3V13a3 3 0 0 0-3-3z"/>${qr}`);
    case 'banner':
      return icon('0 0 48 48', `<path fill-rule="evenodd" d="M13 5h22a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H13a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4zM12 8v26h24V8z"/><rect class="knock" x="17" y="37" width="14" height="2" rx="1"/><rect class="dim" x="14" y="10" width="20" height="20" rx="2"/>`);
    case 'bubble':
      return icon('0 0 48 48', `<path fill-rule="evenodd" d="M15 3h18a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6h-6l-3 4-3-4h-6a6 6 0 0 1-6-6V9a6 6 0 0 1 6-6zM12 7v24h24V7z"/><rect class="knock" x="18" y="34" width="12" height="2" rx="1"/><rect class="dim" x="14" y="9" width="20" height="20" rx="2"/>`);
  }
}

// ---------- logo (UC-24→26, LO-15→17) ----------
function initLogo() {
  const file = $<HTMLInputElement>('logo-file');
  const msg = $('logo-msg');
  file.addEventListener('change', async () => {
    const f = file.files?.[0];
    file.value = ''; // để chọn lại đúng file đó vẫn kích hoạt sự kiện
    if (!f) return;
    const res = await readLogoFile(f);
    if (!res.ok) {
      msg.textContent = t(`logo.error.${res.error}`); // giữ nguyên logo cũ
      msg.className = 'field-msg is-error';
      return;
    }
    msg.textContent = '';
    design.logo = {
      src: res.src,
      width: res.width,
      height: res.height,
      size: design.logo?.size ?? LOGO_SIZE.default,
      plate: design.logo?.plate ?? 'none',
    };
    schedule();
  });
  $('logo-remove').addEventListener('click', () => {
    design.logo = null;
    msg.textContent = '';
    schedule();
  });
  slider(
    'logo-size',
    { min: Math.round(LOGO_SIZE.min * 100), max: Math.round(LOGO_SIZE.max * 100) },
    () => Math.round((design.logo?.size ?? LOGO_SIZE.default) * 100),
    (v) => {
      if (design.logo) design.logo.size = v / 100;
    },
    (v) => `${v}%`,
  );
  const plates: LogoPlate[] = ['none', 'rounded', 'circle'];
  segmented(
    $('logo-plate'),
    plates.map((value) => ({ value, label: () => t(`logo.plate.${value}`) })),
    () => design.logo?.plate ?? 'none',
    (v) => {
      if (design.logo) design.logo.plate = v;
    },
  );
  let shown = '';
  syncers.push(() => {
    document.body.classList.toggle('has-logo', design.logo !== null);
    $('logo-choose').textContent = t(design.logo ? 'logo.replace' : 'logo.choose');
    const src = design.logo?.src ?? '';
    if (src !== shown) {
      const thumb = $('logo-thumb');
      thumb.innerHTML = '';
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        thumb.append(img);
      }
      shown = src;
    }
  });
}

// ---------- khởi tạo ----------
export function initUi() {
  initUrl();

  // UC-20: đổi ngôn ngữ chỉ dịch lại giao diện, không đụng state thiết kế (KT-09).
  segmented($('lang'), LANGS.map((l) => ({ value: l, label: () => l.toUpperCase() })), getLang, (v) => {
    setLang(v);
    applyStatic();
  });

  const dots: DotStyle[] = ['square', 'dots', 'rounded', 'connected', 'classy', 'diamond', 'vlines', 'hlines'];
  tiles($('dots'), dots.map((value) => ({ value, key: `shape.${value}` as Key, svg: dotIcon(value) })), () => design.dots, (v) => (design.dots = v));

  const outers: EyeOuterStyle[] = ['square', 'rounded', 'circle', 'leaf'];
  tiles($('eye-outer'), outers.map((value) => ({ value, key: `shape.${value}` as Key, svg: outerIcon(value) })), () => design.eyeOuter, (v) => (design.eyeOuter = v));

  const inners: EyeInnerStyle[] = ['square', 'circle', 'rounded', 'diamond'];
  tiles($('eye-inner'), inners.map((value) => ({ value, key: `shape.${value}` as Key, svg: innerIcon(value) })), () => design.eyeInner, (v) => (design.eyeInner = v));

  // Màu
  const modes: FillMode[] = ['solid', 'linear', 'radial'];
  segmented($('fill-mode'), modes.map((value) => ({ value, label: () => t(`fill.${value}`) })), () => design.fg.mode, (v) => (design.fg.mode = v));
  colorField($('fg-c1'), 'color.fg', () => design.fg.c1, (v) => (design.fg.c1 = v));
  colorField($('fg-c2'), 'color.fg2', () => design.fg.c2, (v) => (design.fg.c2 = v));
  slider('angle', { min: 0, max: 360 }, () => design.fg.angle, (v) => (design.fg.angle = v), (v) => `${v}°`);
  colorField($('bg-color'), 'color.bg', () => design.bg.color, (v) => (design.bg.color = v), () => design.bg.transparent);
  const transparent = $<HTMLInputElement>('bg-transparent');
  transparent.addEventListener('change', () => {
    design.bg.transparent = transparent.checked;
    schedule();
  });
  const eyeCustom = $<HTMLInputElement>('eye-custom');
  eyeCustom.addEventListener('change', () => {
    design.eyeOuterColor = eyeCustom.checked ? design.fg.c1 : null;
    design.eyeInnerColor = eyeCustom.checked ? design.fg.c1 : null;
    schedule();
  });
  colorField($('eye-outer-color'), 'color.eyeOuter', () => design.eyeOuterColor ?? design.fg.c1, (v) => (design.eyeOuterColor = v));
  colorField($('eye-inner-color'), 'color.eyeInner', () => design.eyeInnerColor ?? design.fg.c1, (v) => (design.eyeInnerColor = v));

  initLogo();

  // Caption
  const caption = $<HTMLInputElement>('caption');
  caption.maxLength = CAPTION_MAX;
  // LO-08: ô một dòng tự xoá ký tự xuống dòng khi dán, nên tự chèn bản đã đổi xuống dòng → dấu cách.
  caption.addEventListener('paste', (e) => {
    const text = e.clipboardData?.getData('text/plain');
    if (!text || !/[\r\n]/.test(text)) return;
    e.preventDefault();
    const start = caption.selectionStart ?? caption.value.length;
    const end = caption.selectionEnd ?? start;
    const pasted = text.replace(/\s*[\r\n]+\s*/g, ' ');
    caption.value = sanitizeCaption(caption.value.slice(0, start) + pasted + caption.value.slice(end));
    const caret = Math.min(start + pasted.length, caption.value.length);
    caption.setSelectionRange(caret, caret);
    caption.dispatchEvent(new Event('input'));
  });
  caption.addEventListener('input', () => {
    const clean = sanitizeCaption(caption.value); // LO-08: xuống dòng → dấu cách, cắt 60
    if (clean !== caption.value) caption.value = clean;
    design.caption.text = clean;
    schedule();
  });
  segmented(
    $('caption-pos'),
    [{ value: 'bottom', label: () => t('caption.below') }, { value: 'top', label: () => t('caption.above') }],
    () => design.caption.position,
    (v) => (design.caption.position = v),
  );
  segmented($('caption-bold'), [{ value: true, label: () => t('caption.bold') }, { value: false, label: () => t('caption.regular') }], () => design.caption.bold, (v) => {
    design.caption.bold = v;
    void ensureFontLoaded(design.caption.font, v).then(schedule);
  });
  segmented(
    $('caption-font'),
    (Object.keys(FONT_FAMILIES) as FontKey[]).map((k) => ({ value: k, label: () => FONT_FAMILIES[k].label, font: fontStack(k) })),
    () => design.caption.font,
    (v) => {
      design.caption.font = v;
      void ensureFontLoaded(v, design.caption.bold).then(schedule); // đo lại bề rộng chữ khi phông tải xong
    },
  );
  slider('caption-size', CAPTION_SIZE, () => design.caption.size, (v) => (design.caption.size = v), (v) => `${v}`);
  const inBand = () => design.frame.type === 'banner' || design.frame.type === 'bubble';
  colorField($('caption-color'), 'caption.color', () => design.caption.color, (v) => (design.caption.color = v), inBand);

  // Khung
  const frames: FrameType[] = ['none', 'square', 'rounded', 'banner', 'bubble'];
  tiles($('frame'), frames.map((value) => ({ value, key: `frame.${value}` as Key, svg: frameIcon(value) })), () => design.frame.type, (v) => (design.frame.type = v));
  colorField($('frame-color'), 'frame.color', () => design.frame.color, (v) => (design.frame.color = v));
  slider('frame-thickness', FRAME_THICKNESS, () => design.frame.thickness, (v) => (design.frame.thickness = v), (v) => `${v}`);

  // Xuất
  const sizeSel = $<HTMLSelectElement>('png-size');
  sizeSel.innerHTML = PNG_SIZES.map((s) => `<option value="${s}"></option>`).join('');
  sizeSel.addEventListener('change', () => {
    const v = Number(sizeSel.value) as PngSize;
    if (PNG_SIZES.includes(v)) design.pngSize = v; // KT-05
  });
  $('dl-png').addEventListener('click', () => runExport('png'));
  $('dl-svg').addEventListener('click', () => runExport('svg'));
  $('copy').addEventListener('click', () => runExport('copy'));

  $('reset').addEventListener('click', () => {
    design = defaultDesign(); // UC-17: giữ link, xoá tuỳ biến (UC-26: kể cả logo)
    caption.value = '';
    $('logo-msg').textContent = '';
    schedule();
    toast(t('reset.done'));
  });

  // Đồng bộ phần hiển thị phụ thuộc state
  syncers.push(() => {
    const root = document.body;
    root.classList.toggle('fill-gradient', design.fg.mode !== 'solid');
    root.classList.toggle('fill-linear', design.fg.mode === 'linear');
    root.classList.toggle('eye-custom', design.eyeOuterColor !== null);
    root.classList.toggle('has-frame', design.frame.type !== 'none');
    root.classList.toggle('caption-in-band', inBand());
    transparent.checked = design.bg.transparent;
    eyeCustom.checked = design.eyeOuterColor !== null;
    for (const o of Array.from(sizeSel.options)) o.textContent = t('export.sizeOption', { n: o.value });
    sizeSel.value = String(design.pngSize);
    const count = Array.from(design.caption.text).length;
    const counter = $('caption-count');
    counter.textContent = `${count}/${CAPTION_MAX}`;
    counter.classList.toggle('is-full', count >= CAPTION_MAX);
    caption.placeholder = inBand() ? t('caption.placeholderBand', { label: DEFAULT_LABEL }) : t('caption.placeholder');
  });

  $('year').textContent = String(new Date().getFullYear()); // UC-23: năm tự cập nhật
  applyStatic();
  void document.fonts.ready.then(schedule);
  update();
}

let busy = false;
async function runExport(kind: 'png' | 'svg' | 'copy') {
  if (urlState.status !== 'ok' || busy) return; // KT-02
  busy = true;
  document.body.classList.add('is-busy');
  const { encoded, host } = urlState;
  const name = fileBase(host);
  try {
    await ensureFontLoaded(design.caption.font, design.caption.bold);
    if (kind === 'svg') {
      download(await svgBlob(design, encoded), `${name}.svg`);
    } else if (kind === 'png') {
      download(await pngBlob(design, encoded, design.pngSize), `${name}.png`);
    } else {
      await copyPng(design, encoded, design.pngSize);
      toast(t('export.copied'));
    }
  } catch (e) {
    toast(e instanceof ExportError ? t(`export.error.${e.code}`, { n: e.size ?? '' }) : t('export.error.generic'), true);
  } finally {
    busy = false;
    document.body.classList.remove('is-busy');
  }
}

let toastTimer = 0;
function toast(text: string, error = false) {
  const el = $('toast');
  el.textContent = text;
  el.classList.toggle('is-error', error);
  el.classList.add('is-show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-show'), error ? 5000 : 2600);
}

