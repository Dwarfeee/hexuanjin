# Technical Stack Analysis

Original evidence:

- Next.js App Router with Turbopack chunk paths under `/careers-assets/_next/`.
- Tailwind CSS generated utilities.
- React-driven scene state with route prefetches for `/about-us`, `/social`, and `/campus`.
- Canvas layer for procedural pixel effects plus DOM images/video for scene art.
- One self-hosted OTF: `Fusion Pixel 12px Mono zh_hans`.

Clone choices:

- Next.js 16.2.1 App Router, React 19, strict TypeScript.
- Tailwind v4 plus a small global scene stylesheet.
- DOM/CSS scene state machine instead of copying the original canvas implementation.
- Original local font, images, SVGs, and WebM assets.
