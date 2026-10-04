"use client";

import { useEffect, useRef, useState } from "react";

const PIXEL_FLOW_VIDEO_URL = "/videos/pixel-flow.webm";

const MOBILE_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/** 8x8 Bayer ordered-dithering matrix, centered around zero. */
const BAYER_MATRIX = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36,
  14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23,
  61, 29, 53, 21,
].map((value) => value / 64 - 0.5);

/**
 * Tuning values mirrored from the original careers.kimi.com implementation:
 * the flow video is played at 2.8x, downsampled into blocky pixels, then
 * quantized to six gamma-curved gray levels with Bayer dithering.
 */
const FLOW_SETTINGS = {
  contrast: 1.05,
  brightness: 0,
  dither: 0.64,
  gamma: 0.85,
  levels: 6,
  speed: 2.8,
  trimStartFrame: 0,
  trimEndFrame: 15,
} as const;

interface PixelFlowCanvasProps {
  active?: boolean;
}

/**
 * Renders the pixel-flow nebula background exactly like the original site:
 * two hidden videos ping-pong for a seamless loop while a canvas repaints
 * every frame as dithered, quantized pixel blocks on a black backdrop.
 */
export function PixelFlowCanvas({ active = true }: PixelFlowCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const primaryVideoRef = useRef<HTMLVideoElement | null>(null);
  const secondaryVideoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const primaryVideo = primaryVideoRef.current;
    const secondaryVideo = secondaryVideoRef.current;
    if (!canvas || !primaryVideo || !secondaryVideo) {
      return;
    }

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      return;
    }

    const offscreen = document.createElement("canvas");
    const offscreenContext = offscreen.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
    });
    if (!offscreenContext) {
      return;
    }

    const isMobile = MOBILE_PATTERN.test(navigator.userAgent);
    const block = isMobile ? 8 : 6;
    const handoffLead = isMobile ? 0.5 : 0.3;
    const frameSkip = isMobile ? 1 : 0;
    const levels = Math.max(2, FLOW_SETTINGS.levels);
    const trimStart = FLOW_SETTINGS.trimStartFrame / 60;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let width = window.innerWidth;
    let height = window.innerHeight;
    let rafId = 0;
    let frameCounter = 0;
    let playing = false;
    let started = false;
    let duration = 5;
    let activeVideo = primaryVideo;
    let standbyVideo = secondaryVideo;
    let disposed = false;

    const palette: string[] = new Array(levels);
    for (let level = 0; level < levels; level += 1) {
      const shade = Math.round(
        255 * Math.pow(level / (levels - 1), FLOW_SETTINGS.gamma),
      );
      palette[level] = `rgb(${shade},${shade},${shade})`;
    }

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();
    window.addEventListener("resize", resize);

    const paintVideoFrame = (source: HTMLVideoElement) => {
      const cols = Math.ceil(width / block);
      const rows = Math.ceil(height / block);
      if (offscreen.width !== cols || offscreen.height !== rows) {
        offscreen.width = cols;
        offscreen.height = rows;
      }

      offscreenContext.imageSmoothingEnabled = true;
      offscreenContext.imageSmoothingQuality = "medium";

      const videoWidth = source.videoWidth || width;
      const videoHeight = source.videoHeight || height;
      const targetAspect = width / height;
      const videoAspect = videoWidth / videoHeight;
      let sourceX = 0;
      let sourceY = 0;
      let sourceWidth = videoWidth;
      let sourceHeight = videoHeight;

      if (videoAspect > targetAspect) {
        sourceWidth = videoHeight * targetAspect;
        sourceX = (videoWidth - sourceWidth) * 0.5;
      } else {
        sourceHeight = videoWidth / targetAspect;
        sourceY = (videoHeight - sourceHeight) * 0.5;
      }

      offscreenContext.drawImage(
        source,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        cols,
        rows,
      );

      const pixels = offscreenContext.getImageData(0, 0, cols, rows).data;

      context.fillStyle = "#000";
      context.fillRect(0, 0, width, height);

      const buckets: number[][] = Array.from(
        { length: levels },
        () => [] as number[],
      );
      let cursor = 0;

      for (let row = 0; row < rows; row += 1) {
        const bayerRow = (row & 7) << 3;
        for (let col = 0; col < cols; col += 1) {
          const red = pixels[cursor] ?? 0;
          const green = pixels[cursor + 1] ?? 0;
          const blue = pixels[cursor + 2] ?? 0;
          cursor += 4;

          let value = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
          value = (value - 0.5) * FLOW_SETTINGS.contrast + 0.5 + FLOW_SETTINGS.brightness;
          value +=
            (BAYER_MATRIX[bayerRow | (col & 7)] ?? 0) *
            FLOW_SETTINGS.dither *
            (1 / (levels - 1));

          let level = Math.round(value * (levels - 1));
          if (level < 0) {
            level = 0;
          } else if (level >= levels) {
            level = levels - 1;
          }

          if (level > 0) {
            buckets[level]?.push(col, row);
          }
        }
      }

      for (let level = 1; level < levels; level += 1) {
        const coords = buckets[level];
        if (!coords || coords.length === 0) {
          continue;
        }
        context.fillStyle = palette[level] ?? "#fff";
        for (let index = 0; index < coords.length; index += 2) {
          const x = coords[index] ?? 0;
          const y = coords[index + 1] ?? 0;
          context.fillRect(x * block, y * block, block, block);
        }
      }
    };

    const scheduleLoop = () => {
      rafId = requestAnimationFrame(scheduleLoop);
      if (!playing || document.hidden || reducedMotionQuery.matches) {
        return;
      }
      if (frameSkip > 0) {
        frameCounter += 1;
        if (frameCounter % (frameSkip + 1) !== 0) {
          return;
        }
      }

      const endTime = duration - FLOW_SETTINGS.trimEndFrame / 60;
      const handoffTime = endTime - handoffLead;
      const now = activeVideo.currentTime;

      if (now >= handoffTime && standbyVideo.paused) {
        standbyVideo.currentTime = trimStart + (now - handoffTime);
        standbyVideo.play().catch(() => {});
      }

      if (now >= endTime) {
        if (standbyVideo.paused) {
          standbyVideo.currentTime = trimStart;
          standbyVideo.play().catch(() => {});
          if (
            isMobile &&
            standbyVideo.readyState < HTMLMediaElement.HAVE_FUTURE_DATA
          ) {
            return;
          }
        }
        const finishedVideo = activeVideo;
        activeVideo = standbyVideo;
        standbyVideo = finishedVideo;
        standbyVideo.pause();
        try {
          standbyVideo.currentTime = trimStart;
        } catch {
          // Seeking while a video is detaching can throw; safe to ignore.
        }
      }

      if (activeVideo.currentTime > endTime + 0.05 || activeVideo.paused) {
        try {
          activeVideo.currentTime = trimStart;
          if (activeVideo.paused) {
            activeVideo.play().catch(() => {});
          }
        } catch {
          // Same seek guard as above.
        }
      }

      if (standbyVideo.paused && now < handoffTime && standbyVideo.readyState === 0) {
        standbyVideo.load();
      }

      paintVideoFrame(activeVideo);
    };

    const startPlayback = () => {
      if (disposed || started || reducedMotionQuery.matches) {
        return;
      }
      started = true;
      playing = true;
      duration = activeVideo.duration || 5;
      activeVideo.currentTime = trimStart;
      standbyVideo.currentTime = trimStart;
      activeVideo.playbackRate = FLOW_SETTINGS.speed;
      standbyVideo.playbackRate = FLOW_SETTINGS.speed;
      activeVideo.play().catch(() => {});
      setReady(true);
      rafId = requestAnimationFrame(scheduleLoop);
    };

    const paintStillFrame = () => {
      if (disposed) {
        return;
      }
      playing = false;
      cancelAnimationFrame(rafId);
      primaryVideo.pause();
      secondaryVideo.pause();
      const paint = () => {
        if (disposed) {
          return;
        }
        paintVideoFrame(primaryVideo);
        setReady(true);
      };
      if (primaryVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        primaryVideo.currentTime = 1;
        primaryVideo.addEventListener("seeked", paint, { once: true });
      } else {
        primaryVideo.addEventListener("loadeddata", paint, { once: true });
      }
    };

    const syncMotionPreference = () => {
      if (reducedMotionQuery.matches) {
        paintStillFrame();
      } else if (started) {
        playing = true;
        activeVideo.play().catch(() => {});
        rafId = requestAnimationFrame(scheduleLoop);
      } else {
        startPlayback();
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        activeVideo.pause();
        standbyVideo.pause();
        return;
      }
      if (playing && !reducedMotionQuery.matches) {
        activeVideo.play().catch(() => {});
      }
    };

    for (const video of [primaryVideo, secondaryVideo]) {
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.src = PIXEL_FLOW_VIDEO_URL;
      video.load();
    }

    if (reducedMotionQuery.matches) {
      paintStillFrame();
    } else {
      primaryVideo.addEventListener("canplaythrough", startPlayback, {
        once: true,
      });
      primaryVideo.addEventListener("canplay", startPlayback, { once: true });
    }

    reducedMotionQuery.addEventListener("change", syncMotionPreference);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      disposed = true;
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
      reducedMotionQuery.removeEventListener("change", syncMotionPreference);
      cancelAnimationFrame(rafId);
      for (const video of [primaryVideo, secondaryVideo]) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.width = 0;
      canvas.height = 0;
      offscreen.width = 0;
      offscreen.height = 0;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 z-0 overflow-hidden transition-opacity duration-700 ${
        active ? "opacity-100" : "opacity-0"
      }`}
    >
      <video
        ref={primaryVideoRef}
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
        className="absolute -left-[9999px] -top-[9999px] h-[2px] w-[2px] opacity-0"
      />
      <video
        ref={secondaryVideoRef}
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
        className="absolute -left-[9999px] -top-[9999px] h-[2px] w-[2px] opacity-0"
      />
      <canvas
        ref={canvasRef}
        className="pixelated absolute inset-0 block transition-opacity duration-[350ms] ease-out"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </div>
  );
}
