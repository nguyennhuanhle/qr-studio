# Use Cases — QR Studio (tạo QR cho URL)

> Source of truth. Mọi code phải khớp file này. Cập nhật file này TRƯỚC khi thêm feature mới.
> Trạng thái: **v1.3 — đã duyệt 2026-10-02** (v1.1: giao diện tiếng Anh, UC-20→22; v1.2: footer tác giả, UC-23; v1.3: logo giữa QR, UC-24→27).

## Roles

- **Người tạo** — người mở app, nhập URL, tuỳ biến giao diện QR rồi tải về. Không cần đăng nhập.
- **Người quét** — người cầm điện thoại quét QR đã in/đăng. Không dùng app, nhưng là người quyết định QR "đạt" hay không.

---

## Người tạo

### Có thể

**Nhập URL**
- UC-01. Là người tạo, tôi có thể dán/gõ một URL và thấy QR xem trước cập nhật ngay khi gõ, để không phải bấm "Tạo".
- UC-02. Là người tạo, tôi có thể gõ URL thiếu `https://` (vd `edtechcorner.vn/abc`) và hệ thống tự thêm `https://`, có ghi chú cho tôi biết, để khỏi gõ dài.

**Hoạ tiết (pattern)**
- UC-03. Là người tạo, tôi có thể chọn kiểu hoạ tiết cho các ô dữ liệu: Vuông, Chấm tròn, Bo góc, Bo góc liền khối, Lá (classy), Kim cương, Sọc dọc, Sọc ngang — để QR hợp phong cách thương hiệu.
- UC-04. Là người tạo, tôi có thể chọn riêng kiểu "mắt" QR (3 ô vuông lớn ở góc): khung mắt (vuông / bo góc / tròn / lá) và tròng mắt (vuông / tròn / bo góc / kim cương).

**Màu sắc**
- UC-05. Là người tạo, tôi có thể chọn màu cho hoạ tiết và màu nền, để QR khớp màu thương hiệu.
- UC-06. Là người tạo, tôi có thể bật gradient 2 màu (tuyến tính có góc xoay, hoặc toả tròn) cho hoạ tiết.
- UC-07. Là người tạo, tôi có thể đặt màu mắt QR khác màu hoạ tiết (khung mắt và tròng mắt mỗi phần một màu).
- UC-08. Là người tạo, tôi có thể chọn nền trong suốt để đặt QR lên ảnh/thiết kế khác.

**Caption**
- UC-09. Là người tạo, tôi có thể thêm một dòng chữ (caption) như "Quét để đăng ký" để người quét biết QR dẫn đi đâu.
- UC-10. Là người tạo, tôi có thể chỉnh caption: vị trí (trên / dưới QR), phông (4 kiểu: Sans, Serif, Mono, Rounded), cỡ chữ, đậm/thường, màu chữ.

**Frame**
- UC-11. Là người tạo, tôi có thể chọn khung bao quanh QR: Không khung, Viền vuông, Viền bo góc, Nhãn đáy (caption nằm trong dải màu dưới QR), Bong bóng chat (có đuôi chỉ xuống).
- UC-12. Là người tạo, tôi có thể chỉnh màu khung, độ dày viền, và khi khung có dải nhãn thì caption tự nằm trong dải đó với màu chữ tương phản.

**Xuất file**
- UC-13. Là người tạo, tôi có thể tải QR (gồm cả khung + caption) dưới dạng PNG với kích thước chọn sẵn 512 / 1024 / 2048 / 4096 px.
- UC-14. Là người tạo, tôi có thể tải bản SVG (vector) để in khổ lớn không vỡ.
- UC-15. Là người tạo, tôi có thể sao chép ảnh PNG vào clipboard để dán thẳng vào Word/Canva/Zalo.
- UC-16. Là người tạo, tôi nhận file có tên gợi ý theo tên miền (vd `qr-edtechcorner.vn.png`).
- UC-17. Là người tạo, tôi có thể bấm "Về mặc định" để xoá mọi tuỳ biến và bắt đầu lại.

**Ngôn ngữ giao diện** *(v1.1)*
- UC-20. Là người tạo, tôi có thể đổi giao diện giữa English và Tiếng Việt bằng nút EN/VI ở đầu trang.
- UC-21. Là người tạo, khi mở app lần đầu, tôi thấy giao diện tiếng Anh (mặc định).
- UC-22. Là người tạo, khi mở lại app, tôi thấy đúng ngôn ngữ đã chọn lần trước (chỉ lưu trên trình duyệt của tôi).

**Footer** *(v1.2)*
- UC-23. Là người tạo, tôi thấy ở cuối trang dòng "Developed by Mr Le Nguyen Nhu Anh © <năm hiện tại>"; tên tác giả là link tới https://edtechcorner.com (mở tab mới), năm tự cập nhật theo đồng hồ máy.

**Logo** *(v1.3)*
- UC-24. Là người tạo, tôi có thể chọn ảnh logo (PNG, JPG, SVG, WebP) từ máy và thấy logo hiện ngay ở giữa QR.
- UC-25. Là người tạo, tôi có thể chỉnh cỡ logo từ 10% đến 30% bề rộng vùng mã (mặc định 20%) và chọn nền phía sau logo: không nền, vuông bo góc, hoặc tròn (nền tô màu nền QR).
- UC-26. Là người tạo, tôi có thể bỏ logo; nút "Về mặc định" cũng bỏ logo.
- UC-27. Là người tạo, tôi nhận file PNG/SVG có logo; file SVG tự chứa ảnh logo nên mở ở máy khác vẫn thấy.

### Không thể
- KT-01. Là người tạo, tôi KHÔNG THỂ tạo QR cho URL có scheme khác `http`/`https` (`javascript:`, `data:`, `file:`, `intent:`…) — app chỉ dành cho link web, chặn để không tạo QR độc hại.
- KT-02. Là người tạo, tôi KHÔNG THỂ tải/sao chép khi chưa có URL hợp lệ — nút tải bị vô hiệu, tránh xuất ra QR rỗng hoặc QR cũ.
- KT-03. Là người tạo, tôi KHÔNG THỂ bỏ hoàn toàn vùng trống quanh QR (quiet zone luôn ≥ 2 ô) — máy quét cần vùng này để nhận diện.
- KT-04. Là người tạo, tôi KHÔNG THỂ nhập caption dài quá 60 ký tự hoặc nhiều dòng — dài hơn sẽ tràn khung và nhỏ chữ đến mức không đọc được.
- KT-05. Là người tạo, tôi KHÔNG THỂ chọn kích thước PNG ngoài 4 mức có sẵn — dưới 512 thì mờ khi in, trên 4096 dễ làm treo trình duyệt.
- KT-06. Là người tạo, tôi KHÔNG THỂ khiến URL của mình bị gửi lên server — mọi thứ chạy trong trình duyệt.
- KT-09. Là người tạo, tôi KHÔNG THỂ làm mất link, thiết kế hay caption khi đổi ngôn ngữ — caption là nội dung của tôi, không bị dịch.
- KT-10. Là người tạo, tôi KHÔNG THỂ làm ảnh xuất ra thay đổi chỉ vì đổi ngôn ngữ giao diện — nhãn mặc định "SCAN ME" giữ nguyên ở cả hai ngôn ngữ.
- KT-11. Là người tạo, tôi KHÔNG THỂ khiến ảnh logo bị tải lên server — ảnh chỉ được đọc trong trình duyệt (cùng tinh thần KT-06).
- KT-12. Là người tạo, tôi KHÔNG THỂ cho logo to quá 30% bề rộng vùng mã — to hơn dễ không quét được.
- KT-13. Là người tạo, tôi KHÔNG THỂ để logo hay nền logo che 3 mắt QR hoặc quiet zone — logo luôn ở chính giữa, không kéo đi được, và tự thu nhỏ nếu QR quá nhỏ.
- KT-14. Là người tạo, tôi KHÔNG THỂ giữ logo sau khi tải lại trang — logo, như mọi phần thiết kế khác, không được lưu.

### Khi lỗi
- LO-01. Là người tạo, khi ô URL trống, thì hệ thống hiển thị khung xem trước rỗng với gợi ý "Dán link vào để bắt đầu", nút tải bị vô hiệu.
- LO-02. Là người tạo, khi tôi nhập chuỗi không phải URL (có khoảng trắng, không có tên miền như `abc`, `http://`), thì hệ thống báo lỗi ngay dưới ô nhập "Đây chưa phải link hợp lệ" và giữ nguyên QR trống (không hiện QR cũ).
- LO-03. Là người tạo, khi tôi nhập URL có scheme bị chặn (KT-01), thì hệ thống báo "Chỉ hỗ trợ link http/https".
- LO-04. Là người tạo, khi URL dài hơn 1.000 ký tự, thì hệ thống từ chối và báo "Link quá dài, QR sẽ quá dày để quét — hãy rút gọn link trước"; từ 300–1.000 ký tự thì vẫn tạo nhưng cảnh báo vàng "QR dày, nên in ≥ 4 cm".
- LO-05. Là người tạo, khi tôi chọn màu hoạ tiết và màu nền có độ tương phản thấp (tỉ lệ < 4:1, tính cả gradient và màu mắt), thì hệ thống hiện cảnh báo "Màu quá giống nhau, có thể không quét được" — vẫn cho tải nhưng cảnh báo hiện rõ.
- LO-06. Là người tạo, khi hoạ tiết sáng hơn nền (QR đảo màu), thì hệ thống cảnh báo "Nhiều máy quét không đọc được QR đảo màu".
- LO-07. Là người tạo, khi tôi chọn nền trong suốt, thì xem trước hiện nền caro và có ghi chú "Nhớ đặt QR lên nền tương phản với màu hoạ tiết".
- LO-08. Là người tạo, khi tôi gõ caption vượt 60 ký tự, thì ô nhập dừng nhận ký tự và bộ đếm `60/60` chuyển đỏ; khi dán chuỗi có xuống dòng thì xuống dòng bị đổi thành dấu cách.
- LO-09. Là người tạo, khi chọn khung "Nhãn đáy" hoặc "Bong bóng" mà caption trống, thì hệ thống dùng chữ mặc định "SCAN ME" thay vì để dải trống.
- LO-10. Là người tạo, khi trình duyệt không cho ghi clipboard (Firefox cũ, chưa cấp quyền), thì hệ thống báo "Trình duyệt không cho sao chép ảnh — hãy dùng nút Tải PNG".
- LO-11. Là người tạo, khi xuất PNG 4096 px thất bại (thiếu bộ nhớ), thì hệ thống báo lỗi và gợi ý chọn kích thước nhỏ hơn, không tải về file hỏng.
- LO-14. Là người tạo, khi trình duyệt chặn bộ nhớ cục bộ (ẩn danh, chặn cookie), thì hệ thống dùng tiếng Anh và không báo lỗi; nút đổi ngôn ngữ vẫn chạy trong phiên đó.
- LO-15. Là người tạo, khi tôi chọn file không phải PNG/JPG/SVG/WebP, thì hệ thống báo "Chỉ nhận ảnh PNG, JPG, SVG hoặc WebP" và giữ nguyên logo cũ (nếu có).
- LO-16. Là người tạo, khi tôi chọn ảnh lớn hơn 2 MB, thì hệ thống từ chối và gợi ý dùng ảnh nhỏ hơn.
- LO-17. Là người tạo, khi file ảnh hỏng hoặc trình duyệt không đọc được, thì hệ thống báo "Không đọc được ảnh này" và giữ nguyên logo cũ (nếu có).
- LO-18. Là người tạo, khi QR có logo, thì hệ thống ghi chú "Đã nâng mức sửa lỗi lên H"; khi logo lớn hơn 25%, thì cảnh báo "Logo lớn — nên quét thử trước khi in".

---

## Người quét

### Có thể
- UC-18. Là người quét, tôi có thể quét QR (PNG, SVG đã in, hoặc trên màn hình) bằng camera điện thoại thường (iOS Camera, Zalo, Google Lens) và được mở đúng URL người tạo đã nhập — với mọi tổ hợp hoạ tiết / màu / khung / caption hợp lệ.
- UC-19. Là người quét, tôi có thể đọc caption để biết trước QR dẫn tới đâu.

### Không thể
- KT-07. Là người quét, tôi KHÔNG THỂ bị dẫn qua link trung gian (rút gọn, tracking) — QR mã hoá trực tiếp URL gốc, mở ra đúng như người tạo nhập.
- KT-08. Là người quét, tôi KHÔNG THỂ gặp QR bị khung/caption che mất phần mã — khung và caption luôn nằm ngoài vùng QR + quiet zone.

### Khi lỗi
- LO-12. Là người quét, khi QR được thiết kế với màu tương phản thấp hoặc đảo màu, thì người tạo đã được cảnh báo từ lúc thiết kế (LO-05, LO-06) — hệ thống không được im lặng xuất QR khó quét.
- LO-13. Là người quét, khi QR bị trầy/bẩn một phần nhỏ, thì vẫn quét được nhờ mức sửa lỗi Q (~25%) khi không có logo, và H (~30%) khi có logo (phần dưới logo coi như bị che).

---

## Hệ thống KHÔNG làm

- Không kéo/thả hay đặt logo lệch tâm, không cắt/chỉnh sửa ảnh logo trong app.
- Không có QR động, thống kê lượt quét, rút gọn link — cần server, trái KT-06/KT-07.
- Không có tài khoản, lưu lịch sử, thư viện thiết kế đã lưu.
- Không hỗ trợ loại nội dung khác URL (WiFi, vCard, văn bản, email, SMS…).
- Không tạo QR hàng loạt từ danh sách/Excel.
- Không xuất PDF / JPG / file in ấn có bleed — chỉ PNG và SVG.
- Không có bộ mẫu thiết kế (template) dựng sẵn ngoài cấu hình mặc định.
- Không có ngôn ngữ giao diện nào ngoài English và Tiếng Việt; không tự đoán ngôn ngữ theo trình duyệt (mặc định luôn là English).
- Không có backend — app tĩnh, chạy hoàn toàn trong trình duyệt.
