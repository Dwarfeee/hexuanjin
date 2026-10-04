# ProcessScene Specification

## Overview
- **Target file:** `src/components/careers/ProcessScene.tsx`
- **Screenshots:** `original-desktop-scene-07.png`, `user-detail-process-orbit.png`.
- **Interaction model:** continuous ellipse orbit with hover pause.

## Computed Styles
- Section: 1440×900; same exploration background.
- Content: width1440, min-height900; padding `128px 0`.
- Heading centered at top, 24px/32px.
- Orbit occupies about 600×280 centered. Four step circles render at 120px with 80px orbital item boxes. Virtual ellipse: base 1200, radiusX 350, radiusY 120, rotation -8°.
- Mobile: steps form a 2×2 arrangement with smaller 92px circles.

## Behaviors
- Replace independent floating with one 20s linear ellipse loop. Preserve equal spacing with reversed fill order and keep images upright.
- Hover/focus scales item to 1.3 with spring-like motion (`stiffness 300`, `damping 20`) and pauses the entire orbit. Leaving resumes at same progress.
- Hovered step displays its detail card; keyboard focus matches hover. Reduced motion freezes orbit but preserves focus/hover details.

## Assets
`/icons/ring.svg`, `/images/about/process/step1.png` … `step4.png`.
