---
name: Obsidian Atelier
description: A dark exhibition vault where full-stack work is shown as machined volcanic-glass exhibits under one raking amber light.
colors:
  vault: "#070809"
  vault-2: "#0c0e11"
  obsidian: "#14171c"
  obsidian-hi: "#1d222a"
  steel: "#97a3b0"
  steel-dim: "#5c6670"
  ink: "#eef1f5"
  amber: "#d99a4c"
  amber-bright: "#f2bb6e"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 9vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.68rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.22em"
rounded:
  hairline: "1px"
  sm: "2px"
  md: "3px"
  pill: "999px"
spacing:
  xs: "0.55rem"
  sm: "0.85rem"
  md: "1.5rem"
  lg: "2rem"
  xl: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.vault}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.amber-bright}"
    textColor: "{colors.vault}"
  button-secondary:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0.85rem 1.4rem"
  button-secondary-hover:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.amber-bright}"
  exhibit:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "2rem"
  chip:
    backgroundColor: "{colors.obsidian}"
    textColor: "{colors.steel}"
    rounded: "{rounded.sm}"
    padding: "0.25rem 0.625rem"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.steel}"
    rounded: "{rounded.sm}"
    padding: "0.5rem 0.75rem"
  nav-link-hover:
    textColor: "{colors.ink}"
---

# Design System: Obsidian Atelier

## Overview

**Creative North Star: "The Obsidian Atelier"**

A near-black exhibition vault. The developer's work is not listed; it is mounted — each project is a slab of machined volcanic glass, polished to a cool steel edge, displayed under a single warm raking key light that tracks the visitor's cursor. The world refuses the category-default developer portfolio: no dark-to-purple gradient ground, no neon accent with glowing CSS halos, no row of equal cards, no eyebrow kickers over headings. Breadth (web · AI/vision · edge hardware) reads as a collection of crafted objects, not a feature checklist.

The atmosphere is quiet, dense, and architectural. One obsidian WebGL monolith leads the first viewport; below it the live scene is dimmed so panels stay legible, but ~18% of its motion still shows through the gaps. Material imperfection — micro-dust, fine grain — surfaces only where the cursor-driven light falls, never as a global filter laid over everything. Depth comes from offset-and-blur shadows and lit bevels, never from flat neon glows. The accent is light, not paint: a single warm brass/amber is spent as illumination (a lit plate, a catching edge, a hairline glint), never as a fill across broad surfaces.

Legibility is the floor beneath the drama: secondary text is tinted steel-blue rather than pure gray, headings carry a soft vault-colored text-shadow where they overlay the lit monolith, and `prefers-reduced-motion` strips the choreography to plain, static panels.

**Key Characteristics:**
- Near-black volcanic ground with steel-edged obsidian glass surfaces
- A single warm amber used as raking light, never as a fill
- Machined, architectural type with a true-mono voice reserved for data and labels
- The whole page is one turning column; chapters are its faces, never a grid of cards
- One colorway token set that swaps day/night (nav toggle) while the obsidian identity holds; the interface is bilingual VI/EN

## Colors

A monochrome near-black vault graded from steel-blue neutrals, lit by one warm amber. The palette is engineered so a single token swap (the `day` colorway) can invert light/dark without changing the identity. The `day` colorway is live: the nav's appearance toggle sets `data-colorway="day"` on `<html>` (vault `#e9e6e0`, obsidian `#e0dcd5` / `#ebe8e2`, steel `#4a515a` / `#5c636b`, ink `#16181c`, amber `#8a5412` / `#6f420c`). Colour tokens are defined as channel triplets (`--vault-rgb` …) so opacity modifiers follow the colorway; `--line`, `--line-strong`, `--wash`, `--plate-ink` and `--cast` are derived per colorway. In daylight, additive-blended light (wireframes, particles, constellation lines) is redrawn as dark-amber line with normal blending, because additive light disappears on a pale ground.

### Primary
- **Raking Amber** (#d99a4c): The one accent and the only warm hue. Spent as light — the lit primary plate, section index numbers, the catching edge on an exhibit's top bevel, the cursor-tracked vignette, focus outlines, and `DEMO ↗` links. It is the key light of the room.
- **Amber Flare** (#f2bb6e): The brighter top of the amber gradient and the hover/active state of amber elements — plate top edge, hovered links, the logo dot's highlight.

### Neutral
- **Vault Black** (#070809): The volcanic ground. Page background and the deepest layer behind all glass.
- **Vault Black 2** (#0c0e11): A fractionally lifted ground used in the vault gradient and the deep corner of exhibit surfaces.
- **Obsidian** (#14171c): The base glass of exhibits, cards, and the steel secondary plate.
- **Obsidian Highlight** (#1d222a): The lit top of obsidian gradients — exhibit surfaces, secondary plates, scrollbar thumb.
- **Steel Blue** (#97a3b0): Secondary text and machined labels. The default "quiet" voice; never pure gray.
- **Steel Dim** (#5c6670): Tertiary text, fine dividers, and `#tag` hashes — the faintest legible step.
- **Ink** (#eef1f5): Primary text and headings. Near-white, cool, high-contrast against the vault.

### Named Rules
**The One Light Rule.** There is exactly one accent hue — amber — and it is always light, never paint. Use it for the lit plate, the index numbers, catching edges, focus, and demo links. Never fill a broad surface with amber and never introduce a second accent color.

**The Steel-Blue Rule.** Secondary and tertiary text is tinted steel-blue (#97a3b0 / #5c6670), never neutral gray. Gray reads as a dead portfolio; steel reads as machined glass.

## Typography

**Display Font:** Bricolage Grotesque (with system-ui, sans-serif) — self-hosted via next/font, weights 400–800
**Body Font:** Hanken Grotesk (with system-ui, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, monospace), weights 400–500

**Character:** Bricolage Grotesque is confident and architectural — tightly tracked, heavy at display sizes, it reads like signage milled into stone. Hanken Grotesk keeps body copy warm and quietly legible. JetBrains Mono is the instrument voice, admitted only where there is real data, a spec, or a wayfinding mark.

### Hierarchy
- **Display** (800, clamp(2.9rem, 9vw, 6rem), line-height 0.95, tracking −0.04em): The owner's name in the hero only. The single largest mark in the room.
- **Headline** (600, clamp(2rem, 5vw, 3.4rem), line-height 1.1, tracking −0.03em): The closing contact invitation.
- **Title** (600, text-3xl→4xl / 1.875–2.25rem, tracking −0.03em): Section headings (`Dự án`, `Kỹ năng`) and large featured-project names.
- **Body** (400, 1rem–1.125rem, line-height ~1.65): Hanken Grotesk running copy and project descriptions, held to ~xl/2xl max-widths (≈36–42rem) for a comfortable measure.
- **Label** (400, 0.68rem, letter-spacing 0.22em, UPPERCASE, steel): The `.spec-label` machined caption — "Cuộn", "Điểm nhấn kỹ thuật", skill-group titles. Also the smaller mono marks (index numbers, `CODE ↗` / `DEMO ↗`, `#tags`).

### Named Rules
**The Instrument-Voice Rule.** JetBrains Mono appears only on real data and wayfinding: section index numbers, spec labels, tech tags, repo/demo links, and coordinates. Never set prose or headings in mono.

**The No-Kicker Rule.** Section headings are introduced by a mono index number (`01`, `03`) beside the title, never by an eyebrow/kicker label above the heading. The number is the choreography cue, not a category tag.

## Layout

The page is one object: **the Walk**. A single obsidian column stands in a pinned viewport and each chapter is one of its faces — name, one face per featured project, the repo index, profile, skills, contact (eight faces today; the count follows `lib/data.ts`). Scrolling turns the column: it holds flat on a face, then rotates through the middle of each stop. The front face is always square to the viewer at 1:1 scale, so type stays sharp; the faces ahead and behind show as dim ghosts on the angled sides.

Faces are real HTML placed with CSS 3D (`components/Walk.tsx`); the obsidian is WebGL (`components/Atelier.tsx`). The walk measures the CSS prism in pixels and publishes it through `lib/stage.ts`, and the scene builds the column to the same numbers under the same perspective (`FOV` 42°, camera dead centre). Never move the camera or add a tilt to one side only — the two must share one view.

A face is `min(58vw, 52rem)` wide (`min(90vw, 24rem)` below 700px) and `100svh − 11.75rem` tall. Content is left-aligned, padded `clamp(1.25rem, 6.2cqmin, 3.5rem)`, and type is sized from the face with container units so a chapter always fits it. A rail (right edge on desktop, bottom centre on mobile) shows the current face and turns the column on click; the nav anchors jump to the same stops.

**Fallback.** Without WebGL, with `prefers-reduced-motion`, with no JS, or on a viewport under 640px tall, the same markup is a plain stacked page: one centred 46rem column, faces separated by hairlines.

## Elevation & Depth

Depth is real and physical: offset-plus-blur shadows plus a 1px inset top-light bevel on every lifted surface, as if each slab catches the rake along its leading edge. This system has no flat neon halos — glow is always a lit edge or a soft cast shadow, never a uniform ring of accent color.

### Shadow Vocabulary
- **Exhibit cast** (`box-shadow: 0 1px 0 color-mix(steel 10%) inset, 0 30px 60px -36px rgba(0,0,0,0.95)`): The deep, tight-origin shadow under obsidian exhibit panels, plus the inset steel top-light.
- **Amber plate** (`box-shadow: 0 1px 0 color-mix(amber-bright 70%, white) inset, 0 14px 30px -12px color-mix(amber 60%)`): The lit primary plate — an amber cast that reads as the plate itself emitting warmth. Deepens on hover (`0 22px 44px -14px`, amber 75%).
- **Steel plate** (`box-shadow: 0 1px 0 color-mix(steel 18%) inset, 0 12px 26px -16px rgba(0,0,0,0.9)`): The secondary plate's quieter machined lift.
- **Nav scrim** (`box-shadow: 0 10px 30px -22px rgba(0,0,0,0.9)` + `backdrop-filter: blur(14px) saturate(1.1)`): Appears only after the page scrolls >40px, giving the fixed nav a machined-glass scrim.

### Named Rules
**The Lit-Edge Rule.** Every raised surface carries a 1px inset top highlight (steel or amber) as if the rake catches its leading edge. Depth is a cast shadow plus a lit bevel — never a flat uniform glow ring.

**The Rake-Response Rule.** The accent-lit vignette, the exhibit's top-edge glint (opacity 0.5 → 1 on hover), and the tilt glass sheen all wake on proximity/hover. Light responds to the visitor; it is not painted on at rest.

## Shapes

Hard, machined, nearly-square corners. Radii are tiny and deliberate: **2px** (`rounded-[2px]`) on plates, tags, nav links, and the logo mark; **3px** (`rounded-[3px]`) on exhibit panels; **1px** on the logo dot. The only full-round is the scrollbar thumb (`999px`). The silhouette language is the rectangular slab — a cut block of glass, not a soft pill.

Borders are hairlines built from `color-mix` of steel at very low alpha (10–22%) or `white` at 5–6%, often as gradient hairlines (`.hairline`, the exhibit top edge) that fade at both ends so an edge appears milled rather than drawn. Dividers are 1px steel-dim rules or faded gradients, never heavy strokes.

## Components

### Buttons
- **Shape:** Near-square (2px radius), inline-flex with a `0.55rem` gap for a trailing mono arrow.
- **Primary (`.plate`):** A lit amber slab — vertical gradient `amber-bright → amber`, vault-black text, weight 600, padding `0.85rem 1.5rem`, inset top highlight plus amber cast shadow. "Xem dự án", "Gửi email".
- **Secondary (`.plate-steel`):** A machined obsidian slab — gradient `obsidian-hi → obsidian`, ink text, 1px steel border at 22% alpha. "GitHub".
- **Hover / Focus:** Both rise `translateY(-2px)` over `0.5s cubic-bezier(0.16,1,0.3,1)`; the primary deepens its amber cast, the secondary's border shifts toward amber (55%) and its text to amber-bright. Focus-visible draws a `1.5px` amber outline at `3px` offset.

### Chips (tech tags)
- **Style:** Mono, ~0.72–0.8rem, 2px radius. Two variants observed: a bordered chip (`border white/5`, `bg white/[0.02]`, steel or ink/90 text) for featured and skill tags, and a borderless `#tag` in steel-dim for the compact repo cards.
- **State:** Static, non-interactive — labels, not controls.

### Faces and rows (there are no cards)
- **No boxes.** Content sits directly on the obsidian. Nothing has its own background, border box, or shadow; the block is the only container.
- **Rows** are a hairline and the space under it (`border-line`). `.lit-row` adds the rake response: an amber hotspot on the hairline and a soft pool of light that follow the pointer.
- **Tags** run as one line of mono text separated by slashes (`.tag-run`), not as chips.
- **Skills face** is cut into seven strips (`.strip`): a heading strip and one per skill group. On this face the column splits into slabs along the same lines and amber light shows in the seams; the seam under the hovered or selected group brightens. Selecting a skill shows what it was used for in the heading strip.

### Navigation
- Fixed, transparent at rest; gains `.nav-scrolled` (vault scrim at 72% + `blur(14px) saturate(1.1)` + hairline bottom border) after 40px of scroll, transitioning over 500ms. Links are steel mono-weight text that brighten to ink on hover; the mobile compact link is amber ("LIÊN HỆ ↗"). The brand mark pairs a tiny amber gradient dot with the name in display.

### Signature: The Walk
One obsidian column carries the whole site (see Layout). `.atelier-stage` is the fixed WebGL backdrop — the column, dust in the light, offcut shards either side — with a CSS-vault fallback (`radial-gradient` rake + grain masked to the cursor). The amber rake is a spotlight that sweeps the front face with the pointer; a cool steel light runs down the right-hand faces. In the day colorway the block becomes pale honed stone so ink keeps its contrast. The turn is the one authored motion on the page: no per-section entrance animations.

## Do's and Don'ts

### Do:
- **Do** spend amber only as light — a lit plate, a catching edge, an index number, a focus ring. One accent hue, always.
- **Do** tint secondary text steel-blue (#97a3b0 / #5c6670), never pure gray.
- **Do** keep content on the block itself: hairline rows, no cards. Depth belongs to the column and to the plates (buttons), with corners at 2px.
- **Do** reserve JetBrains Mono for real data, specs, index numbers, and wayfinding marks.
- **Do** tie material imperfection and light response to interaction (cursor/hover/proximity), and honor `prefers-reduced-motion` with static fallbacks.
- **Do** ease every motion with `cubic-bezier(0.16, 1, 0.3, 1)` (exponential ease-out).

### Don't:
- **Don't** introduce a second accent color, neon glow rings, or a dark-to-purple gradient ground.
- **Don't** set an eyebrow/kicker label above a heading. Position in the sequence is shown by the rail, not by numbers on the faces.
- **Don't** wrap content in cards or panels, and don't add entrance animations to individual sections — the turn of the column is the motion.
- **Don't** fill broad surfaces with amber or set prose/headings in mono.
- **Don't** apply grain or imperfection as a global always-on filter; it surfaces only where the rake falls.
- **Don't** use soft/pill radii on content surfaces (the 999px round is scrollbar-only) — the silhouette is a machined slab.
