"use client";

import { profile } from "@/lib/data";
import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";

export default function Hero() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <div className="face-in justify-center">
      <h1 className="f-display text-ink">
        Hoàng
        <br />
        Đức Duẫn
      </h1>

      {lang === "vi" ? (
        <p className="f-lead mt-6 max-w-[34rem]">
          Full-Stack Developer dựng sản phẩm xuyên suốt{" "}
          <span className="text-ink">web</span>,{" "}
          <span className="text-ink">thị giác máy tính</span> và{" "}
          <span className="text-ink">phần cứng edge</span>, từ nền tảng
          React/Next.js &amp; microservices đến AI YOLOv8 chạy trên NVIDIA
          Jetson.
        </p>
      ) : (
        <p className="f-lead mt-6 max-w-[34rem]">
          Full-Stack Developer building products across{" "}
          <span className="text-ink">web</span>,{" "}
          <span className="text-ink">computer vision</span> and{" "}
          <span className="text-ink">edge hardware</span>, from React/Next.js
          platforms &amp; microservices to YOLOv8 AI running on NVIDIA Jetson.
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a href="#work" className="plate">
          {t.hero.cta}
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

      <p className="f-meta mt-8">
        {profile.location[lang]}
        <br />
        {t.hero.meta}
      </p>
    </div>
  );
}
