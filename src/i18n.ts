// Ngôn ngữ giao diện (UC-20→22, LO-14). Chỉ dịch giao diện — không đụng tới link, thiết kế, caption (KT-09/10).

export type Lang = 'en' | 'vi';
export const LANGS: readonly Lang[] = ['en', 'vi'];
export const DEFAULT_LANG: Lang = 'en'; // UC-21

const en = {
  'app.title': 'QR Studio — QR codes for your links',
  'brand.tagline': 'Make QR codes for links — custom patterns, colors, captions and frames',
  'privacy': 'Runs entirely in your browser — your link never leaves your device',
  'lang.aria': 'Interface language',
  'controls.aria': 'Customize',
  'preview.aria': 'Preview and download',

  'section.link': 'Link',
  'url.label': 'Link to turn into a QR code',
  'url.placeholder': 'Paste a link, e.g. example.com/signup',
  'url.invalid': "This isn't a valid link yet.",
  'url.scheme': 'Only http/https links are supported.',
  'url.tooLong': 'Link is too long ({n} characters) — the QR would be too dense to scan. Shorten it first.',
  'url.prefixed': 'Added https:// to the start of the link.',

  'section.pattern': 'Pattern',
  'dots.label': 'Data modules',
  'dots.aria': 'Module style',
  'eyeOuter.label': 'Corner square',
  'eyeOuter.aria': 'Corner square style',
  'eyeInner.label': 'Corner dot',
  'eyeInner.aria': 'Corner dot style',
  'shape.square': 'Square',
  'shape.dots': 'Dots',
  'shape.rounded': 'Rounded',
  'shape.connected': 'Connected',
  'shape.classy': 'Leaf',
  'shape.diamond': 'Diamond',
  'shape.vlines': 'Vertical',
  'shape.hlines': 'Horizontal',
  'shape.circle': 'Circle',
  'shape.leaf': 'Leaf',

  'section.colors': 'Colors',
  'fill.label': 'Pattern fill',
  'fill.aria': 'Fill type',
  'fill.solid': 'Solid',
  'fill.linear': 'Gradient',
  'fill.radial': 'Radial',
  'color.fg': 'Pattern color',
  'color.fg2': 'Second color',
  'color.angle': 'Gradient angle',
  'color.bg': 'Background',
  'color.transparent': 'Transparent background',
  'color.eyeCustom': 'Custom corner colors',
  'color.eyeOuter': 'Corner square',
  'color.eyeInner': 'Corner dot',
  'color.hex': '{label} (hex code)',

  'section.caption': 'Caption',
  'caption.label': 'Caption',
  'caption.placeholder': 'e.g. Scan to sign up',
  'caption.placeholderBand': 'Leave empty to show "{label}"',
  'caption.position': 'Position',
  'caption.position.aria': 'Caption position',
  'caption.below': 'Below QR',
  'caption.above': 'Above QR',
  'caption.weight': 'Weight',
  'caption.weight.aria': 'Font weight',
  'caption.bold': 'Bold',
  'caption.regular': 'Regular',
  'caption.font': 'Font',
  'caption.font.aria': 'Font family',
  'caption.size': 'Font size',
  'caption.color': 'Text color',
  'caption.colorNote': 'Inside a labeled frame, the text switches to black or white automatically so it stays readable.',

  'section.frame': 'Frame',
  'frame.aria': 'Frame style',
  'frame.none': 'None',
  'frame.square': 'Square',
  'frame.rounded': 'Rounded',
  'frame.banner': 'Label',
  'frame.bubble': 'Bubble',
  'frame.color': 'Frame color',
  'frame.thickness': 'Border width',

  'reset': 'Reset design',
  'reset.done': 'Design reset to defaults.',

  'empty.start': 'Paste a link to get started',
  'empty.invalid': 'No valid link yet',
  'encoded': 'Encoded:',

  'export.size': 'PNG size',
  'export.sizeOption': '{n} px wide',
  'export.png': 'Download PNG',
  'export.svg': 'Download SVG',
  'export.copy': 'Copy image',
  'export.copied': 'Image copied — paste it (Ctrl+V) wherever you need it.',
  'export.error.generic': 'Something went wrong while exporting. Please try again.',
  'export.error.size': 'Invalid image size.',
  'export.error.canvas': "Your browser couldn't create the image.",
  'export.error.memory': "Couldn't create a {n}px image — try a smaller size.",
  'export.error.clipboard': "Your browser won't let the app copy images — use Download PNG instead.",

  'warn.dense': 'Long link means a dense QR — print it at least 4 cm (1.6 in) wide.',
  'warn.transparent': 'Transparent background: place the QR on a background that contrasts with the pattern color.',
  'warn.contrast': 'Colors are too similar (contrast {ratio}:1, aim for at least {min}:1) — it may not scan.',
  'warn.inverted': 'Pattern is lighter than the background (inverted QR) — many scanners can’t read it.',
};

export type Key = keyof typeof en;

const vi: Record<Key, string> = {
  'app.title': 'QR Studio — Tạo mã QR cho link',
  'brand.tagline': 'Tạo mã QR cho link — tuỳ biến hoạ tiết, màu, chữ và khung',
  'privacy': 'Chạy hoàn toàn trên trình duyệt — link của bạn không rời khỏi máy',
  'lang.aria': 'Ngôn ngữ giao diện',
  'controls.aria': 'Tuỳ biến',
  'preview.aria': 'Xem trước và tải về',

  'section.link': 'Link',
  'url.label': 'Link cần tạo QR',
  'url.placeholder': 'Dán link vào đây, ví dụ edtechcorner.vn/khoa-hoc',
  'url.invalid': 'Đây chưa phải link hợp lệ.',
  'url.scheme': 'Chỉ hỗ trợ link http/https.',
  'url.tooLong': 'Link quá dài ({n} ký tự), QR sẽ quá dày để quét — hãy rút gọn link trước.',
  'url.prefixed': 'Đã tự thêm https:// vào đầu link.',

  'section.pattern': 'Hoạ tiết',
  'dots.label': 'Ô dữ liệu',
  'dots.aria': 'Kiểu hoạ tiết',
  'eyeOuter.label': 'Khung mắt',
  'eyeOuter.aria': 'Kiểu khung mắt',
  'eyeInner.label': 'Tròng mắt',
  'eyeInner.aria': 'Kiểu tròng mắt',
  'shape.square': 'Vuông',
  'shape.dots': 'Chấm tròn',
  'shape.rounded': 'Bo góc',
  'shape.connected': 'Liền khối',
  'shape.classy': 'Lá',
  'shape.diamond': 'Kim cương',
  'shape.vlines': 'Sọc dọc',
  'shape.hlines': 'Sọc ngang',
  'shape.circle': 'Tròn',
  'shape.leaf': 'Lá',

  'section.colors': 'Màu sắc',
  'fill.label': 'Kiểu tô hoạ tiết',
  'fill.aria': 'Kiểu tô',
  'fill.solid': 'Một màu',
  'fill.linear': 'Chuyển sắc',
  'fill.radial': 'Toả tròn',
  'color.fg': 'Màu hoạ tiết',
  'color.fg2': 'Màu thứ hai',
  'color.angle': 'Góc chuyển sắc',
  'color.bg': 'Màu nền',
  'color.transparent': 'Nền trong suốt',
  'color.eyeCustom': 'Mắt QR màu riêng',
  'color.eyeOuter': 'Khung mắt',
  'color.eyeInner': 'Tròng mắt',
  'color.hex': '{label} (mã hex)',

  'section.caption': 'Chữ (caption)',
  'caption.label': 'Caption',
  'caption.placeholder': 'Ví dụ: Quét để đăng ký',
  'caption.placeholderBand': 'Để trống sẽ hiện "{label}"',
  'caption.position': 'Vị trí',
  'caption.position.aria': 'Vị trí caption',
  'caption.below': 'Dưới QR',
  'caption.above': 'Trên QR',
  'caption.weight': 'Kiểu chữ',
  'caption.weight.aria': 'Độ đậm',
  'caption.bold': 'Đậm',
  'caption.regular': 'Thường',
  'caption.font': 'Phông',
  'caption.font.aria': 'Phông chữ',
  'caption.size': 'Cỡ chữ',
  'caption.color': 'Màu chữ',
  'caption.colorNote': 'Trong khung có dải nhãn, màu chữ tự chọn đen/trắng cho dễ đọc.',

  'section.frame': 'Khung',
  'frame.aria': 'Kiểu khung',
  'frame.none': 'Không',
  'frame.square': 'Vuông',
  'frame.rounded': 'Bo góc',
  'frame.banner': 'Nhãn đáy',
  'frame.bubble': 'Bong bóng',
  'frame.color': 'Màu khung',
  'frame.thickness': 'Độ dày viền',

  'reset': 'Về mặc định',
  'reset.done': 'Đã đưa thiết kế về mặc định.',

  'empty.start': 'Dán link vào để bắt đầu',
  'empty.invalid': 'Chưa có link hợp lệ',
  'encoded': 'Mã hoá:',

  'export.size': 'Kích thước PNG',
  'export.sizeOption': 'Rộng {n} px',
  'export.png': 'Tải PNG',
  'export.svg': 'Tải SVG',
  'export.copy': 'Sao chép ảnh',
  'export.copied': 'Đã sao chép ảnh — dán (Ctrl+V) vào nơi bạn cần.',
  'export.error.generic': 'Có lỗi khi xuất file, hãy thử lại.',
  'export.error.size': 'Kích thước không hợp lệ.',
  'export.error.canvas': 'Trình duyệt không tạo được ảnh.',
  'export.error.memory': 'Không tạo được ảnh {n}px — hãy chọn kích thước nhỏ hơn.',
  'export.error.clipboard': 'Trình duyệt không cho sao chép ảnh — hãy dùng nút Tải PNG.',

  'warn.dense': 'Link dài nên QR dày — nên in QR rộng ít nhất 4 cm.',
  'warn.transparent': 'Nền trong suốt: nhớ đặt QR lên nền tương phản với màu hoạ tiết.',
  'warn.contrast': 'Màu quá giống nhau (tương phản {ratio}:1, nên ≥ {min}:1) — có thể không quét được.',
  'warn.inverted': 'Hoạ tiết sáng hơn nền (QR đảo màu) — nhiều máy quét không đọc được.',
};

const DICT: Record<Lang, Record<Key, string>> = { en, vi };
const STORAGE_KEY = 'qr-studio.lang';

function readStored(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'vi' || v === 'en' ? v : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG; // LO-14
  }
}

let current: Lang = readStored();

export const getLang = (): Lang => current;

/** UC-20 + UC-22. Lưu thất bại (LO-14) thì vẫn đổi trong phiên hiện tại. */
export function setLang(lang: Lang): void {
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* LO-14 */
  }
}

export function t(key: Key, params: Record<string, string | number> = {}): string {
  return DICT[current][key].replace(/\{(\w+)\}/g, (m, name) => (name in params ? String(params[name]) : m));
}

/** Gán chữ cho các phần tử tĩnh trong index.html qua data-i18n*. */
export function applyStatic(root: ParentNode = document): void {
  document.documentElement.lang = current;
  document.title = t('app.title');
  for (const el of root.querySelectorAll<HTMLElement>('[data-i18n]')) el.textContent = t(el.dataset.i18n as Key);
  for (const el of root.querySelectorAll<HTMLElement>('[data-i18n-placeholder]'))
    el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder as Key));
  for (const el of root.querySelectorAll<HTMLElement>('[data-i18n-aria]')) el.setAttribute('aria-label', t(el.dataset.i18nAria as Key));
}
