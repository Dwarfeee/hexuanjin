# SwipeHint Specification

## Overview
- **Target file:** `src/components/careers/SwipeHint.tsx`
- **Interaction model:** time-driven.

## Computed Styles
- Wrapper: absolute; inset-inline 0; bottom `clamp(22px,4svh,32px)`; height 58px; z-index 20; pointer-events none.
- Content centered; icon 22×22; label 14px/20px; color rgba(255,255,255,.42).

## States & Behaviors
- Enter: opacity 0→1 and translateY(12px)→0.
- Three chevrons pulse upward with 180ms stagger.
- Hidden on final scene and disabled for reduced motion.

## Assets
`/icons/btn-swipe-up.svg`.
