# OdysseyScene Specification

## Overview
- **Target file:** `src/components/careers/OdysseyScene.tsx`
- **Screenshots:** `original-desktop-scene-05.png`, `user-detail-odyssey-reel.png`.
- **Interaction model:** time-driven reel; click-driven timeline markers.

## Computed Styles
- Section: 1440×900, black.
- Desktop stage: display flex, width1440, min-height900. Left reel ≈480px; right copy begins ≈840px.
- Reel inner track starts at x47px, is 432px wide, uses repeated film-strip background, and contains 296×220 image buttons separated by 24px.
- Main heading about 24px/28px; body 14px/24px, max-width 440px; faint code texture behind.
- Mobile: desktop stage hidden; one card and its heading/body shown with 20px side padding.

## Content
Timeline labels: Spring 2023; October 2023; 2024; Spring 2025; June 2025; July 2025; September 2025; December 2025; January 2026; March 2026; March 2026.
Mobile first item: “Spring 2023 | Moonshadow Stirs” and “Moonshot AI was officially founded. In pursuit of AGI, we set out for the far side of the moon.”

## Assets
`/images/about/process/01.png` through `11.png`, phone variants, `/videos/pixel-flow.webm`.

## States & Behaviors
- Duplicate the 11-item track for a seamless vertical loop. Advance upward at `0.045px/ms` (45px/s) with rAF; normalize after one list height.
- Hover/focus over any frame pauses immediately; leave resumes. Wheel/pointer drag inside reel moves the track without changing scenes.
- Every frame is a button. Hover overlays its date; click selects the milestone and updates the right-side detail while keeping the frame highlighted/paused.
- Mobile uses a horizontal draggable snapping duplicate rail; clicking selects a card.
- Reduced motion disables automatic travel but preserves click/drag selection.
