"use client";

import { profile } from "@/lib/data";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";

export default function Hero() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="hero-copy max-w-2xl">
          <h1 className="font-display text-[clamp(2.9rem,9vw,6rem)] font-extrabold leading-[0.95] tracking-tightest text-ink">
            Hoàng
            <br />
            Đức Duẫn
          </h1>

          {lang === "vi" ? (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-steel">
              Full-Stack Developer dựng sản phẩm xuyên suốt{" "}
              <span className="text-ink">web</span>,{" "}
              <span className="text-ink">thị giác máy tính</span> và{" "}
              <span className="text-ink">phần cứng edge</span> — từ nền tảng
              React/Next.js &amp; microservices đến AI YOLOv8 chạy trên NVIDIA
              Jetson.
            </p>
          ) : (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-steel">
              Full-Stack Developer building products across{" "}
              <span className="text-ink">web</span>,{" "}
              <span className="text-ink">computer vision</span> and{" "}
              <span className="text-ink">edge hardware</span> — from
              React/Next.js platforms &amp; microservices to YOLOv8 AI running
              on NVIDIA Jetson.
            </p>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a href="#work" className="plate">
              {t.hero.cta}
              <span aria-hidden className="font-mono text-sm">
                →
              </span>
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="plate-steel"
            >
              GitHub
            </a>
          </div>

          <p className="mt-8 font-mono text-xs tracking-wide text-steel-dim">
            {profile.location[lang]} · {t.hero.meta}
          </p>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="spec-label">{t.hero.scroll}</span>
        <span className="h-9 w-px bg-gradient-to-b from-amber to-transparent" />
      </div>
    </section>
  );
}
