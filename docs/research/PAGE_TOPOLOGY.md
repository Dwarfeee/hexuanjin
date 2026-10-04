# Kimi Careers Page Topology

Target: `https://careers.kimi.com/`

The site is a fixed-height scene deck, not a document-scrolling page. `main` is `height: 100svh; overflow: hidden; background: #000`. Wheel, trackpad, and vertical touch gestures advance a single scene at a time. The original updates the URL as the deck crosses route groups.

1. **Hero** (`/`) — full-bleed pixel moon background, four text clusters, scroll hint.
2. **Mission** (`/`) — procedural/canvas moon mark with the sentence “Seeking the optimal path from energy to intelligence”.
3. **Land on** (`/` → `/land-on`) — moon horizon and three recruitment/brand entry buttons.
4. **Values** (`/about-us`) — “Build Your Own Job” with two opposing value columns.
5. **Odyssey** (`/about-us`) — desktop vertical image reel plus story copy; mobile uses one timeline card at a time.
6. **Exploration** (`/about-us`) — five metrics on a pixel landscape.
7. **Application process** (`/about-us`) — four circular step images connected by a dotted orbit.
8. **Finale** (`/about-us`) — centered recruitment CTA above a product/hiring footer.

Persistent layers:

- Header: absolute `top: 0`, `z-index: 40`; desktop navigation at 1440px, mobile hamburger below 768px.
- Scene surface: one scene mounted at a time, full viewport, cross-fades/slides during transitions.
- Swipe hint: bottom centered, 58px high, hidden on the final scene.
- Pointer: custom 32px retro cursor for default and interactive states.

Route mapping for the clone: scenes 0–1 use `/`, scene 2 uses `/land-on`, scenes 3–7 use `/about-us`. The browser history is replaced during wheel navigation so repeated scrolling does not flood history.
