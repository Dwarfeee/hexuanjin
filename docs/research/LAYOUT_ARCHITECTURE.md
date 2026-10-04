# Layout Architecture

- App Router server page renders one client-side `SceneDeck`.
- Deck is fixed to the dynamic viewport and prevents document scroll.
- Header is an independent absolute layer over the deck.
- Each scene is an absolute inset layer; only the active scene accepts pointer events.
- Breakpoint is 768px. Desktop scenes use fixed/max-width compositions; mobile scenes use full-width stacks and horizontal overflow where necessary.
- All raster scene art uses `object-fit: cover` plus `image-rendering: pixelated`.
- Layer order: background art (0), atmospheric overlays (1), scene content (10), swipe hint (20), header/menu (40/50).
