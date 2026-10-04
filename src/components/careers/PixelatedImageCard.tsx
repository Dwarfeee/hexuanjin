"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";

interface PixelatedImageCardProps {
  firstContent: ReactNode;
  secondContent: ReactNode;
  gridSize?: number;
  pixelColor?: string;
  animationStepDuration?: number;
  once?: boolean;
  aspectRatio?: string;
  className?: string;
  style?: CSSProperties;
  isActive?: boolean;
  onActiveChange?: (active: boolean) => void;
  disablePointerHandlers?: boolean;
}

const subscribeToTouchChange = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => {};
  }
  window.addEventListener("pointerdown", callback);
  return () => window.removeEventListener("pointerdown", callback);
};

const getTouchSnapshot = () =>
  typeof window === "undefined"
    ? false
    : "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(pointer: coarse)").matches;

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    const swap = result[swapIndex];
    if (current === undefined || swap === undefined) {
      continue;
    }
    result[index] = swap;
    result[swapIndex] = current;
  }

  return result;
}

export function PixelatedImageCard({
  firstContent,
  secondContent,
  gridSize = 7,
  pixelColor = "currentColor",
  animationStepDuration = 0.3,
  once = false,
  aspectRatio = "100%",
  className = "",
  style = {},
  isActive,
  onActiveChange,
  disablePointerHandlers = false,
}: PixelatedImageCardProps) {
  const pixelLayerRef = useRef<HTMLDivElement>(null);
  const activeLayerRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<number[]>([]);
  const isControlled = isActive !== undefined;
  const [internalActive, setInternalActive] = useState(false);
  const active = isControlled ? isActive : internalActive;
  const isTouch = useSyncExternalStore(
    subscribeToTouchChange,
    getTouchSnapshot,
    () => false,
  );

  useEffect(() => {
    const pixelLayer = pixelLayerRef.current;

    if (!pixelLayer) {
      return;
    }

    pixelLayer.innerHTML = "";

    for (let row = 0; row < gridSize; row += 1) {
      for (let column = 0; column < gridSize; column += 1) {
        const pixel = document.createElement("div");
        const size = 100 / gridSize;

        pixel.classList.add("pixelated-image-card__pixel");
        pixel.style.backgroundColor = pixelColor;
        pixel.style.width = `${size}%`;
        pixel.style.height = `${size}%`;
        pixel.style.left = `${column * size}%`;
        pixel.style.top = `${row * size}%`;
        pixelLayer.appendChild(pixel);
      }
    }
  }, [gridSize, pixelColor]);

  const runAnimation = useCallback(
    (nextActive: boolean) => {
      const pixelLayer = pixelLayerRef.current;
      const activeLayer = activeLayerRef.current;

      if (!pixelLayer || !activeLayer) {
        return;
      }

      const pixels = Array.from(
        pixelLayer.querySelectorAll<HTMLElement>(
          ".pixelated-image-card__pixel",
        ),
      );

      if (pixels.length === 0) {
        return;
      }

      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
      pixels.forEach((pixel) => {
        pixel.style.display = "none";
      });

      const perPixel = animationStepDuration / pixels.length;

      shuffle(pixels).forEach((pixel, index) => {
        timersRef.current.push(
          window.setTimeout(() => {
            pixel.style.display = "block";
          }, index * perPixel * 1000),
        );
      });

      timersRef.current.push(
        window.setTimeout(() => {
          activeLayer.style.display = nextActive ? "block" : "none";
          activeLayer.style.pointerEvents = nextActive ? "none" : "";
        }, animationStepDuration * 1000),
      );

      shuffle(pixels).forEach((pixel, index) => {
        timersRef.current.push(
          window.setTimeout(() => {
            pixel.style.display = "none";
          }, (animationStepDuration + index * perPixel) * 1000),
        );
      });
    },
    [animationStepDuration],
  );

  const previousActiveRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (previousActiveRef.current === null) {
      previousActiveRef.current = active;
      if (active) {
        runAnimation(true);
      }
      return;
    }

    if (previousActiveRef.current !== active) {
      previousActiveRef.current = active;
      runAnimation(active);
    }
  }, [active, runAnimation]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const setActive = (next: boolean) => {
    if (isControlled) {
      onActiveChange?.(next);
    } else {
      setInternalActive(next);
    }
  };

  const activate = () => {
    if (!active) {
      setActive(true);
    }
  };

  const deactivate = () => {
    if (active && !once) {
      setActive(false);
    }
  };

  const interactive = !disablePointerHandlers;

  return (
    <div
      className={`pixelated-image-card ${className}`}
      style={style}
      onMouseEnter={interactive && !isTouch ? activate : undefined}
      onMouseLeave={interactive && !isTouch ? deactivate : undefined}
      onClick={
        interactive && isTouch
          ? () => {
              if (active) {
                deactivate();
              } else {
                setActive(true);
              }
            }
          : undefined
      }
      onFocus={interactive && !isTouch ? activate : undefined}
      onBlur={interactive && !isTouch ? deactivate : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div style={{ paddingTop: aspectRatio }} />
      <div className="pixelated-image-card__default" aria-hidden={active}>
        {firstContent}
      </div>
      <div
        className="pixelated-image-card__active"
        ref={activeLayerRef}
        aria-hidden={!active}
      >
        {secondContent}
      </div>
      <div className="pixelated-image-card__pixels" ref={pixelLayerRef} />
    </div>
  );
}
