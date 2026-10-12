"use client";

import { usePrefs } from "@/lib/prefs";
import { ui } from "@/lib/i18n";
import { projects } from "@/lib/data";

const featured = projects.filter((p) => p.highlights);
const otherRepos = projects.filter((p) => !p.highlights);

function Links({ repo, demo, lang }: { repo?: string; demo?: string; lang: "vi" | "en" }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {demo && (
        <a
          href={demo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[3px] bg-gradient-to-r from-amber to-amber-bright px-4 py-2 text-xs font-semibold text-vault shadow-md shadow-amber/20 transition-all hover:-translate-y-0.5 hover:shadow-amber/30"
        >
          {lang === "vi" ? "DEMO TRỰC TIẾP ↗" : "LIVE DEMO ↗"}
        </a>
      )}
      {repo && (
        <a
          href={repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[3px] border border-line bg-obsidian/80 px-4 py-2 text-xs font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-amber/40 hover:text-amber-bright"
        >
          {lang === "vi" ? "MÃ NGUỒN ↗" : "SOURCE CODE ↗"}
        </a>
      )}
    </div>
  );
}

/** Architectural pipeline blueprints */
function PipelineBlueprint({ name, lang }: { name: string; lang: "vi" | "en" }) {
  if (name.includes("Cinema")) {
    return (
      <div className="rounded-md border border-line bg-vault-2/80 p-4 font-mono text-xs text-steel">
        <div className="mb-2.5 flex items-center justify-between text-[0.7rem] text-steel-dim">
          <span className="tracking-wider">SYSTEM ARCHITECTURE BLUEPRINT</span>
          <span className="rounded bg-amber/15 px-2 py-0.5 text-amber font-semibold">MICROSERVICES</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-ink">
          <span className="rounded bg-obsidian-hi px-2.5 py-1 text-steel border border-line/60">
            Angular (RxJS)
          </span>
          <span className="text-amber font-bold">→</span>
          <span className="rounded bg-obsidian-hi px-2.5 py-1 text-steel border border-line/60">
            API Gateway (RabbitMQ)
          </span>
          <span className="text-amber font-bold">→</span>
          <span className="rounded bg-obsidian-hi px-2.5 py-1 text-steel border border-line/60">
            NestJS Services
          </span>
          <span className="text-amber font-bold">→</span>
          <span className="rounded bg-amber/20 px-2.5 py-1 text-amber-bright font-semibold border border-amber/30">
            PostgreSQL + PayOS
          </span>
        </div>
        <div className="mt-2.5 text-[0.72rem] text-steel-dim">
          {lang === "vi"
            ? "Định giá động: 1.2x VIP · 1.5x SweetBox · Webhook tự động xuất vé tức thì"
            : "Dynamic pricing: 1.2x VIP · 1.5x SweetBox · Automated webhook issuance"}
        </div>
      </div>
    );
  }

  if (name.includes("Waste")) {
    return (
      <div className="rounded-md border border-line bg-vault-2/80 p-4 font-mono text-xs text-steel">
        <div className="mb-2.5 flex items-center justify-between text-[0.7rem] text-steel-dim">
          <span className="tracking-wider">EDGE AI PIPELINE BLUEPRINT</span>
          <span className="rounded bg-amber/15 px-2 py-0.5 text-amber font-semibold">NVIDIA JETSON</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-ink">
          <span className="rounded bg-obsidian-hi px-2.5 py-1 text-steel border border-line/60">
            Camera Feed
          </span>
          <span className="text-amber font-bold">→</span>
          <span className="rounded bg-obsidian-hi px-2.5 py-1 text-steel border border-line/60">
            OpenCV (MOG2)
          </span>
          <span className="text-amber font-bold">→</span>
          <span className="rounded bg-amber/20 px-2.5 py-1 text-amber-bright font-semibold border border-amber/30">
            YOLOv8 (TensorRT .engine)
          </span>
          <span className="text-amber font-bold">→</span>
          <span className="rounded bg-obsidian-hi px-2.5 py-1 text-steel border border-line/60">
            PCA9685 I2C Servos
          </span>
        </div>
        <div className="mt-2.5 text-[0.72rem] text-steel-dim">
          {lang === "vi"
            ? "Tối ưu suy luận edge 30+ FPS · Dashboard Flask đa luồng stream MJPEG real-time"
            : "Accelerated edge inference 30+ FPS · Multi-threaded Flask MJPEG streaming"}
        </div>
      </div>
    );
  }

  return null;
}

export default function Projects() {
  const { lang } = usePrefs();
  const t = ui[lang];

  return (
    <section id="work" className="relative py-24 border-t border-line/40">
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header */}
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-amber font-semibold tracking-wider">
            <span>[02]</span>
            <span>{lang === "vi" ? "DỰ ÁN TIÊU BIỂU" : "FEATURED EXHIBITS"}</span>
          </div>
          <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            {t.work.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-steel">
            {t.work.intro}
          </p>
        </div>

        {/* Featured Projects List */}
        <div className="mt-16 space-y-12">
          {featured.map((p, idx) => {
            const caseId =
              idx === 0
                ? "case-cinema"
                : idx === 1
                  ? "case-waste"
                  : "case-fitnexus";
            return (
              <div
                key={p.name}
                id={caseId}
                className="group relative rounded-xl border border-line bg-obsidian/70 p-7 sm:p-9 backdrop-blur-md transition-all duration-300 hover:border-amber/40 hover:shadow-2xl hover:shadow-black/50"
              >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/50 pb-5">
                <div>
                  <span className="font-mono text-xs text-amber">CASE STUDY 0{idx + 1}</span>
                  <h3 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-ink group-hover:text-amber-bright transition-colors">
                    {p.name}
                  </h3>
                </div>
                <span className="rounded bg-line/40 px-3 py-1 font-mono text-xs tracking-wider text-steel">
                  {p.name.includes("Waste")
                    ? "EDGE AI · ROBOTICS"
                    : p.name.includes("Cinema")
                      ? "WEB · MICROSERVICES"
                      : "AI · FULL-STACK"}
                </span>
              </div>

              {/* 2-Column Split: Narrative & Blueprint on Left, Highlights on Right */}
              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7 flex flex-col justify-between gap-5">
                  <p className="text-base leading-relaxed text-steel">
                    {p.description[lang]}
                  </p>

                  <PipelineBlueprint name={p.name} lang={lang} />

                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-obsidian-hi px-2.5 py-1 font-mono text-xs text-steel border border-line/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Links repo={p.repo} demo={p.demo} lang={lang} />
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-lg border border-line/60 bg-vault-2/60 p-5">
                  <h4 className="font-mono text-xs font-semibold tracking-wider text-amber mb-4">
                    {t.work.highlights.toUpperCase()}
                  </h4>
                  <ul className="space-y-4">
                    {p.highlights!.map((h, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-ink/90">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber/15 font-mono text-xs font-bold text-amber-bright">
                          0{i + 1}
                        </span>
                        <span>{h[lang]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

        {/* Other Repositories Grid */}
        <div className="mt-20">
          <div className="flex items-center justify-between border-b border-line/50 pb-4">
            <h3 className="font-display text-2xl font-bold text-ink">
              {t.work.more}
            </h3>
            <span className="font-mono text-xs text-steel-dim">GITHUB.COM/DUAN0603</span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {otherRepos.map((repo) => (
              <div
                key={repo.name}
                className="group flex flex-col justify-between rounded-lg border border-line bg-obsidian/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber/40 hover:bg-obsidian"
              >
                <div>
                  <h4 className="font-display text-base font-bold text-ink group-hover:text-amber-bright transition-colors">
                    {repo.name}
                  </h4>
                  <p className="mt-2 text-xs leading-relaxed text-steel">
                    {repo.description[lang]}
                  </p>
                </div>

                <div className="mt-5 border-t border-line/40 pt-3 flex items-center justify-between text-xs">
                  <div className="flex flex-wrap gap-1 font-mono text-[0.65rem] text-steel-dim">
                    {repo.tags.slice(0, 2).join(" · ")}
                  </div>
                  <div className="flex items-center gap-2">
                    {repo.demo && (
                      <a
                        href={repo.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber hover:text-amber-bright font-medium"
                      >
                        Demo ↗
                      </a>
                    )}
                    {repo.repo && (
                      <a
                        href={repo.repo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-steel hover:text-ink"
                      >
                        Code ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectFace({ project: _p }: { project?: unknown }) {
  return null;
}
export function ReposFace() {
  return null;
}
