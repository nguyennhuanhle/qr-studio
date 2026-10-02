# Gap Analysis — 2026-10-02 (v1.3: giao diện tiếng Anh, footer tác giả, logo giữa QR)

Đối chiếu code hiện tại với `use-cases.md` v1.3.
Mục v1.0 bên dưới được chạy lại sau khi đổi sang i18n: `npm run verify` vẫn 91/91, các chuỗi lỗi/cảnh báo hiển thị đúng ở cả EN và VI. Chỉ ghi sự thật đã kiểm được.

**Bằng chứng đã chạy:**
- `npm run verify`: kiểm 18 đầu vào URL + render 91 tổ hợp → PNG → giải mã lại. ZXing đọc đúng **91/91** ở 640 px, **90/91** ở 260 px (ca hỏng: link dài + bo góc + mắt lá, ảnh rất nhỏ). jsQR (bộ đọc kén hơn, chỉ để tham khảo) đọc 56/91.
- `/scripts/e2e.html` (chạy trong trình duyệt): 80 ảnh PNG xuất qua đúng đường xuất của app (512 + 1024 px, có nhúng phông) → ZXing đọc đúng **80/80**.
- Kiểm giao diện thật trên Chrome (khung trình duyệt của Claude desktop): các ca lỗi URL, cảnh báo màu, caption, khung, reset, bố cục desktop 1280 px và mobile 375 px (không tràn ngang).

## Người tạo — Có thể

| Use Case | Status | Ghi chú |
|---|---|---|
| UC-01 Xem trước cập nhật ngay khi gõ | DONE | Vẽ lại theo `requestAnimationFrame` mỗi lần nhập |
| UC-02 Tự thêm `https://` + ghi chú | DONE | "Đã tự thêm https:// vào đầu link." |
| UC-03 8 kiểu hoạ tiết | DONE | Vuông, Chấm tròn, Bo góc, Liền khối, Lá, Kim cương, Sọc dọc, Sọc ngang |
| UC-04 Khung mắt ×4, tròng mắt ×4 | DONE | Bán kính mắt "Lá" đã giảm 3 → 2,4 ô sau khi ZXing đọc trượt 3 ca |
| UC-05 Màu hoạ tiết + màu nền | DONE | Ô màu + ô mã hex, đồng bộ hai chiều |
| UC-06 Chuyển sắc tuyến tính (có góc) / toả tròn | DONE | Thanh góc chỉ hiện khi chọn tuyến tính |
| UC-07 Màu mắt riêng (khung/tròng) | DONE | |
| UC-08 Nền trong suốt | DONE | |
| UC-09 Thêm caption | DONE | |
| UC-10 Vị trí / phông ×4 / cỡ / đậm / màu | DONE | Phông Be Vietnam Pro, Lora, JetBrains Mono, Nunito — đủ dấu tiếng Việt |
| UC-11 5 kiểu khung | DONE | Không, Vuông, Bo góc, Nhãn đáy, Bong bóng |
| UC-12 Màu khung, độ dày, chữ trong dải tự tương phản | DONE | Ô màu chữ bị khoá + có ghi chú khi khung có dải |
| UC-13 Tải PNG 512/1024/2048/4096 | DONE | Đã patch: nhãn cũ "1024 × 1024 px" sai khi có khung/caption (ảnh thật 1024×1218) → nay ghi "Rộng 1024 px". Tạo blob 1024 và 4096 đã kiểm; **nút Tải chưa được bấm thử** (tải file cần bạn cho phép) |
| UC-14 Tải SVG | DONE | SVG nhúng phông base64 (~50 KB) để mở ở máy khác vẫn đúng phông. Nút tải chưa bấm thử (như trên) |
| UC-15 Sao chép ảnh vào clipboard | PARTIAL | Code có, **chưa chạy thử thật** vì sẽ ghi đè clipboard của bạn |
| UC-16 Tên file theo tên miền | DONE | `fileBase('www.workshop.edtechcorner.com')` → `qr-workshop.edtechcorner.com` |
| UC-17 Về mặc định (giữ link) | DONE | |

## Người tạo — Ngôn ngữ giao diện (v1.1)

| Use Case | Status | Ghi chú |
|---|---|---|
| UC-20 Đổi English ↔ Tiếng Việt bằng nút EN/VI | DONE | Đổi xong không còn chữ tiếng Việt nào sót lại trong chế độ EN (đã quét toàn bộ chữ, placeholder, aria-label, title) |
| UC-21 Lần đầu mở là English | DONE | Xoá bộ nhớ rồi tải lại → `lang="en"`, nút EN được chọn |
| UC-22 Nhớ ngôn ngữ đã chọn | DONE | Chọn VI rồi tải lại trang → vẫn VI |

## Footer (v1.2)

| Use Case | Status | Ghi chú |
|---|---|---|
| UC-23 Footer "Developed by Mr Le Nguyen Nhu Anh © năm", link edtechcorner.com, năm tự cập nhật | DONE | EN: "Developed by Mr Le Nguyen Nhu Anh © 2026", VI: "Phát triển bởi …"; link mở tab mới (`rel=noopener`); giả lập đồng hồ năm 2031 → footer hiện 2031 |

## Logo (v1.3)

Bằng chứng: `npm run verify` phần 3 — 72 tổ hợp (link ngắn / dài / rất dài 644 ký tự × nền không/vuông bo/tròn × cỡ 10/20/25/30% × logo PNG/SVG khối màu đặc): ZXing đọc đúng **72/72** ở 640 px và **72/72** ở 260 px. `/scripts/e2e.html`: 24 PNG có logo xuất qua đường xuất thật của trình duyệt → đúng **24/24** (tổng trang 104/104). Đo điểm giữa PNG xuất ra: đúng màu logo (rgb(225,29,72) / rgb(37,99,235)), tức logo thật sự nằm trong file.

| Use Case | Status | Ghi chú |
|---|---|---|
| UC-24 Chọn ảnh logo PNG/JPG/SVG/WebP, hiện ngay giữa QR | DONE | Thử bằng ô chọn file thật với PNG (canvas) và SVG chỉ có viewBox; có ảnh thu nhỏ, nút đổi thành "Replace image…" |
| UC-25 Cỡ 10–30% (mặc định 20%) + nền không/vuông bo/tròn | DONE | Đổi ảnh khác vẫn giữ cỡ và kiểu nền đã chọn |
| UC-26 Bỏ logo; "Về mặc định" cũng bỏ | DONE | Bỏ logo → hết ảnh, hết 2 cảnh báo logo |
| UC-27 PNG/SVG xuất ra có logo, SVG tự chứa ảnh | DONE | SVG có `<image xlink:href="data:image/…">`; PNG đo đúng màu logo ở tâm. Nút tải vẫn chưa bấm thử (như UC-13/14) |

## Người quét

| Use Case | Status | Ghi chú |
|---|---|---|
| UC-18 Quét bằng camera điện thoại → đúng URL | PARTIAL | ZXing (lõi của nhiều app quét) đọc đúng 171/171 ảnh. **Chưa quét bằng điện thoại thật** (iOS Camera / Zalo / Google Lens) |
| UC-19 Đọc caption để biết QR dẫn đi đâu | DONE | |

## Anti-Use Cases (Không thể)

| Rule | Status | Ghi chú |
|---|---|---|
| KT-01 Chặn scheme khác http/https | ENFORCED | `validateUrl` — đã thử `javascript:`, `data:`, `mailto:`, `file:` |
| KT-02 Không tải/sao chép khi chưa có URL hợp lệ | ENFORCED | Nút bị `disabled` + `runExport` tự kiểm lại trạng thái |
| KT-03 Không bỏ được quiet zone | ENFORCED | `QUIET_ZONE = 4` cố định, không có ô chỉnh |
| KT-04 Caption ≤ 60 ký tự, một dòng | ENFORCED | `maxlength` + `sanitizeCaption`; dán 80+ ký tự → cắt còn 60 |
| KT-05 Chỉ 4 cỡ PNG | ENFORCED | `<select>` + `pngBlob` từ chối cỡ khác (thử 777 → "Kích thước không hợp lệ.") |
| KT-06 URL không bị gửi lên server | ENFORCED | Không có lời gọi mạng nào ra ngoài; CSP `connect-src 'self'` (app chỉ tải file phông của chính nó). CSP đã thực sự chặn thử một module WASM |
| KT-07 QR mã hoá trực tiếp URL gốc | ENFORCED | Không thêm tham số/rút gọn. Lưu ý: tên miền và đường dẫn tiếng Việt được chuẩn hoá (punycode, `%xx`) — cùng trang đích, chuỗi hiển thị khác chữ gõ; dòng "Mã hoá:" cho thấy chuỗi thật |
| KT-08 Khung/caption không che vùng QR | ENFORCED | Đo trên màn hình: 5 khung × 2 vị trí, chữ không chồng hộp QR + quiet zone |
| KT-09 Đổi ngôn ngữ không mất link/thiết kế/caption | ENFORCED | Ngôn ngữ nằm ngoài state thiết kế; thử thật: link, caption tiếng Việt, hoạ tiết, màu giữ nguyên, SVG xem trước giống hệt từng ký tự trước/sau khi đổi |
| KT-11 Ảnh logo không bị tải lên đâu | ENFORCED | Đọc bằng `FileReader` thành data URL; đo `performance` sau khi chọn ảnh: 0 request mạng mới; CSP `connect-src 'self'` |
| KT-12 Logo tối đa 30% | ENFORCED | Thanh trượt 10–30; `logoGeometry` kẹp lại về [10%, 30%] dù dữ liệu vào lớn hơn |
| KT-13 Logo không che mắt QR / quiet zone | ENFORCED | Luôn ở tâm, không kéo được; `verify` phần 4: 1.287 tổ hợp → 0 lần chạm mắt hoặc vạch định thời; QR nhỏ nhất (25×25) thì logo tự thu nhỏ |
| KT-14 Logo không được lưu | ENFORCED | Logo chỉ nằm trong state bộ nhớ; không có code ghi logo ra storage |
| KT-10 Ảnh xuất không đổi theo ngôn ngữ | ENFORCED | `render.ts` không dùng i18n; nhãn mặc định "SCAN ME" ra giống nhau ở EN và VI |

## Error Cases (Khi lỗi)

| Case | Status | Ghi chú |
|---|---|---|
| LO-01 URL trống → gợi ý, nút tải khoá | DONE | |
| LO-02 Không phải URL → lỗi inline, xoá QR cũ | DONE | Đã thử hợp lệ → sai: QR biến mất. Khung trống ghi "Chưa có link hợp lệ" |
| LO-03 Scheme bị chặn → thông báo | DONE | "Chỉ hỗ trợ link http/https." |
| LO-04 > 1.000 ký tự từ chối; 300–1.000 cảnh báo | DONE | |
| LO-05 Tương phản < 4:1 (kể cả màu 2 và màu mắt) | DONE | Đã thử màu đơn, màu chuyển sắc thứ hai, màu mắt |
| LO-06 Đảo màu | DONE | |
| LO-07 Nền trong suốt → nền caro + ghi chú | DONE | |
| LO-08 Caption 60/60 đỏ; dán xuống dòng → dấu cách | DONE | **Đã patch**: trước đó dán nhiều dòng bị dính chữ ("Dòng 1Dòng 2") vì trình duyệt tự xoá xuống dòng; nay bắt sự kiện dán |
| LO-09 Khung có dải + caption trống → "SCAN ME" | DONE | |
| LO-10 Trình duyệt không cho ghi clipboard → thông báo | PARTIAL | Handler có (kiểm API + bắt lỗi), chưa kích hoạt được trong test |
| LO-11 PNG 4096 lỗi bộ nhớ → thông báo, không tải file hỏng | PARTIAL | Handler có (`toBlob` null / lỗi decode), chưa tái hiện được lỗi bộ nhớ (4096 px tạo bình thường, 3,8 MB) |
| LO-12 Không im lặng xuất QR khó quét | DONE | = LO-05/LO-06 |
| LO-13 Mức sửa lỗi Q, hoặc H khi có logo | DONE | `buildMatrix(text, d.logo ? 'H' : 'Q')` |
| LO-15 File sai loại → báo lỗi, giữ logo cũ | DONE | `notes.txt` → "Only PNG, JPG, SVG or WebP images are supported." |
| LO-16 Ảnh > 2 MB → từ chối | DONE | File 2 MB + 10 byte → "That image is over 2 MB — please use a smaller file." |
| LO-17 Ảnh hỏng → báo lỗi, giữ logo cũ | DONE | `broken.png` (9 byte rác) → "This image can't be read…", logo cũ còn nguyên |
| LO-18 Ghi chú mức H; cảnh báo khi logo > 25% | DONE | Hiện "Logo added: error correction raised to H…"; ở 30% thêm "Large logo — scan-test…" |
| LO-14 Bộ nhớ cục bộ bị chặn → English, không lỗi | DONE | Giả lập `localStorage` ném lỗi: nạp ra English, đổi sang VI vẫn chạy trong phiên, không có lỗi |

## Ghost

| Code thừa | Ghi chú |
|---|---|
| Dòng "Mã hoá: …" dưới bản xem trước | Không có use case riêng; đang phục vụ minh bạch cho UC-02/KT-07. Giữ hay bỏ: bạn quyết |
| Dòng "Chạy hoàn toàn trên trình duyệt…" ở đầu trang | Không có use case riêng; diễn giải KT-06 cho người dùng |

(`scripts/verify.ts`, `scripts/e2e.html` là công cụ kiểm thử đã ghi trong plan — không tính ghost.)

## Tổng kết

- DONE: 41 · PARTIAL: 4 · MISSING: 0 · BROKEN: 0
- ENFORCED: 14 · VIOLATED: 0
- GHOST: 2 (nhỏ, chờ bạn quyết)

4 mục PARTIAL đều là **chưa xác minh bằng thao tác thật** (sao chép clipboard, quét bằng điện thoại, 2 nhánh lỗi khó tái hiện), không phải thiếu code. 
## Checklist kiểm tay (các mục chưa tự xác minh được)

- [ ] Bấm **Copy image / Sao chép ảnh** rồi dán vào Word/Zalo → ảnh hiện đúng (UC-15)
- [ ] Bấm **Download PNG** và **Download SVG** → file tên `qr-<tên miền>.png/.svg`, mở SVG ở máy khác vẫn đúng phông (UC-13, UC-14, UC-16)
- [ ] Quét vài mẫu bằng camera iPhone, Zalo, Google Lens: chấm tròn, sọc, kim cương, khung bong bóng, chuyển sắc, **có logo 30%** (UC-18)
- [ ] Mở app bằng Firefox → bấm sao chép ảnh → nếu trình duyệt không cho thì phải hiện thông báo hướng dẫn dùng nút tải PNG (LO-10)
