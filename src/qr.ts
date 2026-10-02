import qrcode from 'qrcode-generator';

export interface Matrix {
  size: number;
  isDark(row: number, col: number): boolean;
}

/** LO-13: mức sửa lỗi Q (~25%), hoặc H (~30%) khi có logo. Chuỗi vào luôn là ASCII (xem url.ts). */
export function buildMatrix(text: string, ec: 'Q' | 'H' = 'Q'): Matrix {
  const qr = qrcode(0, ec);
  qr.addData(text, 'Byte');
  qr.make();
  const size = qr.getModuleCount();
  return {
    size,
    isDark: (r, c) => r >= 0 && c >= 0 && r < size && c < size && qr.isDark(r, c),
  };
}

/** Ô thuộc 1 trong 3 "mắt" 7×7 ở góc — được vẽ riêng, không vẽ như hoạ tiết. */
export function isEyeModule(size: number, r: number, c: number): boolean {
  const inBand = (v: number) => v < 7;
  const inFar = (v: number) => v >= size - 7;
  return (inBand(r) && inBand(c)) || (inBand(r) && inFar(c)) || (inFar(r) && inBand(c));
}
