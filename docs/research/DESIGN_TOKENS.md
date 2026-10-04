# Kimi Careers Design Tokens

## Typography

- Family: `Fusion Pixel 12px Mono zh_hans`, self-hosted OTF, weight 400, style normal, `font-display: swap`.
- Body/nav: 16px / 24px desktop, 14–16px mobile.
- Hero title: 64px / 64px desktop; 24px / 24px mobile.
- Hero subtitle: 40px / 40px desktop; 18px / 22px mobile.
- Section headings: 24–32px desktop, 20–24px mobile.
- Pixel text shadow on hero: `-4px 6px 0 #000` desktop, reduced on mobile.

## Color

- Canvas/background: `#000000`.
- Primary foreground: `#ffffff`.
- Secondary copy: `rgba(255,255,255,.62)`.
- Tertiary copy: `rgba(255,255,255,.42)`.
- Hairlines: `rgba(255,255,255,.15)`.
- Hover inversion: white surface with black text.

## Layout

- Viewport scene: `100svh × 100vw`, clipped.
- Header: 60px high; desktop `padding: 16px 40px`, mobile `padding: 16px 20px`.
- Hero desktop edge inset: 80px; top text at 150px; lower content bottom around 97–139px.
- About content max widths: 1120px values, 1400px exploration.
- Shared scene vertical padding: 128px desktop and 112–128px bottom.
- Shared hint: 58px high, bottom `clamp(22px, 4svh, 32px)`.

## Motion

- Scene transition: 720–900ms, cubic-bezier(.22,1,.36,1).
- Nav color transition: 200ms.
- Mobile menu: 250ms ease-out.
- Continuous float/scan animations: 3–8s alternating/eased.
