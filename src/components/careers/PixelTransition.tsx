"use client";

import { useEffect, useRef, useState } from "react";

const CELL_SIZE = 12;
const CORE_RADIUS = 72;
const FALLOFF_RADIUS = 130;
const CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*";
const COLORS = [
  "rgb(255,255,255)",
  "rgb(150,150,150)",
  "rgb(80,80,80)",
] as const;

interface PixelTransitionProps {
  progress: number;
  direction: "forward" | "backward";
  activeIndex: number;
  enabled?: boolean;
}

interface CanvasSize {
  width: number;
  height: number;
  dpr: number;
}

interface CellState {
  characterIndex: number;
  colorIndex: number;
  edgeOffset: number;
  threshold: number;
}

function clamp(value: number, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value));
}

function smoothstep(edgeStart: number, edgeEnd: number, value: number) {
  const normalized = clamp((value - edgeStart) / (edgeEnd - edgeStart));
  return normalized * normalized * (3 - 2 * normalized);
}

function createRandom(seed: number) {
  let state = (seed >>> 0) || 0x9e3779b9;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4_294_967_296;
  };
}

function createCellStates(count: number, activeIndex: number) {
  const seed = ((activeIndex + 1) * 2_654_435_761) ^ (count * 2_246_822_519);
  const random = createRandom(seed);

  return Array.from({ length: count }, (): CellState => ({
    characterIndex: Math.floor(random() * CHARACTERS.length),
    colorIndex: Math.floor(random() * COLORS.length),
    edgeOffset: random() * 2 - 1,
    threshold: random(),
  }));
}

function drawCharacterWave(
  context: CanvasRenderingContext2D,
  size: CanvasSize,
  cells: CellState[],
  progress: number,
  direction: PixelTransitionProps["direction"],
  activeIndex: number,
  frame: number,
) {
  const normalizedProgress = clamp(progress);
  const columns = Math.ceil(size.width / CELL_SIZE) + 1;
  const rows = Math.ceil(size.height / CELL_SIZE) + 1;
  const centerY =
    direction === "forward"
      ? normalizedProgress * size.height
      : (1 - normalizedProgress) * size.height;
  const envelope = Math.min(
    smoothstep(0, 0.3, normalizedProgress),
    1 - smoothstep(0.7, 1, normalizedProgress),
  );

  context.clearRect(0, 0, size.width, size.height);
  context.font = `${CELL_SIZE}px 'Fusion Pixel 12px Mono zh_hans', monospace`;
  context.textAlign = "left";
  context.textBaseline = "top";

  if (envelope <= 0.001) {
    return;
  }

  for (let column = 0; column < columns; column += 1) {
    const cellLeft = column * CELL_SIZE;
    const cellCenterX = cellLeft + CELL_SIZE / 2;
    const horizontalPerturbation =
      Math.sin(cellCenterX * 0.013 + activeIndex * 0.9) * 38 * 0.6 +
      Math.sin(cellCenterX * 0.041 + activeIndex * 1.7) * 38 * 0.4;
    const localCenterY = centerY + horizontalPerturbation;
    const lowerClearance = Math.max(0, FALLOFF_RADIUS - localCenterY);
    const upperClearance = Math.max(
      0,
      FALLOFF_RADIUS - (size.height - localCenterY),
    );

    for (let row = 0; row < rows; row += 1) {
      const index = row * columns + column;
      const cell = cells[index];

      if (!cell) {
        continue;
      }

      const cellTop = row * CELL_SIZE;
      const cellCenterY = cellTop + CELL_SIZE / 2;
      const signedDistance = cellCenterY - localCenterY;
      const edgeRange =
        signedDistance < 0
          ? FALLOFF_RADIUS + upperClearance
          : FALLOFF_RADIUS + lowerClearance;
      const edgeFlutter =
        Math.sin(frame * 0.07 + cell.edgeOffset * 7.3) * 0.22;
      const noisyDistance =
        Math.abs(signedDistance) -
        (cell.edgeOffset * 0.55 + edgeFlutter) * FALLOFF_RADIUS;
      let strength = envelope;

      if (Math.abs(cellCenterY - centerY) > CORE_RADIUS) {
        if (noisyDistance > edgeRange) {
          continue;
        }
        strength =
          0.94 *
          Math.pow(
            1 - smoothstep(0, 1, noisyDistance / Math.max(1, edgeRange)),
            1.7,
          ) *
          envelope;
      }

      const flicker =
        0.5 +
        0.5 *
          Math.sin(
            frame * 0.18 +
              cell.threshold * 10.7 +
              column * 0.31 +
              row * 0.17,
          );

      if (flicker > strength) {
        continue;
      }

      if (flicker > 0.85 && (frame + column + row) % 7 === 0) {
        cell.characterIndex =
          (cell.characterIndex + 1 + ((frame / 7) | 0)) % CHARACTERS.length;
        cell.colorIndex = (cell.colorIndex + 1) % COLORS.length;
      }

      context.fillStyle = "rgb(0,0,0)";
      context.fillRect(cellLeft, cellTop, CELL_SIZE, CELL_SIZE);
      context.fillStyle = COLORS[cell.colorIndex] ?? COLORS[0];
      context.fillText(
        CHARACTERS[cell.characterIndex] ?? CHARACTERS[0],
        cellLeft,
        cellTop,
      );
    }
  }

  context.globalAlpha = 1;
}

export function PixelTransition({
  progress,
  direction,
  activeIndex,
  enabled = true,
}: PixelTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(progress);
  const directionRef = useRef(direction);
  const activeIndexRef = useRef(activeIndex);
  const [reducedMotion, setReducedMotion] = useState(false);
  const visible = enabled && !reducedMotion && progress > 0 && progress < 1;

  useEffect(() => {
    progressRef.current = progress;
    directionRef.current = direction;
    activeIndexRef.current = activeIndex;
  }, [activeIndex, direction, progress]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const overlay = overlayRef.current;
    const canvas = canvasRef.current;

    if (!overlay || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let animationFrame = 0;
    let size: CanvasSize = { width: 0, height: 0, dpr: 1 };
    let cellStates: CellState[] = [];
    let generatedIndex = Number.NaN;
    let frame = 0;

    const resizeCanvas = () => {
      const bounds = overlay.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const columns = Math.ceil(width / CELL_SIZE) + 1;
      const rows = Math.ceil(height / CELL_SIZE) + 1;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.imageSmoothingEnabled = false;
      size = { width, height, dpr };
      cellStates = createCellStates(
        columns * rows,
        activeIndexRef.current,
      );
      generatedIndex = activeIndexRef.current;
    };

    const draw = () => {
      frame += 1;
      if (generatedIndex !== activeIndexRef.current) {
        const columns = Math.ceil(size.width / CELL_SIZE) + 1;
        const rows = Math.ceil(size.height / CELL_SIZE) + 1;
        cellStates = createCellStates(
          columns * rows,
          activeIndexRef.current,
        );
        generatedIndex = activeIndexRef.current;
      }

      drawCharacterWave(
        context,
        size,
        cellStates,
        progressRef.current,
        directionRef.current,
        activeIndexRef.current,
        frame,
      );
      animationFrame = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(overlay);
    window.addEventListener("resize", resizeCanvas);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      context.clearRect(0, 0, size.width, size.height);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] motion-reduce:hidden"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full [image-rendering:pixelated]"
      />
    </div>
  );
}
