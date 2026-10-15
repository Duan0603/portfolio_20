---
title: 'Smooth road and streetlamp edges'
type: 'bugfix'
created: '2026-10-16'
status: 'done'
route: 'one-shot'
---

# Smooth road and streetlamp edges

## Intent

**Problem:** Thin streetlamp silhouettes, lane markings and shadows show visible stair steps in the coastal scene.

**Approach:** Apply SMAA after tone mapping. Increase directional shadow resolution from 2048 to 4096 for viewports at least 900 CSS pixels wide, retaining 2048 on smaller screens and the existing pixel ratio cap. Reallocate the shadow target when crossing the breakpoint.

## Suggested Review Order

1. [World.tsx](../components/world/World.tsx) — Inspect the responsive shadow size and target cleanup in Rig, then the final SMAA effect in World. Confirm lane markings and lamp edges in daylight and at night, including a resize across 900px.
