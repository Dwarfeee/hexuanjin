# HeroScene Specification

## Overview
- **Target file:** `src/components/careers/HeroScene.tsx`
- **Screenshot:** `docs/design-references/careers.kimi.com/original-desktop.png`
- **Interaction model:** wheel-driven continuous camera shared with Mission.

## Computed Styles
- Section at 1440×900: 1440×900, position relative, overflow hidden, white on transparent/black.
- Background: absolute inset 0; image 1440×900; object-fit cover; pixelated.
- H1: x 80, y 150, width 400, height 154. Title 64px/64px; subtitle 40px/40px with 10px top gap.
- Right cluster: x 826, y 625, width 534, height 136; right edge 80; title rows 64px/64px.
- Lower-left: x 80, y 697, width 405, height 106; hidden below 768px.

## Text Content
“Moonshot.AI”; “Moonshot AI, bring the light in”; “Join us”; “Build your own job”; “New builder”; “We look forward to building the future of AI with you”.

## Responsive Behavior
- 390×844: background box `128svh × 72svh`, centered at x 50%, y 50svh. H1 x20/y154, title 24px, subtitle 18px. Right cluster x20/right20 near y642, 24px text. Lower-left hidden.

## Assets
`/images/hero/bg-hero.png`.

## Shared Moon
- `HeroScene` deliberately does not own the moon. `SceneDeck` layers the persistent `ProceduralMoonCanvas` over the background, exactly centered at `(50vw, 50svh)`.
- During Hero → Mission, the Hero background scales forward by about 16% and fades while the shared moon grows in place to its Mission radius; the moon does not translate.
