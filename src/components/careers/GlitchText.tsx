"use client";

import { useEffect, useRef } from "react";

interface GlitchTextProps {
  glitchColors?: readonly string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
  characters?: string;
}

interface GlitchCell {
  char: string;
  color: string;
  targetColor: string;
  colorProgress: number;
}

interface RgbColor {
  r: number;
  g: number;
  b: number;
}

const CELL_WIDTH = 10;
const CELL_HEIGHT = 20;
const MUTATED_CELL_RATIO = 0.05;
const COLOR_STEP = 0.05;
const RESIZE_DEBOUNCE_MS = 100;

function parseColor(input: string): RgbColor | null {
  const expanded = input.replace(
    /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
    (_match, r: string, g: string, b: string) => r + r + g + g + b + b,
  );
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expanded);

  if (!match) {
    return null;
  }

  return {
    r: parseInt(match[1] ?? "0", 16),
    g: parseInt(match[2] ?? "0", 16),
    b: parseInt(match[3] ?? "0", 16),
  };
}

export function GlitchText({
  glitchColors = ["#2b4539", "#61dca3", "#61b3dc"],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789",
}: GlitchTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const cellsRef = useRef<GlitchCell[]>([]);
  const gridRef = useRef({ columns: 0, rows: 0 });
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastGlitchRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    lastGlitchRef.current = Date.now();

    const characterList = Array.from(characters);
    const randomCharacter = () =>
      characterList[Math.floor(Math.random() * characterList.length)] ?? "?";
    const randomColor = () =>
      glitchColors[Math.floor(Math.random() * glitchColors.length)] ?? "#fff";

    const draw = () => {
      const context = contextRef.current;

      if (!context || cellsRef.current.length === 0) {
        return;
      }

      const devicePixelRatio = window.devicePixelRatio || 1;
      const width = canvas.width / devicePixelRatio;
      const height = canvas.height / devicePixelRatio;

      context.clearRect(0, 0, width, height);
      context.font = "16px monospace";
      context.textBaseline = "top";

      cellsRef.current.forEach((cell, index) => {
        const x = (index % gridRef.current.columns) * CELL_WIDTH;
        const y = CELL_HEIGHT * Math.floor(index / gridRef.current.columns);
        context.fillStyle = cell.color;
        context.fillText(cell.char, x, y);
      });
    };

    const setup = () => {
      const parent = canvas.parentElement;

      if (!parent) {
        return;
      }

      const devicePixelRatio = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();

      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      contextRef.current?.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0,
      );

      const columns = Math.ceil(rect.width / CELL_WIDTH);
      const rows = Math.ceil(rect.height / CELL_HEIGHT);

      gridRef.current = { columns, rows };
      cellsRef.current = Array.from(
        { length: columns * rows },
        (): GlitchCell => ({
          char: randomCharacter(),
          color: randomColor(),
          targetColor: randomColor(),
          colorProgress: 1,
        }),
      );
      draw();
    };

    const glitchCells = () => {
      const cells = cellsRef.current;

      if (cells.length === 0) {
        return;
      }

      const mutatedCount = Math.max(
        1,
        Math.floor(MUTATED_CELL_RATIO * cells.length),
      );

      for (let i = 0; i < mutatedCount; i += 1) {
        const cell = cells[Math.floor(Math.random() * cells.length)];

        if (!cell) {
          continue;
        }

        cell.char = randomCharacter();
        cell.targetColor = randomColor();

        if (smooth) {
          cell.colorProgress = 0;
        } else {
          cell.color = cell.targetColor;
          cell.colorProgress = 1;
        }
      }
    };

    const loop = () => {
      const now = Date.now();

      if (now - lastGlitchRef.current >= glitchSpeed) {
        glitchCells();
        draw();
        lastGlitchRef.current = now;
      }

      if (smooth) {
        let needsRedraw = false;

        cellsRef.current.forEach((cell) => {
          if (cell.colorProgress >= 1) {
            return;
          }

          cell.colorProgress += COLOR_STEP;
          if (cell.colorProgress > 1) {
            cell.colorProgress = 1;
          }

          const from = parseColor(cell.color);
          const to = parseColor(cell.targetColor);

          if (from && to) {
            const mixed = {
              r: Math.round(from.r + (to.r - from.r) * cell.colorProgress),
              g: Math.round(from.g + (to.g - from.g) * cell.colorProgress),
              b: Math.round(from.b + (to.b - from.b) * cell.colorProgress),
            };
            cell.color = `rgb(${mixed.r}, ${mixed.g}, ${mixed.b})`;
            needsRedraw = true;
          }
        });

        if (needsRedraw) {
          draw();
        }
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    contextRef.current = canvas.getContext("2d");
    setup();
    loop();

    let resizeTimer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }
        setup();
        loop();
      }, RESIZE_DEBOUNCE_MS);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, [characters, glitchColors, glitchSpeed, smooth]);

  return (
    <div className="relative size-full overflow-hidden bg-black">
      <canvas ref={canvasRef} className="block size-full" />
      {outerVignette ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,1)_100%)]"
        />
      ) : null}
      {centerVignette ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.8)_0%,rgba(0,0,0,0)_60%)]"
        />
      ) : null}
    </div>
  );
}
