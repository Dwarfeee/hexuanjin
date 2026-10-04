"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";

import { DecodeText } from "@/components/careers/DecodeText";
import { GlitchText } from "@/components/careers/GlitchText";
import { PixelatedImageCard } from "@/components/careers/PixelatedImageCard";
import type { SiteCopy } from "@/lib/i18n";
import { WORKS } from "@/lib/works";

import type { SceneProps } from "@/types/careers";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";
const REEL_SPEED_PX_PER_MS = 0.045;
const MOBILE_AUTO_ADVANCE_MS = 2000;
const MOBILE_TWEEN_MS = 320;
const MOBILE_DRAG_RATIO = 1.85;
const MOBILE_SWIPE_DISTANCE = 48;
const MOBILE_DRAG_THRESHOLD = 8;
const GLITCH_COLORS = ["#252827", "#242926", "#2f3132"] as const;
const GLITCH_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789";

const FRAME_MASK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="304" height="228" viewBox="0 0 304 228" fill="black">
  <path d="M49.931 4H254.069V9.11628H279.586V14.2326H284.69V19.3488H289.793V29.5814H294.897V55.1628H300V172.837H294.897V198.419H289.793V208.651H284.69V213.767H274.483V218.884H254.069V224H49.931V218.884H29.5172V213.767H19.3103V208.651H14.2069V198.419H9.10345V172.837H4V55.1628H9.10345V29.5814H14.2069V19.3488H19.3103V14.2326H29.5172V9.11628H49.931V4Z" fill="black"/>
  <path d="M256.069 2V7.11621H281.586V12.2324H286.689V17.3486H291.793V27.5811H296.896V53.1631H302V174.837H296.896V200.419H291.793V210.651H286.689V215.768H276.482V220.884H256.069V226H47.9307V220.884H27.5176V215.768H17.3105V210.651H12.207V200.419H7.10352V174.837H2V53.1631H7.10352V27.5811H12.207V17.3486H17.3105V12.2324H27.5176V7.11621H47.9307V2H256.069Z" stroke="black" stroke-width="4"/>
</svg>`;

interface OdysseyFrame {
  id: string;
  leftImg: string;
  rightImg: string;
  phoneImg: string;
  /** 鼠标悬浮时替换展示的作品图。 */
  hoverImg?: string;
  time: string;
  title: string;
  description: string;
}

// 悬浮时替换展示的作品图，按下标对应 timeline 顺序（0 = 01 芒果数问数据分析 Agent）。
const HOVER_IMAGES: Partial<Record<number, string>> = {
  0: "/images/about/process/01-hover.png",
  1: "/images/about/process/02-hover.png",
  2: "/images/about/process/03-hover.png",
  3: "/images/about/process/04-hover.png",
};

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

function OdysseyPoem({ copy }: { copy: SiteCopy }) {
  const { odyssey } = copy;

  return (
    <div className="w-full max-w-[309px]">
      <h2 className="mb-4 flex items-center gap-5 text-left text-[22px] leading-none font-normal tracking-[0.02em] text-white sm:text-[26px]">
        <span aria-hidden="true">‹</span>
        <span>{odyssey.worksHeading}</span>
        <span aria-hidden="true">›</span>
      </h2>
      <p className="mb-4 text-left text-[12px] leading-[20px] tracking-[0.04em] text-[#7A7A7A]">
        在左边胶卷处点击选择作品查看
      </p>
      <div className="mt-4 w-full space-y-0 text-left text-[16px] leading-[24px] font-normal tracking-[0.04em] text-[#7A7A7A] lg:mt-10">
        {odyssey.poemLines.map((line) => (
          <p key={line}>
            <DecodeText
              animateOn="view"
              maxIterations={10}
              revealDirection="start"
              sequential
              speed={45}
              text={line}
            />
          </p>
        ))}
        <p>
          <DecodeText
            animateOn="view"
            maxIterations={10}
            revealDirection="start"
            sequential
            speed={45}
            text={odyssey.poemFinalLine}
          />
        </p>
      </div>
      <div className="mt-4 w-full space-y-0 text-left text-[12px] leading-[20px] font-normal tracking-[0.04em] text-[#4A4A4A]">
        {odyssey.poemLinesCn.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p>{odyssey.poemFinalLineCn}</p>
      </div>
    </div>
  );
}

function PoemImageCard({
  leftImg,
  rightImg,
}: {
  leftImg: string;
  rightImg: string;
}) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsActive(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <PixelatedImageCard
      animationStepDuration={0.45}
      aspectRatio="75%"
      className="w-full"
      disablePointerHandlers
      firstContent={
        <div className="relative size-full bg-black">
          <Image
            alt=""
            className="object-cover"
            fill
            sizes="600px"
            src={leftImg}
          />
        </div>
      }
      gridSize={44}
      isActive={isActive}
      once
      pixelColor="#000"
      secondContent={
        <div className="relative size-full bg-black">
          <Image
            alt=""
            className="object-cover"
            fill
            priority
            sizes="600px"
            src={rightImg}
          />
        </div>
      }
    />
  );
}

export function OdysseyScene({ active, copy }: SceneProps) {
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);

  const frames = useMemo<OdysseyFrame[]>(
    () =>
      copy.odyssey.timeline.map((entry, index) => {
        const number = String(index + 1).padStart(2, "0");
        return {
          id: `about-us-${index + 1}`,
          leftImg: `/images/about/process/${number}.png`,
          rightImg: `/images/about/process/big/shot_${number}.png`,
          phoneImg: `/images/about/process/phone-${number}.png`,
          hoverImg: HOVER_IMAGES[index],
          time: entry.time,
          title: entry.title,
          description: entry.description,
        };
      }),
    [copy],
  );

  const frameMaskStyle = useMemo<CSSProperties>(() => {
    const maskUri = `url("data:image/svg+xml,${encodeURIComponent(FRAME_MASK_SVG)}")`;
    return {
      WebkitMaskImage: maskUri,
      maskImage: maskUri,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
    };
  }, []);

  const mobileViewportStyle = useMemo(
    () =>
      ({
        "--mobile-bg-width": "min(288px, 25svh)",
        "--mobile-slide-height": "min(176px, calc(25svh * 0.6111111111111112))",
        "--mobile-slide-width": "min(237px, calc(25svh * 0.8222222222222222))",
        height: "var(--mobile-bg-width)",
      }) as CSSProperties,
    [],
  );

  const mobileFilmStyle = useMemo(
    () =>
      ({
        width: "var(--mobile-bg-width)",
        height: "2400px",
        backgroundImage: 'url("/images/about/bg-about-us-2.png")',
        backgroundSize: "var(--mobile-bg-width) auto",
        backgroundPosition: "center top",
        backgroundRepeat: "repeat-y",
        transform: "translate(-50%, -50%) rotate(90deg)",
        transformOrigin: "center center",
      }) as CSSProperties,
    [],
  );

  const hasInteraction = hoverIndex !== null || selectedIndex !== null;
  const selectedFrame =
    selectedIndex === null ? null : (frames[selectedIndex] ?? null);
  const currentMobileFrame = frames[mobileIndex] ?? frames[0];
  const selectedWork =
    selectedIndex === null ? null : (WORKS[selectedIndex] ?? null);
  const galleryImages =
    selectedWork && selectedWork.images.length > 0 ? selectedWork.images : null;
  const galleryTitle =
    selectedIndex === null ? "" : (copy.odyssey.filmTitles[selectedIndex] ?? "");
  const showCard = galleryImages === null && selectedFrame !== null;

  const mobileIndexRef = useRef(0);
  const dragPauseRef = useRef(false);
  const mobileInitialScrolledRef = useRef(false);
  const mobileMeasuredRef = useRef(false);
  const lastSyncedMobileIndexRef = useRef(0);
  const autoAdvanceTimerRef = useRef<number | null>(null);
  const desktopTrackRef = useRef<HTMLDivElement>(null);
  const desktopViewportRef = useRef<HTMLDivElement>(null);
  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const mobileGalleryScrollRef = useRef<HTMLDivElement>(null);
  const firstFrameRef = useRef<HTMLDivElement>(null);
  const secondFrameRef = useRef<HTMLDivElement>(null);
  const desktopStrideRef = useRef(0);
  const desktopScrollRef = useRef(0);
  const lastFrameTimeRef = useRef<number | null>(null);
  const desktopFrameRef = useRef<number | null>(null);
  const mobileTrackRef = useRef<HTMLDivElement>(null);
  const mobileViewportRef = useRef<HTMLDivElement>(null);
  const firstSlideRef = useRef<HTMLDivElement>(null);
  const secondSlideRef = useRef<HTMLDivElement>(null);
  const mobileStrideRef = useRef(0);
  const mobileScrollRef = useRef(0);
  const mobileTweenRef = useRef<number | null>(null);
  const mobileDragStartXRef = useRef<number | null>(null);
  const mobileDragStartScrollRef = useRef(0);
  const mobileDragActiveRef = useRef(false);
  const desktopDragStartYRef = useRef<number | null>(null);
  const desktopDragStartScrollRef = useRef(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    mobileIndexRef.current = mobileIndex;
  }, [mobileIndex]);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current !== null) {
      window.clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const scheduleAutoAdvance = useCallback(() => {
    clearAutoAdvance();
    if (isDesktop || dragPauseRef.current || selectedIndex !== null) {
      return;
    }
    autoAdvanceTimerRef.current = window.setTimeout(() => {
      setMobileIndex((current) => (current + 1) % frames.length);
    }, MOBILE_AUTO_ADVANCE_MS);
  }, [isDesktop, frames.length, clearAutoAdvance, selectedIndex]);

  useEffect(() => {
    if (!isDesktop && selectedIndex === null) {
      scheduleAutoAdvance();
    }
  }, [isDesktop, selectedIndex, scheduleAutoAdvance]);

  const applyDesktopScroll = useCallback(() => {
    const track = desktopTrackRef.current;
    const stride = desktopStrideRef.current;

    if (!track || stride <= 0) {
      return;
    }

    const total = stride * frames.length;
    let scroll = desktopScrollRef.current % total;
    if (scroll < 0) {
      scroll += total;
    }
    desktopScrollRef.current = scroll;
    track.style.transform = `translate3d(0, -${scroll}px, 0)`;
  }, [frames.length]);

  const applyMobileScroll = useCallback(() => {
    const track = mobileTrackRef.current;
    const stride = mobileStrideRef.current;

    if (!track || stride <= 0) {
      return;
    }

    const total = stride * frames.length;
    let scroll = mobileScrollRef.current % total;
    if (scroll < 0) {
      scroll += total;
    }
    mobileScrollRef.current = scroll;
    track.style.transform = `translate3d(-${scroll}px, 0, 0)`;
  }, [frames.length]);

  const tweenMobileScroll = useCallback(
    (target: number, duration = MOBILE_TWEEN_MS) => {
      if (mobileTweenRef.current !== null) {
        cancelAnimationFrame(mobileTweenRef.current);
        mobileTweenRef.current = null;
      }

      const startScroll = mobileScrollRef.current;
      const startTime = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / duration);
        mobileScrollRef.current =
          startScroll + (target - startScroll) * (1 - Math.pow(1 - progress, 3));
        applyMobileScroll();

        if (progress < 1) {
          mobileTweenRef.current = requestAnimationFrame(step);
        } else {
          mobileTweenRef.current = null;
        }
      };

      mobileTweenRef.current = requestAnimationFrame(step);
    },
    [applyMobileScroll],
  );

  const scrollToMobileIndex = useCallback(
    (index: number, smooth = true) => {
      const viewport = mobileViewportRef.current;
      const firstSlide = firstSlideRef.current;
      const stride = mobileStrideRef.current;

      if (!viewport || !firstSlide || stride <= 0) {
        return;
      }

      const viewportWidth = viewport.getBoundingClientRect().width;
      const slideWidth = firstSlide.getBoundingClientRect().width;
      let target =
        firstSlide.offsetLeft + index * stride + slideWidth / 2 - viewportWidth / 2;
      const total = stride * frames.length;

      if (total > 0) {
        const current = mobileScrollRef.current;
        const half = total / 2;
        while (target < current - half) {
          target += total;
        }
        while (target > current + half) {
          target -= total;
        }
      }

      if (smooth) {
        tweenMobileScroll(target);
      } else {
        mobileScrollRef.current = target;
        applyMobileScroll();
      }
    },
    [frames.length, tweenMobileScroll, applyMobileScroll],
  );

  const getNearestMobileIndex = useCallback(() => {
    const viewport = mobileViewportRef.current;
    const firstSlide = firstSlideRef.current;
    const stride = mobileStrideRef.current;

    if (!viewport || !firstSlide || stride <= 0) {
      return mobileIndexRef.current;
    }

    const viewportWidth = viewport.getBoundingClientRect().width;
    const slideWidth = firstSlide.getBoundingClientRect().width;
    const scrollCenter = mobileScrollRef.current + viewportWidth / 2;
    const firstCenter = firstSlide.offsetLeft + slideWidth / 2;
    let nearest = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < frames.length; index += 1) {
      const distance = Math.abs(firstCenter + index * stride - scrollCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = index;
      }
    }

    return nearest;
  }, [frames.length]);

  const setMobileIndexModulo = useCallback(
    (index: number) => {
      const count = frames.length;
      if (count === 0) {
        return;
      }
      setMobileIndex(((index % count) + count) % count);
    },
    [frames.length],
  );

  const measureDesktop = useCallback(() => {
    const first = firstFrameRef.current;
    const second = secondFrameRef.current;

    if (first && second) {
      const distance =
        second.getBoundingClientRect().top - first.getBoundingClientRect().top;
      if (distance > 1) {
        desktopStrideRef.current = distance;
      }
    } else if (first) {
      const rect = first.getBoundingClientRect();
      const marginBottom = Number.parseFloat(
        getComputedStyle(first).marginBottom,
      );
      const stride = rect.height + (Number.isFinite(marginBottom) ? marginBottom : 0);
      if (stride > 0) {
        desktopStrideRef.current = stride;
      }
    }

    applyDesktopScroll();
  }, [applyDesktopScroll]);

  const measureMobile = useCallback(() => {
    const first = firstSlideRef.current;
    const second = secondSlideRef.current;

    if (first && second) {
      const distance =
        second.getBoundingClientRect().left - first.getBoundingClientRect().left;
      if (distance > 1) {
        mobileStrideRef.current = distance;
      }
    } else if (first) {
      const rect = first.getBoundingClientRect();
      const marginRight = Number.parseFloat(
        getComputedStyle(first).marginRight,
      );
      const stride = rect.width + (Number.isFinite(marginRight) ? marginRight : 0);
      if (stride > 0) {
        mobileStrideRef.current = stride;
      }
    }

    const wasMeasured = mobileMeasuredRef.current;
    if (mobileStrideRef.current > 0) {
      mobileMeasuredRef.current = true;
    }
    applyMobileScroll();

    if (
      !isDesktop &&
      mobileMeasuredRef.current &&
      !wasMeasured &&
      !mobileInitialScrolledRef.current
    ) {
      scrollToMobileIndex(mobileIndexRef.current, false);
      mobileInitialScrolledRef.current = true;
      scheduleAutoAdvance();
    }
  }, [isDesktop, applyMobileScroll, scrollToMobileIndex, scheduleAutoAdvance]);

  const measureAll = useCallback(() => {
    measureDesktop();
    measureMobile();
  }, [measureDesktop, measureMobile]);

  useEffect(() => {
    measureAll();
    window.addEventListener("resize", measureAll);
    return () => window.removeEventListener("resize", measureAll);
  }, [measureAll]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => measureAll());
    const desktopTrack = desktopTrackRef.current;
    const mobileTrack = mobileTrackRef.current;

    if (desktopTrack) {
      observer.observe(desktopTrack);
    }
    if (mobileTrack) {
      observer.observe(mobileTrack);
    }

    return () => observer.disconnect();
  }, [measureAll]);

  useEffect(() => {
    const tick = (now: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = now;
      }
      const delta = now - lastFrameTimeRef.current;
      lastFrameTimeRef.current = now;

      if (isDesktop && !hasInteraction && desktopStrideRef.current > 0) {
        desktopScrollRef.current += REEL_SPEED_PX_PER_MS * delta;
        const total = desktopStrideRef.current * frames.length;
        if (desktopScrollRef.current >= total) {
          desktopScrollRef.current -= total;
        }
        applyDesktopScroll();
      }

      desktopFrameRef.current = requestAnimationFrame(tick);
    };

    desktopFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (desktopFrameRef.current !== null) {
        cancelAnimationFrame(desktopFrameRef.current);
      }
      desktopFrameRef.current = null;
      lastFrameTimeRef.current = null;
    };
  }, [isDesktop, hasInteraction, frames.length, applyDesktopScroll]);

  useEffect(() => {
    if (!hasInteraction) {
      lastFrameTimeRef.current = null;
    }
  }, [hasInteraction]);

  useEffect(() => {
    if (isDesktop) {
      clearAutoAdvance();
      return;
    }

    if (!mobileMeasuredRef.current || mobileStrideRef.current <= 0) {
      return;
    }

    if (lastSyncedMobileIndexRef.current !== mobileIndex) {
      lastSyncedMobileIndexRef.current = mobileIndex;
      scrollToMobileIndex(mobileIndex, true);
      scheduleAutoAdvance();
      clearAutoAdvance();
    }
  }, [isDesktop, mobileIndex, scrollToMobileIndex, scheduleAutoAdvance, clearAutoAdvance]);

  useEffect(() => {
    const viewport = desktopViewportRef.current;

    if (!viewport) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (desktopStrideRef.current <= 0) {
        return;
      }
      desktopScrollRef.current += event.deltaY;
      applyDesktopScroll();
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handleWheel);
  }, [applyDesktopScroll]);

  useEffect(() => {
    if (!galleryImages) {
      return;
    }

    const container = galleryScrollRef.current;
    if (!container) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const canScrollDown =
        container.scrollTop + container.clientHeight <
        container.scrollHeight - 1;
      const canScrollUp = container.scrollTop > 0;

      // While the gallery still has room to scroll, keep the wheel inside it so
      // the deck's global wheel handler doesn't jump to the next scene.
      if (event.deltaY > 0 && canScrollDown) {
        event.stopPropagation();
        return;
      }
      if (event.deltaY < 0 && canScrollUp) {
        event.stopPropagation();
        return;
      }
      // At a scroll boundary, let the event bubble to the deck to advance scenes.
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [galleryImages]);

  const handleDesktopPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest("button")) {
        return;
      }
      desktopDragStartYRef.current = event.clientY;
      desktopDragStartScrollRef.current = desktopScrollRef.current;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handleDesktopPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (desktopDragStartYRef.current === null || desktopStrideRef.current <= 0) {
        return;
      }
      const delta = event.clientY - desktopDragStartYRef.current;
      desktopScrollRef.current = desktopDragStartScrollRef.current - delta;
      applyDesktopScroll();
    },
    [applyDesktopScroll],
  );

  const handleDesktopPointerEnd = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (desktopDragStartYRef.current === null) {
        return;
      }
      desktopDragStartYRef.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    },
    [],
  );

  const handleMobileTouchStart = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      if (touch) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
      }
    },
    [],
  );

  const handleMobileTouchMove = useCallback(
    (event: ReactTouchEvent<HTMLDivElement>) => {
      const start = touchStartRef.current;
      const touch = event.touches[0];

      if (!start || !touch) {
        return;
      }

      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;

      if (Math.abs(deltaX) >= 8 && Math.abs(deltaX) > Math.abs(deltaY)) {
        event.stopPropagation();
      }
    },
    [],
  );

  const handleMobileTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  const handleMobilePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }
      dragPauseRef.current = true;
      clearAutoAdvance();
      if (mobileTweenRef.current !== null) {
        cancelAnimationFrame(mobileTweenRef.current);
        mobileTweenRef.current = null;
      }
      mobileDragStartXRef.current = event.clientX;
      mobileDragStartScrollRef.current = mobileScrollRef.current;
      mobileDragActiveRef.current = false;
    },
    [clearAutoAdvance],
  );

  const handleMobilePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (mobileDragStartXRef.current === null) {
        return;
      }

      const delta = event.clientX - mobileDragStartXRef.current;

      if (!mobileDragActiveRef.current) {
        if (Math.abs(delta) < MOBILE_DRAG_THRESHOLD) {
          return;
        }
        mobileDragActiveRef.current = true;
        try {
          mobileTrackRef.current?.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture may be unavailable.
        }
      }

      if (mobileStrideRef.current <= 0) {
        return;
      }

      mobileScrollRef.current =
        mobileDragStartScrollRef.current - MOBILE_DRAG_RATIO * delta;
      applyMobileScroll();
    },
    [applyMobileScroll],
  );

  const handleMobilePointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (mobileDragStartXRef.current === null) {
        return;
      }

      const delta = event.clientX - mobileDragStartXRef.current;

      if (mobileDragActiveRef.current) {
        try {
          mobileTrackRef.current?.releasePointerCapture(event.pointerId);
        } catch {
          // Pointer capture may already be released.
        }

        if (Math.abs(delta) >= MOBILE_SWIPE_DISTANCE) {
          setMobileIndexModulo(
            mobileIndexRef.current + (delta > 0 ? -1 : 1),
          );
        } else {
          setMobileIndexModulo(getNearestMobileIndex());
        }
      } else {
        scrollToMobileIndex(mobileIndexRef.current, true);
      }

      mobileDragStartXRef.current = null;
      mobileDragActiveRef.current = false;
      dragPauseRef.current = false;
      scheduleAutoAdvance();
    },
    [
      setMobileIndexModulo,
      getNearestMobileIndex,
      scrollToMobileIndex,
      scheduleAutoAdvance,
    ],
  );

  return (
    <section
      aria-hidden={!active}
      aria-label={copy.odyssey.ariaLabel}
      className="relative min-h-svh overflow-hidden bg-black text-white"
    >
      <div className="relative z-10 mx-auto hidden w-full min-h-svh items-stretch lg:flex">
        <div className="hidden shrink-0 lg:block">
          <div className="relative h-full w-[480px] min-h-svh overflow-hidden [image-rendering:pixelated]">
            <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
              <GlitchText
                centerVignette={false}
                characters={GLITCH_CHARACTERS}
                glitchColors={GLITCH_COLORS}
                glitchSpeed={50}
                outerVignette={false}
                smooth
              />
            </div>

            <div className="relative ml-[47px] h-full rounded-[10px]">
              <div className="absolute inset-0">
                <div
                  ref={desktopViewportRef}
                  className="relative h-full w-[432px] touch-none overflow-hidden"
                  onPointerCancel={handleDesktopPointerEnd}
                  onPointerDown={handleDesktopPointerDown}
                  onPointerMove={handleDesktopPointerMove}
                  onPointerUp={handleDesktopPointerEnd}
                >
                  <div
                    ref={desktopTrackRef}
                    className="bg-[url('/images/about/bg-about-us-2.png')] bg-top-left bg-size-[100%_auto] bg-repeat-y will-change-transform"
                  >
                    {[...frames, ...frames].map((frame, index) => {
                      const realIndex = index % frames.length;
                      const highlighted =
                        realIndex === hoverIndex || realIndex === selectedIndex;

                      return (
                        <div
                          key={`${frame.id}-${index}`}
                          ref={
                            index === 0
                              ? firstFrameRef
                              : index === 1
                                ? secondFrameRef
                                : undefined
                          }
                          className="mb-6 last:mb-0"
                        >
                          <button
                            type="button"
                            className="group relative mx-auto block h-[220px] w-[296px] overflow-hidden outline-none"
                            onClick={() => {
                              setSelectedIndex(realIndex);
                              setHoverIndex(null);
                            }}
                            onMouseEnter={() => setHoverIndex(realIndex)}
                            onMouseLeave={() => setHoverIndex(null)}
                            style={frameMaskStyle}
                          >
                            <div className="relative h-full w-full overflow-hidden">
                              <Image
                                alt=""
                                className={`object-cover transition duration-300 ${
                                  highlighted ? "grayscale-0" : "grayscale"
                                }`}
                                decoding="async"
                                fill
                                priority={realIndex === 0}
                                sizes="296px"
                                src={
                                  frame.hoverImg && highlighted
                                    ? frame.hoverImg
                                    : frame.leftImg
                                }
                              />
                              <div
                                aria-hidden="true"
                                className={`pointer-events-none absolute inset-0 bg-black/60 transition-opacity duration-200 ${
                                  highlighted ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              <div
                                className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-white transition-opacity duration-200 ${
                                  highlighted ? "opacity-100" : "opacity-0"
                                }`}
                              >
                                <span className="text-[11px] leading-4 tracking-[0.24em] text-white/50">
                                  {String(realIndex + 1).padStart(2, "0")}
                                </span>
                                <span className="text-[14px] leading-[20px] tracking-[0.04em]">
                                  {copy.odyssey.filmTitles[realIndex]}
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-svh flex-1 items-center justify-center px-6 pt-24 pb-28 sm:px-12 lg:px-20">
          <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
            <GlitchText
              centerVignette={false}
              characters={GLITCH_CHARACTERS}
              glitchColors={GLITCH_COLORS}
              glitchSpeed={50}
              outerVignette={false}
              smooth
            />
          </div>

          {galleryImages ? (
            <div className="absolute inset-0 z-10">
              <button
                type="button"
                aria-label={copy.odyssey.closeAria}
                className="group absolute top-24 right-8 z-20 inline-flex h-10 w-10 items-center justify-center rounded"
                onClick={() => {
                  setSelectedIndex(null);
                  setHoverIndex(null);
                }}
              >
                <Image
                  alt=""
                  aria-hidden="true"
                  className="transition-opacity duration-200 group-hover:opacity-0"
                  height={24}
                  src="/icons/close.svg"
                  width={24}
                />
                <Image
                  alt=""
                  aria-hidden="true"
                  className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  height={24}
                  src="/icons/hover-close.png"
                  width={24}
                />
              </button>

              <div
                key={selectedIndex ?? "none"}
                ref={galleryScrollRef}
                className="h-full overflow-y-auto"
              >
                <div className="mx-auto flex w-full max-w-[1000px] flex-col px-6 pt-24 pb-28">
                  <h3 className="text-center text-[20px] leading-none font-normal tracking-[0.02em] text-white sm:text-[22px]">
                    {galleryTitle}
                  </h3>
                  <div className="mt-8 flex flex-col gap-6">
                    {galleryImages.map((src) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full border border-white/10 bg-black"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div
            aria-hidden={!showCard}
            className={`relative z-10 w-full max-w-[600px] ${
              showCard ? "visible" : "invisible"
            }`}
          >
            <button
              type="button"
              aria-label={copy.odyssey.closeAria}
              className="group absolute top-[10px] right-[-40px] z-10 inline-flex h-10 w-10 items-center justify-center rounded"
              onClick={() => {
                setSelectedIndex(null);
                setHoverIndex(null);
              }}
            >
              <Image
                alt=""
                aria-hidden="true"
                className="transition-opacity duration-200 group-hover:opacity-0"
                height={24}
                src="/icons/close.svg"
                width={24}
              />
              <Image
                alt=""
                aria-hidden="true"
                className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                height={24}
                src="/icons/hover-close.png"
                width={24}
              />
            </button>

            <div className="w-full">
              <div className="relative overflow-hidden rounded-[10px]">
                {selectedFrame ? (
                  <PoemImageCard
                    key={selectedFrame.id}
                    leftImg={selectedFrame.leftImg}
                    rightImg={selectedFrame.rightImg}
                  />
                ) : null}
              </div>

              <div className="mx-auto mt-8 min-w-0 max-w-[520px]">
                <h3 className="text-center text-[18px] leading-none font-normal tracking-[0.02em] text-white sm:text-[20px]">
                  {selectedFrame?.title ?? ""}
                </h3>
                <p className="mt-4 text-center text-[12px] leading-[18px] font-normal tracking-[0.04em] whitespace-pre-line text-[#7A7A7A] sm:text-[13px] sm:leading-[19px]">
                  {selectedFrame?.description ?? ""}
                </p>
              </div>
            </div>
          </div>

          <div
            aria-hidden={Boolean(selectedFrame)}
            className={`absolute z-10 ${
              selectedFrame ? "invisible" : "visible"
            }`}
          >
            <OdysseyPoem copy={copy} />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto flex h-svh w-full flex-col lg:hidden">
        <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
          <GlitchText
            centerVignette={false}
            characters={GLITCH_CHARACTERS}
            glitchColors={GLITCH_COLORS}
            glitchSpeed={50}
            outerVignette={false}
            smooth
          />
        </div>

        <div className="relative z-10 mt-24 w-full shrink-0 sm:mt-20">
          <div
            ref={mobileViewportRef}
            className="relative w-full max-h-[25svh] touch-none overflow-hidden overscroll-x-contain [image-rendering:pixelated]"
            style={mobileViewportStyle}
            onTouchCancel={handleMobileTouchEnd}
            onTouchEnd={handleMobileTouchEnd}
            onTouchMove={handleMobileTouchMove}
            onTouchStart={handleMobileTouchStart}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div
                className="absolute top-1/2 left-1/2 [image-rendering:pixelated]"
                style={mobileFilmStyle}
              />
            </div>

            <div
              ref={mobileTrackRef}
              className="relative z-10 flex h-full w-max min-w-full flex-row items-center will-change-transform"
              onPointerCancel={handleMobilePointerUp}
              onPointerDown={handleMobilePointerDown}
              onPointerMove={handleMobilePointerMove}
              onPointerUp={handleMobilePointerUp}
            >
              {[...frames, ...frames].map((frame, index) => {
                const realIndex = index % frames.length;
                const isCurrent = realIndex === mobileIndex;

                return (
                  <div
                    key={`${frame.id}-mobile-${index}`}
                    ref={
                      index === 0
                        ? firstSlideRef
                        : index === 1
                          ? secondSlideRef
                          : undefined
                    }
                    className={`shrink-0 mr-6 ${index === 0 ? "ml-6" : ""}`}
                  >
                    <div
                      className={`relative h-(--mobile-slide-height) w-(--mobile-slide-width) shrink-0 origin-center cursor-pointer overflow-hidden transition-transform duration-300 ease-out ${
                        isCurrent ? "z-10 scale-110" : "z-0 scale-100"
                      }`}
                      style={frameMaskStyle}
                      onClick={() => {
                        setSelectedIndex(realIndex);
                        clearAutoAdvance();
                      }}
                    >
                      <div className="relative h-full w-full overflow-hidden">
                        <Image
                          alt=""
                          className="object-cover transition duration-300"
                          decoding="async"
                          fill
                          priority={realIndex === 0}
                          sizes="(max-width: 1024px) min(70vw, 50svh), 296px"
                          src={frame.hoverImg ?? frame.phoneImg}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-start pt-8 pb-28">
          {selectedIndex !== null && galleryImages ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-4 flex items-center justify-between gap-4 px-6">
                <h3 className="text-[20px] leading-none font-normal tracking-[0.02em] text-white sm:text-[22px]">
                  {galleryTitle}
                </h3>
                <button
                  type="button"
                  aria-label={copy.odyssey.closeAria}
                  className="group relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded"
                  onClick={() => {
                    setSelectedIndex(null);
                    setHoverIndex(null);
                  }}
                >
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="transition-opacity duration-200 group-hover:opacity-0"
                    height={24}
                    src="/icons/close.svg"
                    width={24}
                  />
                  <Image
                    alt=""
                    aria-hidden="true"
                    className="absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    height={24}
                    src="/icons/hover-close.png"
                    width={24}
                  />
                </button>
              </div>
              <div
                ref={mobileGalleryScrollRef}
                className="min-h-0 flex-1 overflow-y-auto"
                onWheel={(event) => {
                  const el = mobileGalleryScrollRef.current;
                  if (!el) {
                    return;
                  }
                  const canScrollDown =
                    el.scrollTop + el.clientHeight < el.scrollHeight - 1;
                  const canScrollUp = el.scrollTop > 0;
                  if (event.deltaY > 0 && canScrollDown) {
                    event.stopPropagation();
                    return;
                  }
                  if (event.deltaY < 0 && canScrollUp) {
                    event.stopPropagation();
                    return;
                  }
                }}
                onTouchEnd={(event) => event.stopPropagation()}
                onTouchStart={(event) => event.stopPropagation()}
              >
                <div className="flex flex-col gap-6">
                  {galleryImages.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="w-full border border-white/10 bg-black"
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : currentMobileFrame ? (
            <div className="mx-auto w-full px-6 text-center">
              <h3 className="text-[24px] leading-none font-normal tracking-[0.02em] text-white">
                {currentMobileFrame.title}
              </h3>
              <p className="mt-4 text-[16px] leading-[24px] font-normal tracking-[0.04em] whitespace-pre-line text-[#7A7A7A]">
                {currentMobileFrame.description}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
