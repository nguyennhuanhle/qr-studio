// Kiểm tra + chuẩn hoá URL người tạo nhập (UC-01, UC-02, KT-01, LO-01→04).

export const MAX_URL = 1000; // LO-04: trên mức này từ chối
export const WARN_URL = 300; // LO-04: từ mức này cảnh báo QR dày

export type UrlResult =
  | { status: 'empty' }
  | { status: 'invalid' }
  | { status: 'scheme'; scheme: string }
  | { status: 'too-long'; length: number }
  | {
      status: 'ok';
      /** Chuỗi được mã hoá vào QR — chỉ gồm ký tự ASCII để mọi máy quét đọc giống nhau. */
      encoded: string;
      autoPrefixed: boolean;
      dense: boolean;
      host: string;
    };

const SCHEME_RE = /^([a-z][a-z0-9+.-]*):/i;

export function validateUrl(raw: string): UrlResult {
  const input = raw.trim();
  if (input === '') return { status: 'empty' };
  if (input.length > MAX_URL) return { status: 'too-long', length: input.length };
  if (/\s/.test(input)) return { status: 'invalid' };

  let candidate = input;
  let autoPrefixed = false;
  const m = SCHEME_RE.exec(input);
  // "localhost:3000" hay "ten-mien.vn:8080" trông giống scheme nhưng thật ra là host:port.
  const looksLikeHostPort = m && (m[1].includes('.') || /^\d/.test(input.slice(m[0].length)));
  if (m && !looksLikeHostPort) {
    const scheme = m[1].toLowerCase();
    if (scheme !== 'http' && scheme !== 'https') return { status: 'scheme', scheme }; // KT-01
  } else {
    candidate = 'https://' + input; // UC-02
    autoPrefixed = true;
  }

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return { status: 'invalid' };
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { status: 'scheme', scheme: url.protocol.slice(0, -1) };
  if (!isPlausibleHost(url.hostname)) return { status: 'invalid' };

  // URL.href chuyển tên miền tiếng Việt sang punycode và %-encode đường dẫn,
  // nên QR chỉ chứa ASCII. Bỏ dấu "/" mà URL tự thêm nếu người dùng không gõ.
  let encoded = url.href;
  if (url.pathname === '/' && !url.search && !url.hash && !/\/$/.test(input)) encoded = encoded.slice(0, -1);
  if (encoded.length > MAX_URL) return { status: 'too-long', length: encoded.length };

  return { status: 'ok', encoded, autoPrefixed, dense: encoded.length >= WARN_URL, host: url.hostname };
}

function isPlausibleHost(host: string): boolean {
  if (host === 'localhost') return true;
  if (/^\[[0-9a-f:]+\]$/i.test(host)) return true; // IPv6
  if (!host.includes('.')) return false; // "abc"
  const labels = host.split('.');
  return labels.every((l) => l.length > 0) && /^[a-z0-9-]+$/i.test(labels[labels.length - 1]);
}
