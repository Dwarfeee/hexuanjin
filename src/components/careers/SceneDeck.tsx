"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExplorationScene } from "@/components/careers/ExplorationScene";
import { FinaleScene } from "@/components/careers/FinaleScene";
import { HeroScene } from "@/components/careers/HeroScene";
import { LandOnScene } from "@/components/careers/LandOnScene";
import { MissionScene } from "@/components/careers/MissionScene";
import { OdysseyScene } from "@/components/careers/OdysseyScene";
import { PixelTransition } from "@/components/careers/PixelTransition";
import { ProceduralMoonCanvas } from "@/components/careers/ProceduralMoonCanvas";
import { SiteHeader } from "@/components/careers/SiteHeader";
import { SwipeHint } from "@/components/careers/SwipeHint";
import { ValuesScene } from "@/components/careers/ValuesScene";
import { getCopy, localizedHref } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import type { SceneDefinition } from "@/types/careers";

const sceneDefinitions: SceneDefinition[] = [
  { id: "hero", path: "/", component: HeroScene },
  { id: "mission", path: "/", component: MissionScene },
  { id: "land-on", path: "/land-on", component: LandOnScene },
  { id: "values", path: "/about-us", component: ValuesScene },
  { id: "odyssey", path: "/about-us", component: OdysseyScene },
  { id: "exploration", path: "/about-us", component: ExplorationScene },
  { id: "finale", path: "/about-us", component: FinaleScene },
];

const ABOUT_SEQUENCE_START = 3;
const MOON_SCENE_DURATION_MS = 2470;
const EARLY_SCENE_DURATION_MS = 1750;
const ABOUT_SCENE_DURATION_MS = 800;

type TransitionDirection = "forward" | "backward";

interface SceneTransitionState {
  direction: TransitionDirection;
  fromIndex: number;
  progress: number;
  toIndex: number;
}

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(value: number) {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
}

function isPixelTransition(transition: SceneTransitionState) {
  return (
    transition.fromIndex >= ABOUT_SEQUENCE_START ||
    transition.toIndex >= ABOUT_SEQUENCE_START
  );
}

function isMoonTransition(transition: SceneTransitionState) {
  return (
    (transition.fromIndex === 0 && transition.toIndex === 1) ||
    (transition.fromIndex === 1 && transition.toIndex === 0) ||
    (transition.fromIndex === 1 && transition.toIndex === 2) ||
    (transition.fromIndex === 2 && transition.toIndex === 1)
  );
}

function getMoonCameraProgress(transition: SceneTransitionState) {
  return lerp(
    clamp(transition.fromIndex, 0, 2),
    clamp(transition.toIndex, 0, 2),
    transition.progress,
  );
}

function lerp(start: number, end: number, progress: number) {
  return start + (end - start) * progress;
}

function isHeroMissionTransition(transition: SceneTransitionState) {
  return transition.fromIndex + transition.toIndex === 1;
}

function getSceneClipPath(
  sceneIndex: number,
  transition: SceneTransitionState,
) {
  const movingForward = transition.direction === "forward";
  const boundary = movingForward
    ? 100 - transition.progress * 100
    : transition.progress * 100;
  const skew = isPixelTransition(transition) ? 0 : 9;
  const leftEdge = `calc(${boundary}% + ${skew}vw)`;
  const rightEdge = `calc(${boundary}% - ${skew}vw)`;
  const upperClip = `polygon(0 0, 100% 0, 100% ${rightEdge}, 0 ${leftEdge})`;
  const lowerClip = `polygon(0 ${leftEdge}, 100% ${rightEdge}, 100% 100%, 0 100%)`;
  const outgoingUsesUpper = movingForward;
  const isOutgoing = sceneIndex === transition.fromIndex;

  return isOutgoing === outgoingUsesUpper ? upperClip : lowerClip;
}

function getSceneLayerStyle(
  sceneIndex: number,
  transition: SceneTransitionState,
): CSSProperties {
  if (isHeroMissionTransition(transition)) {
    const cameraProgress = getMoonCameraProgress(transition);
    const isHero = sceneIndex === 0;
    const heroOpacity = 1 - smoothstep(cameraProgress / 0.68);
    const missionOpacity = smoothstep((cameraProgress - 0.18) / 0.58);

    return {
      opacity: isHero ? heroOpacity : missionOpacity,
      transform: isHero ? `scale(${1 + cameraProgress * 0.16})` : "scale(1)",
      transformOrigin: "50% 50%",
      willChange: "opacity, transform",
      zIndex: isHero ? 1 : 2,
    };
  }

  if (isMoonTransition(transition)) {
    const isIncoming = sceneIndex === transition.toIndex;
    const opacity = isIncoming ? transition.progress : 1 - transition.progress;

    return {
      opacity,
      transform: `scale(${isIncoming ? 0.985 + transition.progress * 0.015 : 1})`,
      transformOrigin: "50% 50%",
      willChange: "opacity, transform",
      zIndex: isIncoming ? 2 : 1,
    };
  }

  const isOutgoing = sceneIndex === transition.fromIndex;
  const pixelTransition = isPixelTransition(transition);
  const scale = isOutgoing
    ? 1 + transition.progress * 0.035
    : 0.965 + transition.progress * 0.035;

  return {
    clipPath: getSceneClipPath(sceneIndex, transition),
    transform: pixelTransition ? undefined : `scale(${scale})`,
    transformOrigin: "50% 50%",
    willChange: pixelTransition ? "clip-path" : "clip-path, transform",
    zIndex: sceneIndex === transition.toIndex ? 2 : 1,
  };
}

interface SceneDeckProps {
  initialScene?: number;
  locale: Locale;
}

export function SceneDeck({ initialScene = 0, locale }: SceneDeckProps) {
  const copy = getCopy(locale);
  const safeInitialScene = Math.min(
    sceneDefinitions.length - 1,
    Math.max(0, initialScene),
  );
  const [sceneIndex, setSceneIndex] = useState(safeInitialScene);
  const [transition, setTransition] = useState<SceneTransitionState | null>(
    null,
  );
  const sceneIndexRef = useRef(safeInitialScene);
  const lockedRef = useRef(false);
  const touchStartRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const syncRoute = useCallback(
    (nextIndex: number) => {
      const path = localizedHref(locale, sceneDefinitions[nextIndex].path);
      window.history.replaceState(
        { scene: nextIndex },
        "",
        `${path}${window.location.search}`,
      );
    },
    [locale],
  );

  const updateScene = useCallback(
    (nextIndex: number) => {
      const clampedIndex = Math.min(
        sceneDefinitions.length - 1,
        Math.max(0, nextIndex),
      );

      if (lockedRef.current || sceneIndexRef.current === clampedIndex) {
        return false;
      }

      const fromIndex = sceneIndexRef.current;
      const direction: TransitionDirection =
        clampedIndex > fromIndex ? "forward" : "backward";
      const baseTransition: SceneTransitionState = {
        direction,
        fromIndex,
        progress: 0,
        toIndex: clampedIndex,
      };
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      sceneIndexRef.current = clampedIndex;
      setSceneIndex(clampedIndex);

      if (reducedMotion) {
        setTransition(null);
        syncRoute(clampedIndex);
        return true;
      }

      lockedRef.current = true;
      setTransition(baseTransition);
      const duration = isMoonTransition(baseTransition)
        ? MOON_SCENE_DURATION_MS
        : isPixelTransition(baseTransition)
          ? ABOUT_SCENE_DURATION_MS
          : EARLY_SCENE_DURATION_MS;
      const startedAt = performance.now();

      const animate = (timestamp: number) => {
        const rawProgress = clamp((timestamp - startedAt) / duration);
        setTransition({
          ...baseTransition,
          progress: smoothstep(rawProgress),
        });

        if (rawProgress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(animate);
          return;
        }

        animationFrameRef.current = null;
        lockedRef.current = false;
        setTransition(null);
        syncRoute(clampedIndex);
      };

      animationFrameRef.current = window.requestAnimationFrame(animate);
      return true;
    },
    [syncRoute],
  );

  const navigate = useCallback(
    (nextIndex: number) => {
      updateScene(nextIndex);
    },
    [updateScene],
  );

  const advance = useCallback(
    (direction: -1 | 1) => {
      if (lockedRef.current) {
        return;
      }

      // Works (scene 2) no longer scrolls forward into Design Principles.
      // Design Principles is reached only by clicking a work card, which calls
      // onNavigate(3) directly. Backward scroll from later scenes is unaffected.
      if (direction === 1 && sceneIndexRef.current === 2) {
        return;
      }

      updateScene(sceneIndexRef.current + direction);
    },
    [updateScene],
  );

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (Math.abs(event.deltaY) < 12) {
        return;
      }
      advance(event.deltaY > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        advance(1);
      }
      if (["ArrowUp", "PageUp"].includes(event.key)) {
        event.preventDefault();
        advance(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [advance]);

  const visibleSceneIndexes = useMemo(
    () =>
      transition
        ? Array.from(new Set([transition.fromIndex, transition.toIndex]))
        : [sceneIndex],
    [sceneIndex, transition],
  );

  const moonCameraProgress =
    transition && isMoonTransition(transition)
      ? getMoonCameraProgress(transition)
      : clamp(sceneIndex, 0, 2);
  const moonOpacity = transition
    ? transition.fromIndex <= 2 && transition.toIndex <= 2
      ? 1
      : transition.fromIndex === 2 && transition.toIndex === 3
        ? 1 - transition.progress
        : transition.fromIndex === 3 && transition.toIndex === 2
          ? transition.progress
          : 0
    : sceneIndex <= 2
      ? 1
      : 0;

  return (
    <main
      aria-label={copy.mainAria}
      className="relative h-svh w-screen overflow-hidden bg-black text-white"
      onTouchStart={(event) => {
        touchStartRef.current = event.changedTouches[0]?.clientY ?? null;
      }}
      onTouchEnd={(event) => {
        const startY = touchStartRef.current;
        const endY = event.changedTouches[0]?.clientY;
        touchStartRef.current = null;
        if (
          startY === null ||
          endY === undefined ||
          Math.abs(startY - endY) < 44
        ) {
          return;
        }
        advance(startY > endY ? 1 : -1);
      }}
    >
      <div className="absolute inset-0 z-10">
        {visibleSceneIndexes.map((visibleSceneIndex) => {
          const Scene = sceneDefinitions[visibleSceneIndex].component;
          const isCurrentScene = visibleSceneIndex === sceneIndex;

          return (
            <div
              key={sceneDefinitions[visibleSceneIndex].id}
              aria-hidden={!isCurrentScene}
              inert={!isCurrentScene}
              className={`absolute inset-0 overflow-hidden ${
                isCurrentScene ? "pointer-events-auto" : "pointer-events-none"
              }`}
              style={
                transition
                  ? getSceneLayerStyle(visibleSceneIndex, transition)
                  : undefined
              }
            >
              <Scene active copy={copy} onNavigate={navigate} />
            </div>
          );
        })}
      </div>
      <ProceduralMoonCanvas
        cameraProgress={moonCameraProgress}
        opacity={moonOpacity}
      />
      <SwipeHint
        label={copy.hints[sceneIndex]}
        visible={
          !transition &&
          sceneIndex !== 2 &&
          sceneIndex < sceneDefinitions.length - 1
        }
      />
      <SiteHeader copy={copy} currentScene={sceneIndex} onNavigate={navigate} />
      {transition && isPixelTransition(transition) ? (
        <PixelTransition
          activeIndex={transition.toIndex}
          direction={transition.direction}
          progress={transition.progress}
        />
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 border border-white/[0.025]"
      />
    </main>
  );
}
