# ValuesScene Specification

## Overview
- **Target file:** `src/components/careers/ValuesScene.tsx`
- **Screenshot:** `docs/design-references/careers.kimi.com/original-desktop-scene-04.png`
- **Reference:** `user-detail-values-light-flow.png`.
- **Interaction model:** time-driven looping pixel-flow light.

## Computed Styles
- Section: 1440×900. Background image cover/center.
- Content: x160, width1120, height900; display flex column centered; padding `128px 80px 112px`.
- Center title 24px/32px. Two columns 14px/22px, gap 38px; arrow between columns.
- Background remains pixelated. A full-viewport `/videos/pixel-flow.webm` layer sits above background and below copy, using `object-fit: cover`, grayscale/lighten-style compositing, and no pointer events.

## Text
- Title: “Build Your Own Job”.
- Left: Specialization, Experience, Senquential, Being right, Consensus.
- Right: Generalization, Leaining rate, Scale, Chasing truth, Taste.

## Responsive
At 390px, content uses 24px side padding; artwork crops symmetrically; columns remain side-by-side at 12–13px.

## Assets
`/images/about/bg-about-us.png`, `/videos/pixel-flow.webm`, `/icons/right.svg`.

## Behavior
- Video autoplays, loops, is muted and inline. Its striped rays continuously converge toward the center opening.
- Pause video while scene is inactive; resume when active. Reduced motion seeks to a representative still frame and pauses.
