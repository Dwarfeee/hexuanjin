"use client";

import { useEffect, useRef } from "react";

interface ProceduralMoonCanvasProps {
  cameraProgress: number;
  opacity: number;
}

interface Crater {
  basisX: readonly [number, number, number];
  basisY: readonly [number, number, number];
  center: readonly [number, number, number];
  depth: number;
  irregularity: number;
  phase: number;
  radius: number;
  rim: number;
}

interface MoonSurfaceData {
  craters: readonly Crater[];
  height: number;
  texture: Float32Array;
  width: number;
}

interface RenderState {
  animationFrame: number | null;
  canvasHeight: number;
  canvasWidth: number;
  context: CanvasRenderingContext2D;
  lastTimestamp: number | null;
  reducedMotion: boolean;
  rotation: number;
}

const SURFACE_WIDTH = 256;
const SURFACE_HEIGHT = 128;
const MAX_RASTER_SIZE = 256;
const LOGICAL_PIXEL_SIZE = 4;
const ROTATION_SPEED = 0.18;
const TWO_PI = Math.PI * 2;
// Decoded from the careers.kimi.com bundle: the shared moon sits exactly at
// viewport center for both Hero and Mission; the radii derive from a 0.68
// moon scale applied to a 1440x810 virtual stage.
const MOON_SCALE = 0.68;
const HERO_RADIUS_FACTOR = (MOON_SCALE * 0.42) / 4.8;
const MISSION_STAGE_RADIUS = 154;
const STAGE_ASPECT_WIDTH = 1440;
const STAGE_ASPECT_HEIGHT = 810;
const BAYER_MATRIX = [
  0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5,
] as const;
const PALETTE = [0, 40, 82, 136, 200, 236] as const;
const LIGHT_DIRECTION = normalizeVector(
  Math.cos((Math.PI * 35) / 180),
  -Math.sin((Math.PI * 35) / 180),
  0.35,
);

let cachedSurfaceData: MoonSurfaceData | null = null;

function clamp(value: number, min = 0, max = 1) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function mulberry32(seed: number) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(x: number, y: number, z: number, seed: number) {
  let hash = seed ^ Math.imul(x, 374761393);
  hash = Math.imul(hash ^ Math.imul(y, 668265263), 1274126177);
  hash = Math.imul(hash ^ Math.imul(z, 2147483647), 2246822519);
  hash ^= hash >>> 13;
  return ((hash >>> 0) & 0xffff) / 0xffff;
}

function fade(value: number) {
  return value * value * (3 - 2 * value);
}

function valueNoise3d(x: number, y: number, z: number, seed: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const z0 = Math.floor(z);
  const tx = fade(x - x0);
  const ty = fade(y - y0);
  const tz = fade(z - z0);
  const x1 = x0 + 1;
  const y1 = y0 + 1;
  const z1 = z0 + 1;

  const c000 = hash3(x0, y0, z0, seed);
  const c100 = hash3(x1, y0, z0, seed);
  const c010 = hash3(x0, y1, z0, seed);
  const c110 = hash3(x1, y1, z0, seed);
  const c001 = hash3(x0, y0, z1, seed);
  const c101 = hash3(x1, y0, z1, seed);
  const c011 = hash3(x0, y1, z1, seed);
  const c111 = hash3(x1, y1, z1, seed);
  const lower = lerp(lerp(c000, c100, tx), lerp(c010, c110, tx), ty);
  const upper = lerp(lerp(c001, c101, tx), lerp(c011, c111, tx), ty);

  return lerp(lower, upper, tz);
}

function fractalValueNoise(x: number, y: number, z: number) {
  let amplitude = 0.58;
  let frequency = 1.9;
  let total = 0;
  let normalization = 0;

  for (let octave = 0; octave < 5; octave += 1) {
    total +=
      valueNoise3d(
        x * frequency,
        y * frequency,
        z * frequency,
        42 + octave * 1013,
      ) * amplitude;
    normalization += amplitude;
    amplitude *= 0.51;
    frequency *= 2.04;
  }

  return total / normalization;
}

function normalizeVector(
  x: number,
  y: number,
  z: number,
): readonly [number, number, number] {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function createCraters() {
  const random = mulberry32(9215);
  const craters: Crater[] = [];

  for (let index = 0; index < 46; index += 1) {
    const centerY = random() * 2 - 1;
    const longitude = random() * TWO_PI;
    const horizontalRadius = Math.sqrt(1 - centerY * centerY);
    const center = normalizeVector(
      Math.sin(longitude) * horizontalRadius,
      centerY,
      Math.cos(longitude) * horizontalRadius,
    );
    const reference =
      Math.abs(center[1]) > 0.86 ? ([1, 0, 0] as const) : ([0, 1, 0] as const);
    const basisX = normalizeVector(
      reference[1] * center[2] - reference[2] * center[1],
      reference[2] * center[0] - reference[0] * center[2],
      reference[0] * center[1] - reference[1] * center[0],
    );
    const basisY = normalizeVector(
      center[1] * basisX[2] - center[2] * basisX[1],
      center[2] * basisX[0] - center[0] * basisX[2],
      center[0] * basisX[1] - center[1] * basisX[0],
    );
    const sizeBias = random() ** 2.35;

    craters.push({
      basisX,
      basisY,
      center,
      depth: lerp(0.16, 0.48, random()) * lerp(0.72, 1.15, sizeBias),
      irregularity: lerp(0.035, 0.13, random()),
      phase: random() * TWO_PI,
      radius: lerp(0.022, 0.2, sizeBias),
      rim: lerp(0.08, 0.26, random()),
    });
  }

  return craters;
}

function getMoonSurfaceData() {
  if (cachedSurfaceData) {
    return cachedSurfaceData;
  }

  const craters = createCraters();
  const texture = new Float32Array(SURFACE_WIDTH * SURFACE_HEIGHT);

  for (let y = 0; y < SURFACE_HEIGHT; y += 1) {
    const latitude = ((y + 0.5) / SURFACE_HEIGHT - 0.5) * Math.PI;
    const cosLatitude = Math.cos(latitude);
    const pointY = Math.sin(latitude);

    for (let x = 0; x < SURFACE_WIDTH; x += 1) {
      const longitude = ((x + 0.5) / SURFACE_WIDTH - 0.5) * TWO_PI;
      const pointX = Math.sin(longitude) * cosLatitude;
      const pointZ = Math.cos(longitude) * cosLatitude;
      const broadNoise = fractalValueNoise(pointX, pointY, pointZ);
      const fineNoise = valueNoise3d(
        pointX * 31,
        pointY * 31,
        pointZ * 31,
        4242,
      );
      let surface = (broadNoise - 0.5) * 0.75 + (fineNoise - 0.5) * 0.18;

      for (const crater of craters) {
        const dot =
          pointX * crater.center[0] +
          pointY * crater.center[1] +
          pointZ * crater.center[2];
        const chordDistance = Math.sqrt(Math.max(0, 2 - 2 * dot));

        if (chordDistance > crater.radius * 1.48) {
          continue;
        }

        const tangentX =
          pointX * crater.basisX[0] +
          pointY * crater.basisX[1] +
          pointZ * crater.basisX[2];
        const tangentY =
          pointX * crater.basisY[0] +
          pointY * crater.basisY[1] +
          pointZ * crater.basisY[2];
        const angle = Math.atan2(tangentY, tangentX);
        const warpedRadius =
          crater.radius *
          (1 +
            Math.sin(angle * 5 + crater.phase) * crater.irregularity +
            Math.sin(angle * 9 - crater.phase * 0.7) *
              crater.irregularity *
              0.42);
        const distance = chordDistance / warpedRadius;

        if (distance < 1) {
          const bowl = 1 - distance * distance;
          surface -= bowl * crater.depth;
          surface -= Math.exp(-(((distance - 0.72) / 0.2) ** 2)) * 0.07;
        } else if (distance < 1.42) {
          surface += Math.exp(-(((distance - 1.07) / 0.14) ** 2)) * crater.rim;
        }
      }

      texture[y * SURFACE_WIDTH + x] = clamp(surface, -0.72, 0.72);
    }
  }

  cachedSurfaceData = {
    craters,
    height: SURFACE_HEIGHT,
    texture,
    width: SURFACE_WIDTH,
  };

  return cachedSurfaceData;
}

function sampleSurface(
  surface: MoonSurfaceData,
  normalX: number,
  normalY: number,
  normalZ: number,
) {
  const longitude = Math.atan2(normalX, normalZ);
  const latitude = Math.asin(clamp(normalY, -1, 1));
  const x = Math.floor((longitude / TWO_PI + 0.5) * surface.width);
  const y = Math.floor((latitude / Math.PI + 0.5) * surface.height);
  const wrappedX = ((x % surface.width) + surface.width) % surface.width;
  const clampedY = Math.min(surface.height - 1, Math.max(0, y));

  return surface.texture[clampedY * surface.width + wrappedX] ?? 0;
}

function getCameraState(width: number, height: number, progress: number) {
  const clampedProgress = clamp(progress, 0, 2);
  const desktop = width >= 768;
  const stageWidth = Math.max(width, STAGE_ASPECT_WIDTH);
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  const heroRadius = height * HERO_RADIUS_FACTOR;
  const missionRadius = MISSION_STAGE_RADIUS * (stageWidth / STAGE_ASPECT_WIDTH);
  const heroMissionProgress = clamp(clampedProgress, 0, 1);
  const easedProgress = smoothstep(heroMissionProgress);
  const overshoot =
    heroMissionProgress > 0.72 && heroMissionProgress < 1
      ? Math.sin(((heroMissionProgress - 0.72) / 0.28) * Math.PI) * 0.06
      : 0;
  const cameraProgress =
    heroMissionProgress >= 1 ? 1 : easedProgress + overshoot;
  const missionState = {
    radius: lerp(heroRadius, missionRadius, cameraProgress),
    x: centerX,
    y: centerY,
  };

  if (clampedProgress <= 1) {
    return missionState;
  }

  const landOnProgress = clampedProgress - 1;
  const landOnEased = smoothstep(landOnProgress);
  const landOnOvershoot =
    landOnProgress > 0.7 && landOnProgress < 1
      ? Math.sin(((landOnProgress - 0.7) / 0.3) * Math.PI) * 0.025
      : 0;
  const travelProgress =
    landOnProgress >= 1 ? 1 : landOnEased + landOnOvershoot;
  const landOnRadius = desktop ? Math.min(width * 0.43, 700) : width * 0.72;
  const landOnX = width * (desktop ? 0.25 : -0.1);
  const landOnY = height * (desktop ? 1.1 : 1.02);

  return {
    radius: lerp(missionState.radius, landOnRadius, travelProgress),
    x: lerp(missionState.x, landOnX, travelProgress),
    y: lerp(missionState.y, landOnY, travelProgress),
  };
}

function getLitFraction(progress: number) {
  const clampedProgress = clamp(progress, 0, 2);

  if (clampedProgress <= 1) {
    return lerp(1, 0.48, smoothstep(clampedProgress));
  }

  return lerp(0.48, 0.54, smoothstep(clampedProgress - 1));
}

function renderMoonRaster(
  imageData: ImageData,
  litFraction: number,
  rasterSize: number,
  rotation: number,
  shimmerTick: number,
  surface: MoonSurfaceData,
) {
  const pixels = imageData.data;
  const halfSize = rasterSize / 2;
  const sine = Math.sin(rotation);
  const cosine = Math.cos(rotation);

  for (let y = 0; y < rasterSize; y += 1) {
    const sphereY = -((y + 0.5 - halfSize) / halfSize);

    for (let x = 0; x < rasterSize; x += 1) {
      const sphereX = (x + 0.5 - halfSize) / halfSize;
      const radiusSquared = sphereX * sphereX + sphereY * sphereY;
      const pixelIndex = (y * MAX_RASTER_SIZE + x) * 4;

      if (radiusSquared > 1) {
        pixels[pixelIndex] = 0;
        pixels[pixelIndex + 1] = 0;
        pixels[pixelIndex + 2] = 0;
        pixels[pixelIndex + 3] = 0;
        continue;
      }

      const sphereZ = Math.sqrt(1 - radiusSquared);
      const textureX = sphereX * cosine - sphereZ * sine;
      const textureZ = sphereX * sine + sphereZ * cosine;
      const texture = sampleSurface(surface, textureX, sphereY, textureZ);
      const diffuse =
        sphereX * LIGHT_DIRECTION[0] +
        sphereY * LIGHT_DIRECTION[1] +
        sphereZ * LIGHT_DIRECTION[2] +
        (litFraction - 0.5) * 2;
      const directionalStrength = clamp((1 - litFraction) / 0.52);
      const lit = lerp(0.54, clamp(diffuse), directionalStrength);
      const edgeFalloff = 0.7 + sphereZ * 0.3;
      const terminator =
        directionalStrength > 0.08 && diffuse <= 0
          ? 30 + clamp((diffuse + 0.22) / 0.22) * 24
          : 24 + 156 * lit ** 0.72;
      const brightness = clamp(
        (terminator + texture * lerp(60, 90, lit)) * edgeFalloff,
        0,
        255,
      );
      const bayer = BAYER_MATRIX[(y & 3) * 4 + (x & 3)] ?? 0;
      const dither = ((bayer + 0.5) / 16 - 0.5) * 0.6;
      const shimmerCandidate = hash3(x, y, 0, 7079);
      const temporalDither =
        shimmerCandidate > 0.82
          ? (hash3(x, y, shimmerTick, 19001) - 0.5) * 0.36
          : 0;
      const paletteIndex = Math.min(
        PALETTE.length - 1,
        Math.max(
          0,
          Math.floor(
            (brightness / 256) * PALETTE.length + dither + temporalDither,
          ),
        ),
      );
      const grayscale = PALETTE[paletteIndex] ?? PALETTE[0];

      pixels[pixelIndex] = grayscale;
      pixels[pixelIndex + 1] = grayscale;
      pixels[pixelIndex + 2] = grayscale;
      pixels[pixelIndex + 3] = 255;
    }
  }
}

export function ProceduralMoonCanvas({
  cameraProgress,
  opacity,
}: ProceduralMoonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({
    cameraProgress: clamp(cameraProgress, 0, 2),
    opacity: clamp(opacity),
  });
  const requestDrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    propsRef.current = {
      cameraProgress: clamp(cameraProgress, 0, 2),
      opacity: clamp(opacity),
    };
    requestDrawRef.current?.();
  }, [cameraProgress, opacity]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: true });

    if (!context) {
      return;
    }

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = MAX_RASTER_SIZE;
    offscreenCanvas.height = MAX_RASTER_SIZE;
    const offscreenContext = offscreenCanvas.getContext("2d", { alpha: true });

    if (!offscreenContext) {
      return;
    }

    const moonImageData = offscreenContext.createImageData(
      MAX_RASTER_SIZE,
      MAX_RASTER_SIZE,
    );
    const surface = getMoonSurfaceData();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const state: RenderState = {
      animationFrame: null,
      canvasHeight: 0,
      canvasWidth: 0,
      context,
      lastTimestamp: null,
      reducedMotion: motionQuery.matches,
      rotation: 0,
    };

    const updateCanvasSize = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = Math.max(1, bounds.width);
      const height = Math.max(1, bounds.height);
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      const backingWidth = Math.max(1, Math.round(width * dpr));
      const backingHeight = Math.max(1, Math.round(height * dpr));

      state.canvasWidth = width;
      state.canvasHeight = height;

      if (canvas.width !== backingWidth || canvas.height !== backingHeight) {
        canvas.width = backingWidth;
        canvas.height = backingHeight;
      }

      state.context.imageSmoothingEnabled = false;
      state.context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (timestamp: number) => {
      state.animationFrame = null;
      updateCanvasSize();

      if (!state.reducedMotion && propsRef.current.opacity > 0.001) {
        if (state.lastTimestamp !== null) {
          const elapsedSeconds = Math.min(
            0.1,
            (timestamp - state.lastTimestamp) / 1000,
          );
          state.rotation =
            (state.rotation + elapsedSeconds * ROTATION_SPEED) % TWO_PI;
        }
        state.lastTimestamp = timestamp;
      } else {
        state.lastTimestamp = null;
        if (state.reducedMotion) {
          state.rotation = 0;
        }
      }

      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
      state.context.setTransform(1, 0, 0, 1, 0, 0);
      state.context.clearRect(0, 0, canvas.width, canvas.height);
      state.context.setTransform(dpr, 0, 0, dpr, 0, 0);
      state.context.imageSmoothingEnabled = false;

      const currentOpacity = propsRef.current.opacity;

      if (currentOpacity > 0) {
        const camera = getCameraState(
          state.canvasWidth,
          state.canvasHeight,
          propsRef.current.cameraProgress,
        );
        const rasterSize = Math.min(
          MAX_RASTER_SIZE,
          Math.max(32, Math.round((camera.radius * 2) / LOGICAL_PIXEL_SIZE)),
        );
        const diameter = Math.max(1, Math.round(camera.radius * 2));
        const centerX = Math.round(camera.x);
        const centerY = Math.round(camera.y);

        state.context.globalAlpha = currentOpacity;
        const shimmerTick = state.reducedMotion
          ? 0
          : Math.floor(timestamp / 125);
        renderMoonRaster(
          moonImageData,
          getLitFraction(propsRef.current.cameraProgress),
          rasterSize,
          state.rotation,
          shimmerTick,
          surface,
        );
        offscreenContext.putImageData(
          moonImageData,
          0,
          0,
          0,
          0,
          rasterSize,
          rasterSize,
        );
        state.context.drawImage(
          offscreenCanvas,
          0,
          0,
          rasterSize,
          rasterSize,
          centerX - Math.round(diameter / 2),
          centerY - Math.round(diameter / 2),
          diameter,
          diameter,
        );
        state.context.globalAlpha = 1;
      }

      if (!state.reducedMotion && propsRef.current.opacity > 0.001) {
        state.animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const requestDraw = () => {
      if (state.animationFrame === null) {
        state.animationFrame = window.requestAnimationFrame(draw);
      }
    };

    const handleMotionPreference = (event: MediaQueryListEvent) => {
      state.reducedMotion = event.matches;
      state.lastTimestamp = null;
      requestDraw();
    };
    const handleVisibilityChange = () => {
      state.lastTimestamp = null;
      if (!document.hidden) {
        requestDraw();
      }
    };
    const resizeObserver = new ResizeObserver(requestDraw);

    requestDrawRef.current = requestDraw;
    resizeObserver.observe(canvas);
    window.addEventListener("resize", requestDraw);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener("change", handleMotionPreference);
    updateCanvasSize();
    requestDraw();

    return () => {
      requestDrawRef.current = null;
      resizeObserver.disconnect();
      window.removeEventListener("resize", requestDraw);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", handleMotionPreference);
      if (state.animationFrame !== null) {
        window.cancelAnimationFrame(state.animationFrame);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[15] block h-svh w-screen mix-blend-screen"
    />
  );
}
