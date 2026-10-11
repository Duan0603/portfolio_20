# Portfolio — Hoàng Đức Duẫn

Website portfolio cá nhân, hướng thiết kế **"Obsidian Atelier"** — một phòng trưng bày tối với các "exhibit" bằng thủy tinh núi lửa dưới một nguồn sáng xén (raking light) duy nhất.

Xây dựng bằng **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS** và **Three.js / React Three Fiber** (hiệu ứng 3D WebGL immersive).

## Chạy dự án

```bash
npm install
npm run dev
```

Mở http://localhost:3000.

## Build production

```bash
npm run build
npm run start
```

## Cấu trúc

```
app/
  layout.tsx        # fonts (Bricolage Grotesque / Hanken Grotesk / JetBrains Mono)
  page.tsx          # bố cục trang
  globals.css       # design tokens (colorway) + lớp vật liệu
  icon.svg          # favicon
components/
  Atelier.tsx       # scene WebGL (R3F): khối obsidian + ánh sáng xén theo con trỏ
  Hero.tsx          # màn hình đầu: tên + nghề dẫn dắt
  Navbar / Footer
  Projects.tsx      # dự án dạng exhibit, tilt 3D
  About / Skills / Contact
  Reveal.tsx        # hiệu ứng lộ dần theo scroll
  TiltExhibit.tsx   # nghiêng 3D theo con trỏ
lib/data.ts         # dữ liệu cá nhân, kỹ năng, dự án (sửa nội dung tại đây)
info.md             # thông tin tổng hợp (CV + GitHub)
DESIGN.md           # hệ thống thiết kế (màu, font, vật liệu, motion)
PRODUCT.md          # bối cảnh sản phẩm
```

## Cập nhật nội dung

Mọi nội dung (dự án, kỹ năng, liên hệ) nằm trong `lib/data.ts`. Hệ màu & vật liệu nằm trong `app/globals.css` (các token `--vault`, `--obsidian`, `--amber`…); có sẵn colorway `day` cho chế độ sáng trong tương lai.

## Hiệu năng & khả năng truy cập

- Tôn trọng `prefers-reduced-motion` (tắt chuyển động 3D/reveal).
- Fallback khi trình duyệt không hỗ trợ WebGL (nền gradient tĩnh).
- Responsive 390px → desktop; tương phản chữ đạt chuẩn trên nền tối.
