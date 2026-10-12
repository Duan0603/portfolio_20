"use client";

import { useState } from "react";
import { profile } from "@/lib/data";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";

export default function Hero() {
  const { lang } = usePrefs();
  const t = ui[lang];
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pillars = [
    {
      idx: "01",
      title: lang === "vi" ? "Kiến trúc Web & Microservices" : "Web Architecture & Microservices",
      tech: "Next.js · NestJS · PostgreSQL · PayOS",
      desc:
        lang === "vi"
          ? "Hệ thống phân tán, định giá động, xử lý giao dịch thanh toán webhook real-time an toàn."
          : "Distributed microservices, dynamic seat pricing, real-time secure webhook payment pipelines.",
      badge: "WEB PLATFORMS",
    },
    {
      idx: "02",
      title: lang === "vi" ? "Thị giác máy tính & Edge AI" : "Computer Vision & Edge AI",
      tech: "YOLOv8 · TensorRT · OpenCV · Python",
      desc:
        lang === "vi"
          ? "Tối ưu hóa pipeline AI sang TensorRT .engine, kết hợp lọc chuyển động MOG2 đạt 30+ FPS."
          : "Optimized AI pipeline compiled to TensorRT .engine with MOG2 motion filtering at 30+ FPS.",
      badge: "EDGE INFERENCE",
    },
    {
      idx: "03",
      title: lang === "vi" ? "Phần cứng nhúng & IoT" : "Embedded Systems & Hardware IoT",
      tech: "NVIDIA Jetson · I2C PCA9685 · Servos",
      desc:
        lang === "vi"
          ? "Điều khiển đồng thời cụm servo cơ khí qua I2C, dashboard stream MJPEG đa luồng qua Flask."
          : "Multi-servo mechanical actuator control via I2C, multi-threaded MJPEG streaming dashboard.",
      badge: "ROBOTICS & IOT",
    },
  ];

  return (
    <section id="top" className="relative pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-6xl px-6">
        {/* Upper Hero: Split Grid allowing 3D Core on the right */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
          {/* Left Column (Content) */}
          <div className="lg:col-span-8">
            {/* Top Beacon & Availability */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-obsidian/80 px-3.5 py-1.5 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-bright" />
              </span>
              <span className="font-mono text-xs tracking-wider text-steel">
                {lang === "vi"
                  ? "SẴN SÀNG CHO CƠ HỘI MỚI · FULL-STACK & EDGE AI"
                  : "AVAILABLE FOR ROLES · FULL-STACK & EDGE AI"}
              </span>
            </div>

            {/* Hero Name & Identity */}
            <h1 className="mt-7 font-display text-5xl font-extrabold tracking-tight text-ink sm:text-6xl md:text-7xl lg:text-8xl">
              Hoàng Đức Duẫn
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-steel sm:text-xl font-normal">
              {lang === "vi" ? (
                <>
                  Kỹ sư phần mềm phát triển sản phẩm thực chiến xuyên suốt{" "}
                  <span className="font-semibold text-ink">nền tảng web</span>,{" "}
                  <span className="font-semibold text-ink">thị giác máy tính</span> và{" "}
                  <span className="font-semibold text-ink">phần cứng edge</span> — từ kiến trúc
                  microservices NestJS/PostgreSQL đến mô hình AI YOLOv8 tăng tốc TensorRT trên NVIDIA Jetson.
                </>
              ) : (
                <>
                  Full-Stack Developer building production systems across{" "}
                  <span className="font-semibold text-ink">web platforms</span>,{" "}
                  <span className="font-semibold text-ink">computer vision</span>, and{" "}
                  <span className="font-semibold text-ink">edge hardware</span> — from NestJS/PostgreSQL
                  microservices to YOLOv8 AI accelerated with TensorRT on NVIDIA Jetson.
                </>
              )}
            </p>

            {/* Action CTAs */}
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href="#work"
                className="inline-flex items-center gap-2 rounded-[3px] bg-gradient-to-r from-amber to-amber-bright px-6 py-3 text-sm font-semibold text-vault shadow-lg shadow-amber/20 transition-all hover:-translate-y-0.5 hover:shadow-amber/35"
              >
                {t.hero.cta}
                <span aria-hidden className="font-mono text-base">
                  ↓
                </span>
              </a>

              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[3px] border border-line bg-obsidian/80 px-5 py-3 text-sm font-medium text-ink backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-amber/40 hover:text-amber-bright"
              >
                GitHub ↗
              </a>

              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-2 rounded-[3px] border border-line/60 bg-vault-2/60 px-4 py-3 font-mono text-xs text-steel transition-colors hover:border-amber/30 hover:text-ink"
                title="Click to copy email"
              >
                <span>{profile.email}</span>
                <span className="text-amber">{copied ? "✓ Đã chép" : "⧉ Copy"}</span>
              </button>
            </div>

            {/* Meta Bar */}
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-steel-dim">
              <span>{profile.location[lang]}</span>
              <span>·</span>
              <span>{t.hero.meta}</span>
              <span>·</span>
              <span className="text-amber-bright/80">FPT University · Software Engineering</span>
            </div>
          </div>

          {/* Right Column (Visual Stage for 3D Crystalline Core) */}
          <div className="hidden lg:flex lg:col-span-4 h-72 items-center justify-center">
            {/* Visual spacer framing the WebGL 3D element behind it */}
          </div>
        </div>

        {/* 3 Architectural Triad Bento Cards */}
        <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.idx}
              className="group relative flex flex-col justify-between rounded-xl border border-line bg-obsidian/75 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber/40 hover:shadow-xl hover:shadow-black/40"
            >
              <div>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-amber font-semibold">{p.idx}</span>
                  <span className="rounded bg-line/40 px-2 py-0.5 text-[0.65rem] tracking-wider text-steel">
                    {p.badge}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-lg font-bold text-ink transition-colors group-hover:text-amber-bright">
                  {p.title}
                </h2>
                <p className="mt-1 font-mono text-xs text-amber/90">{p.tech}</p>
                <p className="mt-3 text-sm leading-relaxed text-steel">{p.desc}</p>
              </div>

              <div className="mt-5 border-t border-line/40 pt-3">
                <span className="font-mono text-[0.7rem] text-steel-dim group-hover:text-steel transition-colors">
                  VERIFIED IN PRODUCTION →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
