"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";

import type { SceneProps } from "@/types/careers";

import { awardsByCategory, type AwardImage } from "@/lib/awards";

interface Metric {
  target: number;
  suffix?: string;
  title: string;
  description: string;
  image: string;
}

const metricData = [
  {
    target: 1,
    image: "trophy-1.svg",
  },
  {
    target: 2,
    image: "trophy-2.svg",
  },
  {
    target: 3,
    image: "trophy-3.svg",
  },
  {
    target: 4,
    image: "trophy-4.svg",
  },
] as const;

const dissolveGridSize = 64;
const dissolveDuration = 500;

// Chamfered pixel-frame silhouette matching LandOnScene's entry cards. The
// same polygon clips the white frame and the black interior; the 2px padding
// between them leaves a uniform 2px white outline that follows the chamfer.
const CATEGORY_CARD_CLIP =
  "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))";

const trophyCellCache = new Map<string, readonly number[]>();

function rasterizeTrophy(src: string): Promise<readonly number[]> {
  const cached = trophyCellCache.get(src);
  if (cached) {
    return Promise.resolve(cached);
  }

  return new Promise((resolve) => {
    const image = document.createElement("img");
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = dissolveGridSize;
      canvas.height = dissolveGridSize;
      const context = canvas.getContext("2d");
      if (!context) {
        resolve([]);
        return;
      }
      context.imageSmoothingEnabled = false;
      context.clearRect(0, 0, dissolveGridSize, dissolveGridSize);
      context.drawImage(image, 0, 0, dissolveGridSize, dissolveGridSize);
      const data = context
        .getImageData(0, 0, dissolveGridSize, dissolveGridSize)
        .data;
      const cells: number[] = [];
      for (let index = 0; index < dissolveGridSize * dissolveGridSize; index += 1) {
        const alpha = data[index * 4 + 3] ?? 0;
        if (alpha > 128) {
          cells.push(index);
        }
      }
      trophyCellCache.set(src, cells);
      resolve(cells);
    };
    image.onerror = () => resolve([]);
    image.src = src;
  });
}

function shuffled(cells: readonly number[]): number[] {
  const result = cells.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    result[index] = result[swapIndex] ?? index;
    result[swapIndex] = current ?? swapIndex;
  }
  return result;
}

interface PixelRevealProps {
  metric: Metric;
  revealed: boolean;
  value: number;
  compact?: boolean;
}

function PixelReveal({
  metric,
  revealed,
  value,
  compact = false,
}: PixelRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    if (!revealed) {
      context.clearRect(0, 0, dissolveGridSize, dissolveGridSize);
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrame = 0;
    let cancelled = false;

    const drawCells = (cells: readonly number[], count: number) => {
      context.clearRect(0, 0, dissolveGridSize, dissolveGridSize);
      context.fillStyle = "#fff";
      for (let index = 0; index < count; index += 1) {
        const cell = cells[index] ?? 0;
        context.fillRect(
          cell % dissolveGridSize,
          Math.floor(cell / dissolveGridSize),
          1,
          1,
        );
      }
    };

    void rasterizeTrophy(`/images/about/process/${metric.image}`).then((cells) => {
      if (cancelled || cells.length === 0) {
        return;
      }
      if (reducedMotion) {
        drawCells(cells, cells.length);
        return;
      }
      const order = shuffled(cells);
      const start = performance.now();
      const render = (now: number) => {
        if (cancelled) {
          return;
        }
        const progress = Math.min((now - start) / dissolveDuration, 1);
        drawCells(order, Math.floor(order.length * progress));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(render);
        }
      };
      animationFrame = requestAnimationFrame(render);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(animationFrame);
    };
  }, [metric.image, revealed]);

  return (
    <div
      className={`relative ${
        compact ? "size-[120px]" : "size-[200px] md:size-[224px]"
      }`}
    >
      <div
        className={`absolute inset-0 flex transition-opacity duration-300 ease-out ${
          compact
            ? "items-center justify-center"
            : "items-end justify-start md:items-center"
        } ${revealed ? "opacity-0" : "opacity-100"}`}
      >
        <p
          aria-hidden="true"
          className={`${
            compact ? "text-3xl leading-none" : "text-5xl leading-14"
          } tracking-[-0.04em] text-white tabular-nums`}
        >
          {value}
          {metric.suffix}
        </p>
      </div>

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        width={dissolveGridSize}
        height={dissolveGridSize}
        className="pointer-events-none absolute inset-0 z-10 size-full [image-rendering:pixelated]"
      />
    </div>
  );
}

function marqueeSizing(award: AwardImage): {
  boxClass: string;
  captionClass: string;
  sizes: string;
} {
  if (award.landscape && award.large) {
    return {
      boxClass: "h-[242px] w-[339px] sm:h-[336px] sm:w-[472px]",
      captionClass:
        "mt-4 w-[339px] text-center text-xs leading-5 text-white/55 sm:w-[472px]",
      sizes: "(max-width: 639px) 339px, 472px",
    };
  }
  if (award.landscape) {
    return {
      boxClass: "h-[230px] w-[323px] sm:h-[320px] sm:w-[450px]",
      captionClass:
        "mt-4 w-[323px] text-center text-xs leading-5 text-white/55 sm:w-[450px]",
      sizes: "(max-width: 639px) 323px, 450px",
    };
  }
  return {
    boxClass: "h-[230px] w-[162px] sm:h-[320px] sm:w-[226px]",
    captionClass:
      "mt-4 w-[162px] text-center text-xs leading-5 text-white/55 sm:w-[226px]",
    sizes: "(max-width: 639px) 162px, 226px",
  };
}

function AwardLightbox({
  award,
  onClose,
}: {
  award: AwardImage;
  onClose: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dialogRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    pointerId: null as number | null,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });

  // Wheel over the lightbox zooms the certificate instead of advancing the
  // scene (the SceneDeck listens for wheel on `window`, so stop it here).
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) {
      return;
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const zoomIn = event.deltaY < 0;
      setZoom((current) => {
        const next = zoomIn ? current * 1.15 : current * 0.87;
        const clamped = Math.min(4, Math.max(1, next));
        if (clamped <= 1) {
          setPan({ x: 0, y: 0 });
        }
        return clamped;
      });
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, []);

  const clampPan = (x: number, y: number) => {
    const container = containerRef.current;
    if (!container) {
      return { x, y };
    }
    const { width, height } = container.getBoundingClientRect();
    const overflowX = (width * (zoom - 1)) / 2;
    const overflowY = (height * (zoom - 1)) / 2;
    return {
      x: Math.min(overflowX, Math.max(-overflowX, x)),
      y: Math.min(overflowY, Math.max(-overflowY, y)),
    };
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= 1 || event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag.pointerId === null || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    setPan(clampPan(drag.startPanX + dx, drag.startPanY + dy));
  };

  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId === event.pointerId) {
      dragRef.current.pointerId = null;
    }
  };

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={award.caption}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute top-5 right-5 flex size-11 cursor-pointer items-center justify-center border border-white/20 text-2xl leading-none text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        ×
      </button>

      <div
        ref={containerRef}
        className={`relative h-[80vh] w-full max-w-4xl overflow-hidden ${
          zoom > 1 ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {!loaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-2 border-white/15 border-t-white" />
          </div>
        ) : null}

        <Image
          src={award.src}
          alt={award.caption}
          fill
          priority
          draggable={false}
          sizes="(max-width: 1023px) 100vw, 896px"
          onLoad={() => setLoaded(true)}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center",
          }}
          className={`object-contain transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      <p className="mt-5 max-w-2xl text-center text-xs leading-5 text-white/60">
        {award.caption}
      </p>
    </div>,
    document.body,
  );
}

function AwardsMarquee({
  awards,
  secondsPerItem = 8,
}: {
  awards: readonly AwardImage[];
  secondsPerItem?: number;
}) {
  const [openAward, setOpenAward] = useState<AwardImage | null>(null);
  const [prefetchAward, setPrefetchAward] = useState<AwardImage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const suppressClickRef = useRef(false);
  const dragStateRef = useRef({
    startX: null as number | null,
    startDelta: 0,
    delta: 0,
    dragging: false,
  });

  // Close the lightbox when the user presses Escape.
  useEffect(() => {
    if (!openAward) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenAward(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openAward]);

  // Track horizontal drags on window so the strip can be pulled manually without
  // stealing the pointer from the certificate buttons (which still need their
  // click to open the lightbox).
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const state = dragStateRef.current;
      if (state.startX === null) {
        return;
      }
      const deltaX = event.clientX - state.startX;
      if (!state.dragging && Math.abs(deltaX) > 4) {
        state.dragging = true;
        setIsDragging(true);
      }
      if (state.dragging) {
        state.delta = state.startDelta + deltaX;
        if (wrapperRef.current) {
          wrapperRef.current.style.transform = `translate3d(${state.delta}px, 0, 0)`;
        }
      }
    };
    const onUp = () => {
      const state = dragStateRef.current;
      if (state.dragging) {
        suppressClickRef.current = true;
      }
      state.startX = null;
      state.dragging = false;
      setIsDragging(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    suppressClickRef.current = false;
    dragStateRef.current.startX = event.clientX;
    dragStateRef.current.startDelta = dragStateRef.current.delta;
    dragStateRef.current.dragging = false;
  };

  // Duplicate enough copies so a full copy-width always covers the viewport.
  // With only two copies, categories that hold fewer images than the viewport
  // width (e.g. municipal's two) leave an empty gap at the loop point, which
  // reads as the strip "snapping back". Small categories duplicate four times
  // and shift by one copy (25%); large ones only need two copies (50%).
  const copies = awards.length <= 4 ? 4 : 2;
  const loop = Array.from({ length: copies }, () => awards).flat();

  return (
    <>
      <div
        className={`relative w-full touch-pan-y overflow-hidden select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onDragStart={(event) => event.preventDefault()}
      >
        <div ref={wrapperRef}>
          <div
            className="animate-marquee-right flex w-max"
            style={
              {
                animationDuration: `${awards.length * secondsPerItem}s`,
                "--marquee-shift": `-${100 / copies}%`,
                animationPlayState: isDragging ? "paused" : "running",
              } as CSSProperties
            }
          >
            {loop.map((award, index) => {
              const { boxClass, captionClass, sizes } = marqueeSizing(award);

              return (
                <figure
                  key={`${award.src}-${index}`}
                  className="mr-8 flex shrink-0 flex-col items-center"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (suppressClickRef.current) {
                        suppressClickRef.current = false;
                        return;
                      }
                      setOpenAward(award);
                    }}
                    onMouseEnter={() => setPrefetchAward(award)}
                    onFocus={() => setPrefetchAward(award)}
                    onPointerDown={() => setPrefetchAward(award)}
                    aria-label={`View ${award.caption} in full size`}
                    className="cursor-pointer outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white/80"
                  >
                    <div className={`relative ${boxClass}`}>
                      <Image
                        src={award.src}
                        alt={award.caption}
                        fill
                        sizes={sizes}
                        draggable={false}
                        className="object-contain"
                      />
                    </div>
                  </button>
                  <figcaption className={captionClass}>{award.caption}</figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      </div>

      {prefetchAward && openAward?.src !== prefetchAward.src ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute size-px overflow-hidden opacity-0"
        >
          <Image
            src={prefetchAward.src}
            alt=""
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 896px"
            className="object-contain"
          />
        </div>
      ) : null}

      {openAward ? (
        <AwardLightbox
          key={openAward.src}
          award={openAward}
          onClose={() => setOpenAward(null)}
        />
      ) : null}
    </>
  );
}

function useMetricCounts(active: boolean) {
  const [counts, setCounts] = useState<readonly number[]>(() =>
    metricData.map(() => 0),
  );

  useEffect(() => {
    if (!active) {
      return;
    }

    let frame = 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => {
        setCounts(metricData.map((metric) => metric.target));
      });
      return () => cancelAnimationFrame(frame);
    }

    const duration = 1000;
    const start = performance.now();

    const update = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);

      setCounts(
        metricData.map((metric) => Math.round(metric.target * eased)),
      );

      if (elapsed < 1) {
        frame = requestAnimationFrame(update);
      }
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  return counts;
}

interface MetricCardProps {
  active: boolean;
  index: number;
  metric: Metric;
  mobile?: boolean;
  onActivate: (index: number) => void;
  onDeactivate: (index: number) => void;
  onSelectCategory: (index: number) => void;
  sceneActive: boolean;
  value: number;
}

function MetricCard({
  active,
  index,
  metric,
  mobile = false,
  onActivate,
  onDeactivate,
  onSelectCategory,
  sceneActive,
  value,
}: MetricCardProps) {
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onDeactivate(index);
    }
  };

  return (
    <article
      onMouseEnter={mobile ? undefined : () => onActivate(index)}
      onMouseLeave={
        mobile
          ? undefined
          : (event) => {
              if (!event.currentTarget.contains(document.activeElement)) {
                onDeactivate(index);
              }
            }
      }
      onFocus={mobile ? undefined : () => onActivate(index)}
      onBlur={mobile ? undefined : handleBlur}
      className={
        mobile
          ? "relative min-w-[calc(100vw-48px)] snap-center overflow-hidden border-b border-white/20 px-1 pb-8"
          : "relative min-w-0 border-b border-white/20 pb-5"
      }
    >
      <button
        type="button"
        tabIndex={sceneActive ? 0 : -1}
        aria-pressed={active}
        aria-label={`${metric.target}${metric.suffix ?? ""}, ${metric.title}. Show artwork`}
        onClick={() => {
          if (mobile) {
            if (active) {
              onDeactivate(index);
            } else {
              onActivate(index);
            }
          }
          onSelectCategory(index);
        }}
        className="flex w-full cursor-pointer justify-center text-left outline-none focus-visible:ring-1 focus-visible:ring-white/80 md:justify-start"
      >
        <PixelReveal
          metric={metric}
          revealed={active}
          value={value}
        />
      </button>

      <div className="mt-3 border-t border-white/20 pt-4 md:mt-1">
        <h3 className="min-h-11 text-base leading-[22px] font-normal text-white">
          {metric.title}
        </h3>
        <p className="mt-3 text-sm leading-5 text-white/42">
          {metric.description}
        </p>
      </div>
    </article>
  );
}

export function ExplorationScene({ active, copy }: SceneProps) {
  const counts = useMetricCounts(active);
  const [activeMetric, setActiveMetric] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [openAward, setOpenAward] = useState<AwardImage | null>(null);
  const awardsScrollRef = useRef<HTMLDivElement>(null);
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const metrics = useMemo<Metric[]>(
    () =>
      metricData.map((metric, index) => {
        const copyMetric = copy.exploration.metrics[index];
        return {
          ...metric,
          title: copyMetric?.title ?? "",
          description: copyMetric?.description ?? "",
        };
      }),
    [copy],
  );

  useEffect(() => {
    if (active) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      setActiveMetric(null);
      setSelectedCategory(null);
      setOpenAward(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const activateMetric = (index: number) => setActiveMetric(index);
  const deactivateMetric = (index: number) => {
    setActiveMetric((current) => (current === index ? null : current));
  };
  const selectCategory = (index: number) =>
    setSelectedCategory((current) => (current === index ? null : index));
  const selectedAwards =
    selectedCategory === null ? [] : (awardsByCategory[selectedCategory] ?? []);
  // Municipal certificates (index 2) keep the default pace; the other three
  // categories scroll faster.
  const marqueeSecondsPerItem = selectedCategory === 2 ? 8 : 5;

  return (
    <section
      aria-hidden={!active}
      aria-labelledby="exploration-scene-title"
      className={`relative h-full min-h-[100svh] w-full overflow-hidden bg-black bg-[url('/images/about/bg-exploration.png')] bg-cover bg-center bg-no-repeat text-white transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="relative mx-auto hidden h-full min-h-[100svh] w-[calc(100%-40px)] max-w-[1400px] flex-col px-14 pt-32 pb-8 md:flex">
        <h2
          id="exploration-scene-title"
          className="flex items-center justify-center gap-5 text-center text-2xl leading-8 font-normal tracking-[-0.02em]"
        >
          <span aria-hidden="true">‹</span>
          <span>{copy.exploration.title}</span>
          <span aria-hidden="true">›</span>
        </h2>
        <p className="mt-3 text-center text-xs leading-5 text-white/45">
          {copy.exploration.subtitle}
        </p>

        <div className="flex min-h-0 flex-1 items-center justify-center">
          {selectedAwards.length > 0 ? (
            <div className="translate-y-10">
              <AwardsMarquee
                awards={selectedAwards}
                secondsPerItem={marqueeSecondsPerItem}
              />
            </div>
          ) : null}
        </div>

        <div className="mt-auto grid grid-cols-4 gap-16">
          {metrics.map((metric, index) => (
            <MetricCard
              key={metric.title}
              active={activeMetric === index}
              index={index}
              metric={metric}
              onActivate={activateMetric}
              onDeactivate={deactivateMetric}
              onSelectCategory={selectCategory}
              sceneActive={active}
              value={counts[index] ?? 0}
            />
          ))}
        </div>
      </div>

      <div className="relative flex h-full min-h-[100svh] flex-col pt-[110px] pb-8 md:hidden">
        <h2
          id="exploration-scene-title-mobile"
          className="flex items-center justify-center gap-5 px-6 text-center text-[22px] leading-8 font-normal tracking-[-0.02em]"
        >
          <span aria-hidden="true">‹</span>
          <span>{copy.exploration.title}</span>
          <span aria-hidden="true">›</span>
        </h2>
        <p className="mt-2 px-6 text-center text-[11px] leading-4 text-white/45">
          {copy.exploration.subtitle}
        </p>
        {selectedAwards.length === 0 ? (
          <p className="mt-3 px-6 text-center text-[12px] leading-5 text-white/40">
            点击左侧选择奖项类别
          </p>
        ) : null}

        <div className="mt-6 flex min-h-0 flex-1 gap-4 px-6">
          <div
            ref={categoriesScrollRef}
            className="flex w-[158px] shrink-0 flex-col justify-start gap-4 overflow-y-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onWheel={(event) => {
              const el = categoriesScrollRef.current;
              if (!el) {
                return;
              }
              const canScrollDown =
                el.scrollTop + el.clientHeight < el.scrollHeight - 1;
              const canScrollUp = el.scrollTop > 0;
              if (
                (event.deltaY > 0 && canScrollDown) ||
                (event.deltaY < 0 && canScrollUp)
              ) {
                event.stopPropagation();
              }
            }}
            onTouchEnd={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            {metrics.map((metric, index) => {
              const selected = selectedCategory === index;
              return (
                <button
                  key={metric.title}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectCategory(index)}
                  className="group block w-full cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span
                    className="block p-[2px]"
                    style={{
                      background: "rgba(255,255,255,0.3)",
                      clipPath: CATEGORY_CARD_CLIP,
                    }}
                  >
                    <span
                      className="flex flex-col items-center gap-2 bg-black px-3 py-2.5 transition-colors duration-200"
                      style={{ clipPath: CATEGORY_CARD_CLIP }}
                    >
                      <PixelReveal
                        metric={metric}
                        revealed={selected}
                        value={counts[index] ?? 0}
                        compact
                      />
                      <span className="text-[11px] leading-[15px] text-white">
                        {metric.title}
                      </span>
                      <span className="text-[9px] leading-[13px] text-white/45">
                        {metric.description}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            ref={awardsScrollRef}
            className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onWheel={(event) => {
              const el = awardsScrollRef.current;
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
            {selectedAwards.map((award) => (
              <button
                key={award.src}
                type="button"
                onClick={() => setOpenAward(award)}
                className="group text-left"
              >
                <img
                  src={award.src}
                  alt={award.caption}
                  loading="lazy"
                  decoding="async"
                  className="w-full border border-white/10 bg-black transition-opacity duration-200 group-hover:opacity-85"
                />
                <span className="mt-2 block text-[10px] leading-[15px] text-white/45">
                  {award.caption}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {openAward ? (
        <AwardLightbox award={openAward} onClose={() => setOpenAward(null)} />
      ) : null}
    </section>
  );
}
