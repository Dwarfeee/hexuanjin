# LandOnScene Specification

## Overview
- **Target file:** `src/components/careers/LandOnScene.tsx`
- **Screenshot:** `docs/design-references/careers.kimi.com/original-desktop-scene-03.png`
- **Reference:** `user-detail-land-on-moon.png`.
- **Interaction model:** scroll-driven moon landing plus hover/focus links.

## Layout
- Full black viewport with the same procedural moon from Hero/Mission expanded into a lower-left horizon. No independent CSS-gradient moon and no CSS radial-gradient star dots (both removed).
- Background stars/nebula come from `StarfieldCanvas` (`src/components/careers/StarfieldCanvas.tsx`), rendered behind the buttons and caption.
- During Mission→Land-on, interpolate shared Canvas camera from progress 1 to 2; end near x25vw/y110svh desktop with ~43vw radius (max 700px).
- Three buttons form one centered row at y≈425, each 200×52 desktop; mobile stacks/overlaps them around center.
- Caption bottom center: 14px, rgba(255,255,255,.42), “Learn about Moonshot AI”.

## Starfield (StarfieldCanvas)
- Ported 1:1 from the careers.kimi.com land-on bundle (module 44382). Do not re-tune constants by eye; re-verify against the bundle instead.
- Backing store is a fixed 280px-wide canvas (height from viewport aspect, min 60×40) scaled up with `image-rendering: pixelated`, so dithering and stars read as chunky pixel art.
- Nebula intensity = gaussian blob chain (9 blobs forming the milky-way band, y≈0.38–0.62) × fBm value-noise layers (4×/9×/22×) + a weak horizontal band, raised to 1.15 and normalized to max 1.05.
- Rendering dithers intensity through the 8×8 Bayer matrix (entries are n/64 — forgetting the /64 pushes nearly every pixel to max alpha and washes the scene out) into 5 alpha levels, white pixels only.
- Stars: background tier ≈ w·h·0.014 with brightness tiers 1/0.85/0.6/0.4/0.22 and rare 5-point crosses; twinkle set ≈ 0.16·min(w,h); sparkles only inside nebula intensity > 0.18. Animation runs on rAF with shimmer fields.
- Steady state (verified live): opacity 0.72, filter `brightness(0.62) contrast(1.08)` via `--land-on-nebula-*` variables; defaults match those values.
- Moon clearance: the shared moon canvas sits above the scene layers with `mix-blend-screen`, so without a mask the nebula shows through the dark moon body and reads as floating in front of it. StarfieldCanvas therefore applies a radial `mask-image` that clears the field inside the land-on rest moon disc (position/radius mirrored from ProceduralMoonCanvas progress 2) with a soft feather, so the nebula recedes behind the moon. This mirrors the original's `--land-on-nebula-moon-clearance`.
- Respect `prefers-reduced-motion`: render a single static frame instead of animating.

## States
- Each control swaps normal SVG to extracted hover SVG on hover/focus; transition 120ms.
- Land-on nebula/interface may fade in as the moon approaches. The shared moon must never crossfade into another asset.
- Destinations: campus `/campus`, brand scene index 3, experienced hiring `/social`.

## Assets
`/images/land-on/{campus,know,social}.svg` and `*-hover.svg`.
