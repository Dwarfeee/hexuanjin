# MissionScene Specification

## Overview
- **Target file:** `src/components/careers/MissionScene.tsx`
- **Screenshot:** `docs/design-references/careers.kimi.com/original-desktop-scene-02.png`
- **Reference:** `user-detail-mission-logo-arc.png`.
- **Interaction model:** time-driven copy entrance after the Hero camera push.

## Computed Styles
- Section: 1440×900; black; clipped.
- Shared procedural moon remains behind copy, exactly centered at `(50vw, 50svh)` with a radius of `154px * stageScale` (154px at a 1440-wide stage); the arc sits just outside the lunar edge.
- Composition uses a `1440 / 810` virtual stage centered in viewport; stage width is `min(calc(100svh * 1440 / 810), max(100vw, 1440px))`.
- Pixel logo `/icons/logo-pixel.svg` is `14.4444%` stage width, centered and shifted 20px left.
- Arc text follows a 180px radius around `(720,405)`. Characters cover `-94°` through `16°`; each rotates by angle + 90°. Font 18px Fusion Pixel; fill rgba(255,255,255,.86).

## Behavior
- Copy enters from `opacity 0; translateY(10px); scale(.96)` over the final 34% of Hero→Mission.
- Arc types in at 42ms per character. Navigating back dismisses copy and reverses the same camera path.

## Text
`Moonshot.AI`; `Seeking the optimal path from energy to intelligence`.

## Assets
`/icons/logo-pixel.svg`; the moon is generated in code.
