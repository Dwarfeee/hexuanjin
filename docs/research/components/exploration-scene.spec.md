# ExplorationScene Specification

## Overview
- **Target file:** `src/components/careers/ExplorationScene.tsx`
- **Screenshot:** `docs/design-references/careers.kimi.com/original-desktop-scene-06.png`
- **Reference:** `user-detail-exploration-hover.png`.
- **Interaction model:** entrance count-up plus per-card hover pixel reveal.

## Computed Styles
- Section: 1440×900; background `#000 url(bg-exploration.png) center bottom / cover no-repeat`.
- Content: x20, width1400, height900, `padding:128px 56px`, flex column, justify-between.
- Desktop metrics: five equal columns, 24px gaps. Values 48px/56px; title 16px/22px; body 14px/20px rgba(255,255,255,.42). Default artwork is hidden and the number occupies its square.
- Mobile: horizontally scrollable card rail with snap points.

## Content
Targets: 300, 180, 1%, 17, 5. Titles and descriptions are copied verbatim from the extracted `TECH_STACK`/DOM research: Solve complex problems; Global from day one; 1% of resources, beyond 100% of results; Young voices, equal weight; Offices in 5 global cities.

## Assets
`/images/about/bg-exploration.png`, `/images/about/process/explore-1.png` … `explore-5.png`.

## States & Behaviors
- Each metric owns a square reveal area. Desktop hover/focus replaces numeric value with image; leave restores value. Only one desktop card is active.
- Reveal/conceal uses a 40×40 black pixel grid over 200ms: deterministic-random stagger covers content, content swaps at midpoint, then pixels disappear in another random stagger. No simple opacity fade.
- Mobile uses tap-to-toggle and horizontal snap scrolling.
- Count-up remains one-time ~1s entrance; reduced motion shows final values and completes swaps without stagger.
