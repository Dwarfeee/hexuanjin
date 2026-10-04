# Interaction Patterns

The deck treats scroll as discrete navigation. It does not use native scroll snapping because the document never becomes taller than the viewport. The clone uses non-passive wheel/touch listeners, a transition lock, and route replacement. Pointer and keyboard navigation remain available.

Hover patterns invert monochrome controls. Motion is intentionally low-frame-rate/pixel-like: stepped transforms, scanlines, grain, and grayscale images. The extracted image/video assets carry most of the original texture; CSS supplies subtle drift, float, and cross-fade behavior.
