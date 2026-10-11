# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience is two overlapping groups who land on the site to evaluate Hoàng Đức Duẫn before contacting him:

- **Nhà tuyển dụng / HR / tech lead** đang sàng lọc ứng viên cho vị trí lập trình viên full-time — scan nhanh kỹ năng, dự án, và mức độ "làm được việc" trong vài chục giây.
- **Khách hàng tiềm năng** (công ty nhỏ, startup, cá nhân) đang tìm người nhận freelance/dự án theo hợp đồng — đánh giá năng lực và cách liên hệ.

Both arrive from a CV link, a GitHub profile, or a referral, often on mobile, and decide quickly whether to reach out.

## Product Purpose

A personal portfolio whose job is to convert a skim into a contact: present who the owner is, what he can build, and credible project evidence, then make reaching out effortless. Success = the viewer understands his strengths within one viewport and takes a contact action (email, GitHub, or a future LinkedIn link).

## Positioning

A Full-Stack Developer who ships across an unusually wide span for an early-career engineer: production web platforms (React/Next.js, Angular/NestJS microservices, PostgreSQL, PayOS payments) **and** applied AI/IoT on edge hardware (YOLOv8 → TensorRT on NVIDIA Jetson, computer-vision pipelines, I2C servo control). The through-line a neighboring junior portfolio can't truthfully copy: real, deployed projects that cross the web/AI/hardware boundary.

## Operating Context

- Viewers reach the site from a CV (PDF), the GitHub profile `Duan0603`, or referrals; many on mobile, some skimming between other candidates' sites.
- Content is maintained from a single data file (`lib/data.ts`) that both the site and `info.md` draw from.
- Live project demos are hosted on Vercel; source lives on GitHub.

## Capabilities and Constraints

- **Bilingual (Vietnamese + English).** Audience spans Vietnamese employers/clients and international/remote opportunities; the experience serves both languages through a VI/EN switch in the nav. First-time visitors get Vietnamese when their browser is set to Vietnamese and English otherwise; the choice is remembered. All content lives in both languages in `lib/data.ts`, `lib/skillMeta.ts` and `lib/i18n.ts` — new content must be added in both.
- **Must NOT name the owner's workplace/employer** anywhere on the site or in `info.md`. Projects done there may appear as technical work, with no employer attribution. (Durable, binding constraint.)
- Contact channels shown publicly: email (`hoangduan06032005@gmail.com`) and GitHub. Phone (`0942373736`) is kept. A LinkedIn link may be added later once provided.
- Content is factual-only: no invented testimonials, metrics, employers, or claims beyond what the CV/GitHub support.

## Brand Commitments

- Name shown: **Hoàng Đức Duẫn**. Title: **Full-Stack Developer**. Location: Đà Nẵng, Việt Nam.
- Canonical project list and bios live in `lib/data.ts`; `info.md` is the human-readable source summary.

## Evidence on Hand

- **CV:** `C:\Users\hoang\Downloads\CV_Software_Engineer_HoangDucDuan (1).pdf` (source of bio, education, skills).
- **GitHub:** https://github.com/Duan0603 (CourtMate, courtmate-web, TerraWatch, SDN_EnglishLearning, ResourceAllocationManagementSystem, spotify_clone, and more).
- **Live demos:** CourtMate (https://web-eight-self-61.vercel.app), courtmate-web (https://courtmate-web.vercel.app).
- **Featured projects with detail:** Cinema Ticket Booking Platform, Smart Waste Sorting System, FitnexusApp (https://github.com/chipkiet/FitnexusApp).
- No performance benchmarks, client testimonials, or user counts exist yet — future work must not fabricate them.

## Product Principles

1. **Skim-first.** A recruiter or client must grasp "who + what he builds + proof" within the first viewport, on mobile.
2. **Proof over adjectives.** Lead with real, linkable projects and concrete tech; avoid generic self-praise.
3. **Breadth is the hook.** The web + AI/IoT + hardware span is the differentiator — make it legible, not buried.
4. **One contact action, always reachable.** Never let a convinced viewer hunt for how to get in touch.
5. **Stay factual.** Only claims the CV/GitHub support; no fabricated evidence; employer never named.

## Accessibility & Inclusion

Must be usable and legible on mobile and desktop, with sufficient color contrast (dark theme) and keyboard-navigable links — viewers evaluate quickly and often on phones.
