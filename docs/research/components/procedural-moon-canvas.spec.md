# ProceduralMoonCanvas Specification

## Overview
- **Target file:** `src/components/careers/ProceduralMoonCanvas.tsx`
- **References:** `original-desktop.png`, `original-desktop-scene-02.png`, `original-mobile-scene-01.png`, and `original-mobile-scene-02.png` under `docs/design-references/careers.kimi.com/`.
- **Purpose:** render one persistent, code-generated pixel moon shared by the Hero and Mission scenes.

## Public API
```ts
interface ProceduralMoonCanvasProps {
  cameraProgress: number;
  opacity: number;
}
```
- `cameraProgress` is clamped to 0–2. `0` is Hero, `1` is Mission/eclipsed copy, and `2` is the giant lower-left Land-on moon.
- `opacity` is clamped to 0–1. Keep it at 1 through scenes 0–2 so one moon persists across all three scenes.

## Canvas and Rendering
- Client component with one full-viewport, pointer-events-none Canvas.
- Canvas backing size follows CSS size and device pixel ratio, capped at 2. `imageSmoothingEnabled` must remain false.
- Generate the moon in code; do not use images, video, SVG, or remote resources.
- Use deterministic seeded value noise (seed 42) and deterministic crater placement (seed 9215) so the surface is stable across reloads.
- Quantize grayscale lighting into six levels and apply a 4×4 Bayer threshold so the silhouette and terminator read as deliberate pixel art.
- Draw at a coarse logical pixel scale and enlarge with nearest-neighbor rendering.
- Do not draw a broad radial halo. Any aura must stay within roughly 8% of the radius and below 5% opacity.
- Match the original lighting: normalized light vector `(cos(35°), -sin(35°), .35)`, six grayscale levels, contrast 1, dither .6, and 4px logical pixels.
- Interpolate `litFraction` from about `1` at Hero to `.48` at Mission. Hero must show an evenly readable crater field instead of a bright point-light crescent. Land-on settles near `.54`.
- Rotate texture at approximately `.18rad/s`. Add restrained temporal quantization shimmer so dark crater pixels and a small number of highlights cross thresholds over time; silhouette and overall lighting must not pulse.

## Camera Path
- Interpolate with smoothstep.
- Decoded from the live site bundle: the moon stays exactly at viewport center `(50vw, 50svh)` in both Hero and Mission; only the radius animates between them.
- Hero radius: `height * (0.68 * 0.42 / 4.8)` ≈ 5.95% of viewport height (about 54px at 900 height).
- Mission radius: `154px * stageScale`, where `stageScale = min(1440 * height / 810, max(width, 1440)) / 1440` — the same 1440×810 virtual stage used by the Mission copy. At a 1440-wide stage the radius is exactly 154px.
- Mobile uses the identical formulas; at 390×844 the Mission radius settles at 154px.
- Desktop Land-on: center near `(25vw, 110svh)` with radius around `43vw`, clamped to 700px, so only the upper-right lunar horizon is visible in the lower-left.
- Mobile Land-on: center near `(-10vw, 102svh)` with radius around `72vw`.
- The path should have slight forward-camera overshoot near the last quarter, but must settle exactly on the Mission position.

## Motion and Accessibility
- `requestAnimationFrame` while scenes 0–2 are visible; render rotation and shimmer from elapsed time.
- Respect `prefers-reduced-motion`: retain a static deterministic frame and let SceneDeck settle navigation immediately.
- Resize via `ResizeObserver` or window resize; clean up animation frames and listeners on unmount.
- Mark the Canvas `aria-hidden="true"`.

## Performance
- Cache the noise/crater data for the component lifetime.
- Keep per-frame allocation low and avoid full-viewport pixel iteration; only render the moon's bounded offscreen raster then composite it.
