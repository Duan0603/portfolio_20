"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { education, certifications, profile } from "@/lib/data";

export default function About() {
  const { lang } = usePrefs();
  const t = ui[lang];

  const competencies = [
    {
      idx: "01",
      title: lang === "vi" ? "Hệ thống phân tán & Microservices" : "Distributed Systems & Microservices",
      desc:
        lang === "vi"
          ? "Kiến trúc database-per-service, định tuyến API Gateway TCP/RabbitMQ, thanh toán PayOS tự động hóa."
          : "Database-per-service patterns, TCP/RabbitMQ Gateway routing, automated PayOS webhook payment issuance.",
    },
    {
      idx: "02",
      title: lang === "vi" ? "Thị giác máy tính & Edge AI" : "Computer Vision & Edge AI",
      desc:
        lang === "vi"
          ? "Tối ưu hóa mô hình YOLOv8 sang TensorRT .engine, xử lý luồng video MOG2 real-time trên phần cứng NVIDIA Jetson."
          : "Compiling YOLOv8 models to TensorRT .engine, MOG2 real-time video filtering on NVIDIA Jetson edge hardware.",
    },
    {
      idx: "03",
      title: lang === "vi" ? "Quy trình phát triển & CI/CD" : "Engineering Delivery & Quality",
      desc:
        lang === "vi"
          ? "Áp dụng phương pháp BMAD phân rã user story nguyên tử, đóng gói Docker container, chuẩn hóa Agile/Scrum."
          : "BMAD framework for atomic user stories, Docker containerization, rigorous Agile/Scrum delivery standards.",
    },
  ];

  return (
    <section id="about" className="relative py-24 border-t border-line/40">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-amber font-semibold tracking-wider">
            <span>[04]</span>
            <span>{lang === "vi" ? "HỒ SƠ KỸ THUẬT" : "ENGINEERING PROFILE"}</span>
          </div>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {t.about.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-steel">
            {profile.summary[lang]}
          </p>
        </div>

        {/* 3 Engineering Pillars */}
        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {competencies.map((c) => (
            <div
              key={c.idx}
              className="rounded-xl border border-line bg-obsidian/70 p-6 backdrop-blur-md transition-all duration-300 hover:border-amber/40 hover:bg-obsidian"
            >
              <span className="font-mono text-xs text-amber font-bold">PILLAR 0{c.idx}</span>
              <h3 className="mt-2 font-display text-lg font-bold text-ink">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-steel">
                {c.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Education & Certifications 2-Column Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Education Box */}
          <div className="md:col-span-6 rounded-xl border border-line bg-obsidian/60 p-7 backdrop-blur-sm">
            <span className="font-mono text-xs text-amber font-semibold tracking-wider uppercase">
              {t.about.education}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold text-ink">
              {education.school}
            </h3>
            <p className="mt-1 text-sm text-amber-bright font-medium">
              {education.major}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-steel border-t border-line/40 pt-4">
              <span>{education.period[lang]}</span>
              <span>·</span>
              <span className="rounded bg-line/40 px-2 py-0.5 text-ink font-semibold">
                GPA {education.gpa}
              </span>
            </div>
          </div>

          {/* Certifications Box */}
          <div className="md:col-span-6 rounded-xl border border-line bg-obsidian/60 p-7 backdrop-blur-sm">
            <span className="font-mono text-xs text-amber font-semibold tracking-wider uppercase">
              {t.about.certs}
            </span>
            <div className="mt-4 space-y-3">
              {certifications.map((cert) => (
                <div key={cert} className="flex items-start gap-3 border-b border-line/40 pb-3 last:border-b-0 last:pb-0">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-bright shrink-0" />
                  <h4 className="font-display text-sm font-semibold text-ink">
                    {cert}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
