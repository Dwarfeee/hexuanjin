# Kimi Careers Behaviors

## Interaction model

- Primary model: wheel/trackpad and vertical swipe driven scene state machine.
- One input advances one scene; inputs remain locked until the current transition settles.
- Desktop wheel delta is interpreted by sign; mobile touch uses a ~44px minimum vertical travel.
- Keyboard equivalents: ArrowDown/PageDown/Space advance; ArrowUp/PageUp reverse.
- The original keeps the outgoing and incoming scenes mounted together and drives complementary `clip-path: polygon(...)` masks from one normalized progress value. Early lunar scenes use an angled boundary; the About sequence uses a horizontal boundary.
- Progress is advanced by `requestAnimationFrame` with smoothstep easing. Early lunar scene changes use approximately 2470ms; transitions entering or leaving the About sequence use 800ms.
- About-sequence transitions add a fixed 2D Canvas at the top visual layer. It draws a 12px grid of randomized monochrome characters along a noisy sine-wave boundary. This is procedural code, not MP4/WebM media.
- The extracted `pixel-flow.webm` is scene background media for later content and does not implement page transitions.
- Header persists while all scene content changes underneath it.

## Navigation

- Logo returns to scene 0.
- “About us” jumps to scene 3; “Hiring process” jumps to scene 6.
- “Join us” opens the external Mokahr jobs page.
- “Kimi K3” opens the external Kimi product article.
- Desktop nav hover/focus: foreground `rgb(255,255,255)` on transparent → foreground `rgb(0,0,0)` on `rgb(255,255,255)`, 200ms.
- Mobile hamburger reveals a full-width black menu beneath the 60px header. Container changes `opacity: 0; scaleY(0)` → `opacity: 1; scaleY(1)` over 250ms; rows stagger from `opacity: 0; translateY(-8px)`.

## Scene-specific motion

- One procedural moon canvas remains mounted across Hero, Mission, and Land-on. Its camera moves continuously from the small centered hero moon, through the large Mission moon, to the oversized lower-left Land-on moon.
- The moon rotates at roughly `0.18rad/s`. Its quantized crater pixels also shimmer over time. The hero starts close to fully lit, while Mission and Land-on reduce the lit fraction; avoid a fixed lower-right spotlight and broad radial halo.
- Mission types the extracted pixel logo into the center and lays “Seeking the optimal path from energy to intelligence” character-by-character on a 180px circular arc.
- Land-on buttons swap to extracted `_hover.svg` assets on hover/focus.
- Values places `pixel-flow.webm` above its static texture so horizontal pixel-light bands repeatedly converge toward the center.
- Odyssey's desktop film reel loops upward at roughly 45px/s. Hovering a frame pauses the reel, and every frame is a button that selects its own story; drag and wheel continue to work inside the reel.
- Exploration metrics count from zero when the scene enters. Their artwork stays hidden until hover/focus (or mobile tap), then appears through randomized 40×40 pixel-cell cover/uncover wipes over about 200ms.
- Application step icons share one 20s linear elliptical orbit, pause while hovered, and enlarge the hovered icon while preserving its upright orientation.
- `prefers-reduced-motion: reduce` disables continuous motion and makes scene transitions immediate.

## Responsive sweep

- 1440×900: header 40px horizontal inset and 16px top inset; all desktop navigation visible.
- 768×900: desktop navigation remains compact; content uses reduced side padding.
- 390×844: header inset 20px, hamburger visible, desktop nav hidden. Hero background becomes a `128svh × 72svh` crop centered near `50svh`. About/metrics/process layouts stack or become horizontally scrollable.
