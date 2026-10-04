# SiteHeader Specification

## Overview
- **Target file:** `src/components/careers/SiteHeader.tsx`
- **Screenshot:** `docs/design-references/careers.kimi.com/original-mobile-scene-01.png`
- **Interaction model:** click/hover.

## Computed Styles
- Desktop wrapper: `position:absolute; inset:0 0 auto; z-index:40; height:60px; padding:16px 40px`.
- Brand image: `height:28px; width:auto`.
- Desktop nav: `display:flex; align-items:center; justify-content:space-between; font-size:16px; line-height:24px`.
- Items: `padding:2px 4px; color:#fff; transition: color/background 200ms`.
- Mobile wrapper: `padding:16px 20px`; brand height 28px; menu button 32×32.

## States & Behaviors
- Hover/focus: background `#fff`, text `#000`.
- Mobile menu panel below header: black, width 100%, transform-origin top, opacity/scale transition 250ms.
- Rows: 20px horizontal and vertical padding; 1px top border rgba(255,255,255,.15).

## Assets
`/icons/join-us-logo.svg`, `/icons/hamburg.svg`.
