# SceneDeck Specification

## Overview
- **Target file:** `src/components/careers/SceneDeck.tsx`
- **Screenshot:** `docs/design-references/careers.kimi.com/original-desktop-scene-01.png`
- **Interaction model:** wheel, touch, and keyboard driven.

## DOM Structure
`main[aria-label="Kimi careers scenes"]` contains the settled scene or both the outgoing and incoming scenes during navigation, the persistent header, and the procedural pixel-transition overlay.

## Computed Styles
- Main: `position: relative; width: 100vw; height: 100svh; overflow: hidden; background: rgb(0,0,0); color: rgb(255,255,255)`.
- Scene layer: `position: absolute; inset: 0; min-height: 100svh`.

## States & Behaviors
- Input sign selects previous/next scene and clamps at 0/7.
- Keep both scenes mounted until progress reaches 1. The outgoing and incoming layers use complementary `clip-path: polygon(...)` values so the new scene is revealed across one shared boundary.
- Scene transitions use `requestAnimationFrame` and smoothstep easing. Hero/Mission lasts approximately 2470ms to match the original multi-stage camera travel; Mission/Land-on lasts 1750ms. Any transition entering or leaving the About sequence lasts 800ms.
- About-sequence transitions add the full-viewport `PixelTransition` character wave. Mission/Land-on retains the angled wipe plus scale motion.
- Hero/Mission is a dedicated continuous-camera transition: both scene backgrounds crossfade, Hero copy dismisses early, Mission copy enters late, and one persistent `ProceduralMoonCanvas` interpolates radius, light, and rotation from Hero to Mission while staying exactly viewport-centered. No clip boundary is used for this pair.
- The shared moon remains visible on settled scenes 0 and 1, and fades with Mission when navigating between Mission and Land-on.
- Lock new navigation input for the complete animation and release it only after the target scene settles.
- Touch minimum distance: 44px. Keyboard: arrows, PageUp/PageDown, Space.
- Route replacement: 0–1 `/`, 2 `/land-on`, 3–7 `/about-us`.
- `prefers-reduced-motion: reduce` settles immediately without Canvas or clip animation.

## Responsive Behavior
Same state machine at all widths; viewport uses `svh` to avoid mobile browser chrome jumps.
