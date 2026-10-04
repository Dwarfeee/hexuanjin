# PixelTransition Specification

## Overview
- **Target file:** `src/components/careers/PixelTransition.tsx`
- **Screenshot:** `docs/design-references/careers.kimi.com/original-desktop-scene-04.png`
- **Interaction model:** wheel/touch/keyboard-driven transition progress, rendered in real time.

## DOM Structure
When `0 < progress < 1`, render a fixed, pointer-events-disabled overlay at the highest visual layer. The overlay contains one full-viewport `<canvas>`. Render nothing at the settled endpoints.

## Computed Styles (exact values from the original runtime)

### Overlay
- position: `fixed`
- inset: `0`
- pointer-events: `none`
- z-index: `9999` on the original; use the clone's highest transition layer.

### Canvas
- position: `absolute`
- inset: `0`
- width: `100%`
- height: `100%`
- image-rendering: `pixelated`
- 2D context with a DPR-scaled backing store.

## States & Behaviors

### Character wave
- **Trigger:** scene transition where either scene is in the About sequence (indexes 3–7).
- **Progress:** normalized `0 → 1`; reverse the vertical travel for backward navigation.
- **Grid:** 12 CSS pixels per cell.
- **Font:** `12px 'Fusion Pixel 12px Mono zh_hans', monospace` multiplied by device pixel ratio.
- **Characters:** `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*`.
- **Colors:** `rgb(255,255,255)`, `rgb(150,150,150)`, `rgb(80,80,80)`.
- **Wave center:** vertical position follows transition direction. Horizontal perturbation combines two sine waves, matching the original irregular edge.
- **Band:** solid core approximately 72px from the wave center and a noisy falloff approximately 130px beyond it.
- **Envelope:** fade in over the first 30% and fade out over the final 30% using smoothstep.
- **Animation:** draw on every `requestAnimationFrame`; clear the canvas before each frame.
- **Random state:** stable for the duration of one scene transition and regenerated when the active scene changes.

### Reduced motion
- When `prefers-reduced-motion: reduce`, do not mount the canvas overlay.

## Assets
N/A. This is procedural Canvas rendering; it is not MP4/WebM media.

## Text Content
N/A. Characters are decorative and the canvas is `aria-hidden`.

## Responsive Behavior
- **Desktop (1440px):** 12px grid at full viewport size.
- **Tablet (768px):** same grid and formulas.
- **Mobile (390px):** same grid; DPR backing store remains capped by the browser's actual DPR.
- Recompute canvas dimensions on `ResizeObserver` changes.
