# Plan — QR Studio (Phase 2.1)

> Dựa trên `use-cases.md` v0.1. Chưa code — chờ duyệt.

## Stack

- **Vite + TypeScript thuần** (không framework): app 1 trang, tĩnh, deploy được lên bất kỳ static host nào (Vercel/Netlify/GitHub Pages).
- **`qrcode-generator`** chỉ để lấy ma trận ô QR (mức sửa lỗi Q). Phần vẽ hoạ tiết, mắt, gradient, khung, caption **tự viết bằng SVG** để kiểm soát hoàn toàn (thư viện kiểu `qr-code-styling` không có frame/caption và khó ghép).
- PNG = rasterize chính SVG đó qua `<canvas>` → một nguồn duy nhất, PNG và SVG luôn giống nhau.
- Kiểm thử thật: `jsQR` + `@resvg/resvg-js` (dev) — render SVG ra PNG rồi **giải mã lại**, in URL đọc được ra màn hình.

## 1. Data model (state trong bộ nhớ, không lưu)

```ts
Design {
  url: string                       // đã chuẩn hoá
  dots:   'square'|'dots'|'rounded'|'connected'|'classy'|'diamond'|'vlines'|'hlines'
  eyeOuter: 'square'|'rounded'|'circle'|'leaf'
  eyeInner: 'square'|'circle'|'rounded'|'diamond'
  fg: { mode:'solid'|'linear'|'radial', c1, c2, angle }
  bg: { color, transparent: boolean }
  eyeOuterColor, eyeInnerColor: string | null   // null = theo fg
  caption: { text(≤60), position:'top'|'bottom', font:'sans'|'serif'|'mono'|'rounded', size, bold, color }
  frame: { type:'none'|'square'|'rounded'|'banner'|'bubble', color, thickness }
  export: { pngSize: 512|1024|2048|4096 }
}
```

## 2. Permissions

Chỉ 1 role tương tác (Người tạo), không đăng nhập. "Quyền" ở đây = các ràng buộc KT bên dưới.

## 3. Routes / màn hình

- `/` duy nhất: cột trái = bảng tuỳ biến (URL · Hoạ tiết · Màu · Caption · Khung · Xuất), cột phải = xem trước dính (sticky) + cảnh báo + nút tải. Mobile: xem trước lên trên.

## 4. Mỗi CANNOT → 1 rule trong code

| KT | Rule | Nằm ở |
|---|---|---|
| KT-01 | `validateUrl()` dùng `new URL()`, chỉ chấp nhận protocol `http:`/`https:` | `src/url.ts` |
| KT-02 | Nút Tải PNG/SVG/Copy `disabled` khi `state.valid === false` | `src/ui.ts` |
| KT-03 | `MARGIN = 4` ô cố định (không có ô chỉnh), khung/caption vẽ ngoài vùng này | `src/render.ts` |
| KT-04 | `<input maxlength=60>` + `sanitizeCaption()` bỏ `\n` | `src/ui.ts`, `src/caption.ts` |
| KT-05 | Kích thước PNG là `<select>` 4 giá trị; hàm export ép về whitelist | `src/export.ts` |
| KT-06 | Không có `fetch`/network nào; CSP `connect-src 'none'` trong `index.html` | `index.html` |
| KT-07 | Chuỗi mã hoá = đúng `url` đã chuẩn hoá, không thêm param | `src/render.ts` |
| KT-08 | Bố cục: QR+quiet zone là hộp riêng, khung/caption chỉ được đặt bên ngoài hộp đó | `src/layout.ts` |

## 5. Mỗi ERROR → 1 handler

| LO | Handler |
|---|---|
| LO-01 | `url === ''` → placeholder "Dán link vào để bắt đầu" |
| LO-02 | `validateUrl` trả `{ok:false, reason:'invalid'}` → lỗi inline, xoá preview |
| LO-03 | `reason:'scheme'` → "Chỉ hỗ trợ link http/https" |
| LO-04 | `>1000` → từ chối; `300–1000` → cảnh báo vàng |
| LO-05 | `contrastRatio()` (WCAG) giữa nền và *mọi* màu tiền cảnh (c1, c2, màu mắt) < 4 → cảnh báo |
| LO-06 | độ sáng tiền cảnh > nền → cảnh báo đảo màu |
| LO-07 | `bg.transparent` → nền caro trong preview + ghi chú |
| LO-08 | bộ đếm ký tự, đỏ khi 60/60; `paste` → thay `\n` bằng dấu cách |
| LO-09 | frame ∈ {banner, bubble} & caption rỗng → dùng "SCAN ME" |
| LO-10 | `navigator.clipboard.write` không có / bị từ chối → toast hướng dẫn |
| LO-11 | `try/catch` quanh `canvas.toBlob`; blob null → toast "thử kích thước nhỏ hơn" |
| LO-12 | = LO-05/LO-06 |
| LO-13 | `errorCorrectionLevel = 'Q'` cố định |

## 6. Cấu trúc file

```
src/
  url.ts       validate + chuẩn hoá URL
  qr.ts        ma trận QR (qrcode-generator)
  shapes.ts    path SVG cho từng kiểu hoạ tiết / mắt
  layout.ts    tính kích thước khung + caption quanh QR
  render.ts    Design → chuỗi SVG hoàn chỉnh
  checks.ts    tương phản, đảo màu, độ dài
  export.ts    SVG/PNG/clipboard, tên file
  ui.ts        bảng điều khiển ↔ state
  main.ts
scripts/verify.mjs   render nhiều tổ hợp → PNG → jsQR giải mã → in kết quả
```

## 7. Thứ tự build (theo nhóm)

- **Vòng 1 — Lõi QR:** URL (UC-01/02, KT-01/02/06/07, LO-01→04) + render ô vuông cơ bản + tải SVG/PNG (UC-13/14/16). → chạy `verify.mjs`.
- **Vòng 2 — Hoạ tiết & màu:** UC-03→08, LO-05→07, LO-13.  → verify lại toàn bộ tổ hợp hoạ tiết.
- **Vòng 3 — Caption & khung:** UC-09→12, KT-03/04/08, LO-08/09.
- **Vòng 4 — Hoàn thiện xuất:** UC-15/17, KT-05, LO-10/11 + kiểm UC-18 bằng quét thật.

Sau mỗi vòng: tự đối chiếu UC nào xong / chưa.

## Không có trong plan mà ngoài use case?

- CSP trong `index.html` — phục vụ KT-06, không phải tính năng mới.
- `scripts/verify.mjs` — công cụ kiểm thử, không phải tính năng.
