"use client";

import { useEffect, useRef } from "react";

interface BackgroundStar {
  b: number;
  big: boolean;
  x: number;
  y: number;
}

interface TwinkleStar {
  amp: number;
  base: number;
  big: boolean;
  freq: number;
  phase: number;
  x: number;
  y: number;
}

interface Sparkle {
  amp: number;
  base: number;
  freq: number;
  phase: number;
  x: number;
  y: number;
}

interface StarfieldData {
  backgroundStars: readonly BackgroundStar[];
  frame: ImageData;
  height: number;
  intensity: Float32Array;
  shimmerA: Float32Array;
  shimmerB: Float32Array;
  sparkles: readonly Sparkle[];
  twinkleStars: readonly TwinkleStar[];
  width: number;
}

// Decoded from the careers.kimi.com land-on bundle: the starfield is a
// 280px-wide offscreen-resolution canvas scaled up with nearest-neighbor
// rendering, so the nebula dithering and stars read as deliberate pixel art.
const FIELD_WIDTH = 280;
const MIN_FIELD_WIDTH = 60;
const MIN_FIELD_HEIGHT = 40;
const NEBULA_SEED = 17;
// 8x8 Bayer matrix. The bundle stores each entry as n/64; keep the raw
// numerators here and divide once at init so the dither spread stays in
// roughly [-0.5, 0.99] (an un-divided matrix would push almost every
// nebula pixel to full alpha and wash the scene out).
const BAYER_MATRIX = Float32Array.from(
  [
    0.5, 32.5, 8.5, 40.5, 2.5, 34.5, 10.5, 42.5, 48.5, 16.5, 56.5, 24.5,
    50.5, 18.5, 58.5, 26.5, 12.5, 44.5, 4.5, 36.5, 14.5, 46.5, 6.5, 38.5,
    60.5, 28.5, 52.5, 20.5, 62.5, 30.5, 54.5, 22.5, 3.5, 35.5, 11.5, 43.5,
    1.5, 33.5, 9.5, 41.5, 51.5, 19.5, 59.5, 27.5, 49.5, 17.5, 57.5, 25.5,
    15.5, 47.5, 7.5, 39.5, 13.5, 45.5, 5.5, 37.5, 63.5, 31.5, 55.5, 23.5,
    61.5, 29.5, 53.5, 21.5,
  ],
  (value) => value / 64,
);
// Gaussian blob chain that forms the milky-way band across the scene.
const NEBULA_BLOBS = [
  { peak: 1.2, wx: 0.16, wy: 0.11, x: 0.66, y: 0.38 },
  { peak: 0.65, wx: 0.28, wy: 0.15, x: 0.62, y: 0.42 },
  { peak: 0.55, wx: 0.1, wy: 0.06, x: 0.74, y: 0.4 },
  { peak: 0.42, wx: 0.1, wy: 0.07, x: 0.86, y: 0.42 },
  { peak: 0.42, wx: 0.1, wy: 0.06, x: 0.5, y: 0.5 },
  { peak: 0.55, wx: 0.13, wy: 0.08, x: 0.36, y: 0.55 },
  { peak: 0.42, wx: 0.09, wy: 0.05, x: 0.18, y: 0.58 },
  { peak: 0.55, wx: 0.06, wy: 0.04, x: 0.06, y: 0.55 },
  { peak: 0.35, wx: 0.1, wy: 0.05, x: 0.45, y: 0.62 },
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function hash(x: number, y: number, seed = 0) {
  let n =
    Math.imul(x | 0, 0x165667b1) ^
    Math.imul(y | 0, 0x27d4eb2f) ^
    Math.imul(seed | 0, 0x7fffffff);
  n = Math.imul(n ^ (n >>> 13), 0x4bf19f61);
  return ((n ^= n >>> 16) >>> 0) / 0xffffffff;
}

function valueNoise(x: number, y: number, seed = 0) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = x - x0;
  const fy = y - y0;
  const c00 = hash(x0, y0, seed);
  const c10 = hash(x0 + 1, y0, seed);
  const c01 = hash(x0, y0 + 1, seed);
  const c11 = hash(x0 + 1, y0 + 1, seed);
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  return (c00 * (1 - sx) + c10 * sx) * (1 - sy) + (c01 * (1 - sx) + c11 * sx) * sy;
}

function fractalNoise(
  x: number,
  y: number,
  seed: number,
  octaves = 5,
  lacunarity = 2,
  gain = 0.55,
) {
  let amplitude = 1;
  let frequency = 1;
  let total = 0;
  let normalization = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    total +=
      amplitude * valueNoise(x * frequency, y * frequency, seed + 17 * octave);
    normalization += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return total / normalization;
}

function buildShimmerField(
  width: number,
  height: number,
  seed: number,
  scale: number,
) {
  const field = new Float32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = x / width;
      const u = y / height;
      field[y * width + x] =
        fractalNoise(i * scale + 0.13 * seed, u * scale + 0.27 * seed, seed, 4, 2, 0.55) - 0.5;
    }
  }

  return field;
}

function buildNebulaIntensity(width: number, height: number, seed: number) {
  const intensity = new Float32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = x / width;
      const u = y / height;
      let blobs = 0;

      for (const blob of NEBULA_BLOBS) {
        const dx = (i - blob.x) / blob.wx;
        const dy = (u - blob.y) / blob.wy;
        blobs += blob.peak * Math.exp(-(dx * dx + dy * dy));
      }

      const band = 0.18 * Math.exp(-(((u - 0.5) / 0.26) ** 2));
      const broad = fractalNoise(4 * i, 4 * u, seed, 5, 2, 0.55);
      const medium = fractalNoise(9 * i + 11, 9 * u + 7, seed + 3, 4, 2, 0.5);
      const fine = fractalNoise(22 * i, 22 * u, seed + 9, 3, 2, 0.5);
      let value = (blobs + band) * (0.35 + 0.95 * broad) * (0.55 + 0.55 * medium);
      value *= 0.55 + 0.55 * (1 - 1.4 * Math.abs(fine - 0.5)) ** 1.2;
      intensity[y * width + x] = Math.max(0, value) ** 1.15;
    }
  }

  let max = 0;
  for (let index = 0; index < intensity.length; index += 1) {
    max = Math.max(max, intensity[index] ?? 0);
  }

  if (max > 0) {
    const scale = 1.05 / max;
    for (let index = 0; index < intensity.length; index += 1) {
      intensity[index] = (intensity[index] ?? 0) * scale;
    }
  }

  return intensity;
}

function buildStars(width: number, height: number, intensity: Float32Array) {
  const backgroundStars: BackgroundStar[] = [];
  const targetCount = Math.round(width * height * 0.014);
  let attempt = 0;

  while (backgroundStars.length < targetCount && attempt < 8 * targetCount) {
    attempt += 1;
    const x = Math.floor(hash(attempt, 13, 5) * width);
    const y = Math.floor(hash(attempt, 71, 6) * height);
    const keepChance = (intensity[y * width + x] ?? 0) > 0.55 ? 0.35 : 0.95;

    if (hash(attempt, 99, 7) > keepChance) {
      continue;
    }

    const roll = hash(attempt, 5, 8);
    const brightness =
      roll > 0.985 ? 1 : roll > 0.92 ? 0.85 : roll > 0.78 ? 0.6 : roll > 0.5 ? 0.4 : 0.22;
    backgroundStars.push({ b: brightness, big: roll > 0.985, x, y });
  }

  const twinkleStars: TwinkleStar[] = [];
  const twinkleTarget = Math.max(8, Math.round(0.16 * Math.min(width, height)));
  let twinkleAttempt = 0;

  while (twinkleStars.length < twinkleTarget && twinkleAttempt < 8 * twinkleTarget) {
    twinkleAttempt += 1;
    const x = Math.floor(hash(twinkleAttempt, 401, 22) * width);
    const y = Math.floor(hash(twinkleAttempt, 257, 24) * height);
    const strong = hash(twinkleAttempt, 113, 28) > 0.7;
    twinkleStars.push({
      amp: strong ? 0.45 : 0.25,
      base: strong ? 0.55 : 0.35,
      big: strong && hash(twinkleAttempt, 911, 42) > 0.55,
      freq: 0.3 + 1.4 * hash(twinkleAttempt, 511, 34),
      phase: hash(twinkleAttempt, 711, 36) * Math.PI * 2,
      x,
      y,
    });
  }

  return { backgroundStars, twinkleStars };
}

function buildSparkles(width: number, height: number, intensity: Float32Array) {
  const sparkles: Sparkle[] = [];
  const targetCount = Math.max(20, Math.round(width * height * 0.0025));
  let attempt = 0;

  while (sparkles.length < targetCount && attempt < 30 * targetCount) {
    attempt += 1;
    const x = Math.floor(hash(attempt, 13, 42) * width);
    const y = Math.floor(hash(attempt, 71, 43) * height);
    const value = intensity[y * width + x] ?? 0;

    if (value < 0.18 || hash(attempt, 33, 44) > 0.35 + 0.6 * value) {
      continue;
    }

    sparkles.push({
      amp: 0.2 + 0.35 * hash(attempt, 9, 46),
      base: 0.05 + 0.15 * hash(attempt, 5, 45),
      freq: 0.4 + 1.8 * hash(attempt, 51, 47),
      phase: hash(attempt, 91, 48) * Math.PI * 2,
      x,
      y,
    });
  }

  return sparkles;
}

// Land-on rest camera, mirrored from ProceduralMoonCanvas#getCameraState at
// progress 2. The moon canvas sits above the scene layers with
// mix-blend-screen, so without clearance the nebula shows through the dark
// moon body and appears to float in front of it. Masking the starfield
// around the disc restores the depth cue: nebula behind, moon in front.
function getMoonClearanceMask(width: number, height: number) {
  const desktop = width >= 768;
  const moonX = width * (desktop ? 0.25 : -0.1);
  const moonY = height * (desktop ? 1.1 : 1.02);
  const moonRadius = desktop ? Math.min(width * 0.43, 700) : width * 0.72;
  const feather = Math.max(24, moonRadius * 0.06);

  return `radial-gradient(circle at ${moonX}px ${moonY}px, transparent ${Math.max(
    0,
    moonRadius - feather * 0.25,
  )}px, rgb(0 0 0) ${moonRadius + feather}px)`;
}

function drawCross(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  brightness: number,
) {
  const alpha = Math.floor(255 * clamp(brightness, 0, 1));
  const points = [
    [x, y],
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ] as const;

  for (let index = 0; index < points.length; index += 1) {
    const [px, py] = points[index];

    if (px < 0 || py < 0 || px >= width || py >= height) {
      continue;
    }

    const pixel = (py * width + px) * 4;
    const pointAlpha = index === 0 ? alpha : Math.floor(0.6 * alpha);

    if ((data[pixel + 3] ?? 0) < pointAlpha) {
      data[pixel] = 255;
      data[pixel + 1] = 255;
      data[pixel + 2] = 255;
      data[pixel + 3] = pointAlpha;
    }
  }
}

function renderFrame(
  context: CanvasRenderingContext2D,
  scene: StarfieldData,
  time: number,
) {
  const {
    backgroundStars,
    frame,
    height,
    intensity,
    shimmerA,
    shimmerB,
    sparkles,
    twinkleStars,
    width,
  } = scene;
  const data = frame.data;
  const shimmerPhaseA = Math.sin(0.35 * time);
  const shimmerPhaseB = Math.sin(0.62 * time + 1.3);

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    const bayerRow = (y & 7) * 8;

    for (let x = 0; x < width; x += 1) {
      const index = row + x;
      const pixel = index * 4;
      const base = intensity[index] ?? 0;

      if (base < 0.008) {
        data[pixel] = 0;
        data[pixel + 1] = 0;
        data[pixel + 2] = 0;
        data[pixel + 3] = 0;
        continue;
      }

      const value =
        base +
        (shimmerA[index] ?? 0) * shimmerPhaseA * 0.1 +
        (shimmerB[index] ?? 0) * shimmerPhaseB * 0.1;
      const dither = ((BAYER_MATRIX[bayerRow + (x & 7)] ?? 0.5) - 0.5) * 1;
      const level = Math.floor((clamp(Math.round(4 * value + dither), 0, 4) / 4) * 255);
      data[pixel] = 255;
      data[pixel + 1] = 255;
      data[pixel + 2] = 255;
      data[pixel + 3] = level;
    }
  }

  for (const star of backgroundStars) {
    const alpha = Math.floor(255 * star.b);
    const pixel = (star.y * width + star.x) * 4;

    if ((data[pixel + 3] ?? 0) < alpha) {
      data[pixel] = 255;
      data[pixel + 1] = 255;
      data[pixel + 2] = 255;
      data[pixel + 3] = alpha;
    }

    if (star.big) {
      drawCross(data, width, height, star.x, star.y, 0.55 * star.b);
    }
  }

  for (const sparkle of sparkles) {
    const value =
      sparkle.base + sparkle.amp * (0.5 + 0.5 * Math.sin(time * sparkle.freq + sparkle.phase));

    if (value < 0.04) {
      continue;
    }

    const alpha = Math.floor(255 * clamp(value, 0, 1));
    const pixel = (sparkle.y * width + sparkle.x) * 4;

    if ((data[pixel + 3] ?? 0) < alpha) {
      data[pixel] = 255;
      data[pixel + 1] = 255;
      data[pixel + 2] = 255;
      data[pixel + 3] = alpha;
    }
  }

  for (const twinkle of twinkleStars) {
    const value = twinkle.base + twinkle.amp * Math.sin(time * twinkle.freq + twinkle.phase);

    if (value < 0.08) {
      continue;
    }

    const clamped = clamp(value, 0, 1);
    const alpha = Math.floor(255 * clamped);
    const pixel = (twinkle.y * width + twinkle.x) * 4;

    if ((data[pixel + 3] ?? 0) < alpha) {
      data[pixel] = 255;
      data[pixel + 1] = 255;
      data[pixel + 2] = 255;
      data[pixel + 3] = alpha;
    }

    if (twinkle.big) {
      drawCross(data, width, height, twinkle.x, twinkle.y, 0.6 * clamped);
    }
  }

  context.putImageData(frame, 0, 0);
}

export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    context.imageSmoothingEnabled = false;

    let scene: StarfieldData | null = null;
    let animationFrame: number | null = null;
    let resizeTimer: number | null = null;
    let lastTimestamp = performance.now();
    let time = 0;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const rebuild = () => {
      const bounds = canvas.getBoundingClientRect();
      const aspect = bounds.width / Math.max(1, bounds.height);
      const width = Math.max(MIN_FIELD_WIDTH, Math.round(FIELD_WIDTH));
      const height = Math.max(MIN_FIELD_HEIGHT, Math.round(width / aspect));

      if (!Number.isFinite(aspect) || aspect <= 0) {
        return;
      }

      canvas.width = width;
      canvas.height = height;
      context.imageSmoothingEnabled = false;

      const clearanceMask = getMoonClearanceMask(bounds.width, bounds.height);
      canvas.style.webkitMaskImage = clearanceMask;
      canvas.style.maskImage = clearanceMask;

      const intensity = buildNebulaIntensity(width, height, NEBULA_SEED);
      const { backgroundStars, twinkleStars } = buildStars(width, height, intensity);
      scene = {
        backgroundStars,
        frame: context.createImageData(width, height),
        height,
        intensity,
        shimmerA: buildShimmerField(width, height, 3, 4.5),
        shimmerB: buildShimmerField(width, height, 11, 8),
        sparkles: buildSparkles(width, height, intensity),
        twinkleStars,
        width,
      };

      if (motionQuery.matches) {
        renderFrame(context, scene, 0);
      }
    };

    const tick = (timestamp: number) => {
      animationFrame = null;
      const elapsed = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;
      time += elapsed;

      if (scene) {
        renderFrame(context, scene, time);
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      if (event.matches) {
        if (animationFrame !== null) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        if (scene) {
          renderFrame(context, scene, 0);
        }
        return;
      }

      lastTimestamp = performance.now();
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(tick);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        rebuild();
      }, 80);
    });

    resizeObserver.observe(canvas);
    rebuild();

    if (!motionQuery.matches) {
      animationFrame = window.requestAnimationFrame(tick);
    }
    motionQuery.addEventListener("change", handleMotionPreference);

    return () => {
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", handleMotionPreference);
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 will-change-[opacity,transform]"
      style={{
        filter:
          "brightness(var(--land-on-nebula-brightness, 0.62)) contrast(var(--land-on-nebula-contrast, 1.08))",
        height: "100%",
        imageRendering: "pixelated",
        left: 0,
        opacity: "var(--land-on-nebula-opacity, 0.72)",
        top: 0,
        transformOrigin: "50% 50%",
        width: "100%",
      }}
    />
  );
}
