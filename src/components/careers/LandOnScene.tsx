"use client";

import { useEffect, useState, type ReactNode } from "react";

import { StarfieldCanvas } from "@/components/careers/StarfieldCanvas";

import type { WorksEntryCopy } from "@/lib/i18n";
import type { SceneProps } from "@/types/careers";

// Stage coordinates mirror MissionScene's 1440x810 virtual stage, centered on
// the viewport. Positions below are expressed in stage units and mapped to
// viewport percentages so the fan scales with the window.
const STAGE_WIDTH = 1440;
const STAGE_HEIGHT = 810;
const STAGE_CENTER_X = 720;
const STAGE_CENTER_Y = 405;

// The three one-level entries diverge toward upper-right, upper-left and
// right — clear of the moon glow, which sits bottom-left during this scene.
const ENTRY_RADIUS = 280;
// 01 upper-left, 02 upper-right (each 45° above the horizon); 03 drops
// straight below the hub with the same vertical gap as 01/02.
const ENTRY_ANGLES = [225, 315, 90] as const;
const ENTRY_RADII = [
  ENTRY_RADIUS,
  ENTRY_RADIUS,
  Math.round(ENTRY_RADIUS * Math.SQRT1_2),
] as const;

// Sub-projects of Entry 03 fan out from 03 itself: sub 01 upper-right 30°,
// sub 02 lower-left 30°.
const SUB_RADIUS = 200;
const SUB_ANGLES = [330, 150] as const;

interface Position {
  x: number;
  y: number;
}

interface EntryLayout extends WorksEntryCopy {
  position: Position;
  children: (WorksEntryCopy & { position: Position })[];
}

function polar(angleDeg: number, radius: number): Position {
  const radians = (angleDeg * Math.PI) / 180;
  return {
    x: STAGE_CENTER_X + Math.cos(radians) * radius,
    y: STAGE_CENTER_Y + Math.sin(radians) * radius,
  };
}

function buildLayout(entries: readonly WorksEntryCopy[]): EntryLayout[] {
  return entries.map((entry, index) => {
    const position = polar(
      ENTRY_ANGLES[index] ?? 0,
      ENTRY_RADII[index] ?? ENTRY_RADIUS,
    );
    return {
      ...entry,
      position,
      children: (entry.children ?? []).map((child, childIndex) => {
        const radians = ((SUB_ANGLES[childIndex] ?? 0) * Math.PI) / 180;
        return {
          ...child,
          position: {
            x: position.x + Math.cos(radians) * SUB_RADIUS,
            y: position.y + Math.sin(radians) * SUB_RADIUS,
          },
        };
      }),
    };
  });
}

const leftPct = (x: number) => `${(x / STAGE_WIDTH) * 100}%`;
const topPct = (y: number) => `${(y / STAGE_HEIGHT) * 100}%`;

// Motion (diverge + fade) carries a per-entry stagger; hover colors stay snappy.
function motionTransition(delayMs: number) {
  return [
    `left 500ms var(--scene-ease) ${delayMs}ms`,
    `top 500ms var(--scene-ease) ${delayMs}ms`,
    `transform 500ms var(--scene-ease) ${delayMs}ms`,
    `opacity 500ms var(--scene-ease) ${delayMs}ms`,
    "background-color 150ms ease",
    "border-color 150ms ease",
  ].join(", ");
}

interface EntryStyle {
  left: string;
  top: string;
  opacity: number;
  transform: string;
  transition: string;
}

function entryStyle(
  visible: boolean,
  from: Position,
  to: Position,
  delayMs: number,
): EntryStyle {
  return {
    left: leftPct(visible ? to.x : from.x),
    top: topPct(visible ? to.y : from.y),
    opacity: visible ? 1 : 0,
    transform: `translate(-50%, -50%) scale(${visible ? 1 : 0})`,
    transition: motionTransition(visible ? delayMs : 0),
  };
}

// Chamfered pixel-frame silhouettes. Each corner "cut" is a staircase of
// axis-aligned 6px steps (切角 / 断线), so the border reads as stepped pixel
// segments rather than a smooth diagonal — the same language as the original
// Moonshot entry buttons. Entries 01/02 use mirrored staircases, 03 and the
// sub-projects use a simple diagonal cut. The same polygon clips both the
// white frame and the black interior; the 2px padding between them leaves a
// uniform 2px white outline that follows the chamfer.
const CHAMFER = {
  stairTopRight:
    "polygon(0 0, calc(100% - 18px) 0, calc(100% - 18px) 6px, calc(100% - 12px) 6px, calc(100% - 12px) 12px, calc(100% - 6px) 12px, calc(100% - 6px) 18px, 100% 18px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
  stairBottomRight:
    "polygon(8px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 6px) calc(100% - 18px), calc(100% - 6px) calc(100% - 12px), calc(100% - 12px) calc(100% - 12px), calc(100% - 12px) calc(100% - 6px), calc(100% - 18px) calc(100% - 6px), calc(100% - 18px) 100%, 0 100%, 0 8px)",
  diagonal:
    "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
  sub:
    "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
} as const;

const ENTRY_CLIPS = ["stairTopRight", "stairBottomRight", "diagonal"] as const;

interface ChamferFrameProps {
  clip: string;
  paddingClass?: string;
  children: ReactNode;
}

function ChamferFrame({
  clip,
  paddingClass = "px-2 py-1 lg:px-5 lg:py-2.5",
  children,
}: ChamferFrameProps) {
  return (
    <span className="block p-[2px]" style={{ background: "#fff", clipPath: clip }}>
      <span
        className={`flex flex-col items-center gap-0.5 bg-black text-center transition-colors duration-200 group-hover:bg-white ${paddingClass}`}
        style={{ clipPath: clip }}
      >
        {children}
      </span>
    </span>
  );
}

export function LandOnScene({ active, copy, onNavigate }: SceneProps) {
  const { landOn } = copy;
  const [expanded, setExpanded] = useState(false);
  const [subExpanded, setSubExpanded] = useState(false);

  const entries = buildLayout(landOn.entries);

  useEffect(() => {
    if (active) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      setExpanded(false);
      setSubExpanded(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const toggleExpanded = () => {
    setExpanded((isExpanded) => {
      if (isExpanded) {
        setSubExpanded(false);
      }
      return !isExpanded;
    });
  };

  // All four works are entry points into the same Design Principles scene
  // (index 3). Clicking reuses the deck's existing scene transition — the same
  // pixel wipe that scroll used to trigger, now fired by a click instead.
  const enterDesignPrinciples = () => onNavigate?.(3);

  return (
    <section
      aria-hidden={!active}
      className={`relative h-svh w-full overflow-hidden bg-black text-white transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <StarfieldCanvas />

      <nav aria-label={landOn.navAria} className="absolute inset-0 z-10">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full"
          preserveAspectRatio="none"
          viewBox={`0 0 ${STAGE_WIDTH} ${STAGE_HEIGHT}`}
        >
          {entries.map((entry) => (
            <line
              key={entry.index}
              x1={STAGE_CENTER_X}
              y1={STAGE_CENTER_Y}
              x2={entry.position.x}
              y2={entry.position.y}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth={1}
              style={{
                opacity: expanded ? 1 : 0,
                transition: "opacity 400ms ease-out",
              }}
            />
          ))}
          {entries.flatMap((entry) =>
            entry.children.map((child) => (
              <line
                key={`${entry.index}-${child.index}`}
                x1={entry.position.x}
                y1={entry.position.y}
                x2={child.position.x}
                y2={child.position.y}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1}
                style={{
                  opacity: subExpanded ? 1 : 0,
                  transition: "opacity 400ms ease-out",
                }}
              />
            )),
          )}
        </svg>

        <button
          type="button"
          aria-label={landOn.hubAria}
          aria-expanded={expanded}
          aria-controls="works-radial"
          onClick={toggleExpanded}
          className="group absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <ChamferFrame clip={CHAMFER.diagonal} paddingClass="px-5 py-2.5 lg:px-8 lg:py-3.5">
            <span className="text-[18px] leading-6 tracking-[0.22em] text-white transition-colors duration-200 group-hover:text-black lg:text-[24px] lg:tracking-[0.28em]">
              {landOn.hubLabel}
            </span>
          </ChamferFrame>
        </button>

        <div id="works-radial" inert={!expanded}>
          {entries.map((entry, index) => {
            const hasChildren = entry.children.length > 0;
            const content = (
              <>
                <span className="text-[8px] leading-3 tracking-[0.16em] text-white/50 transition-colors duration-200 group-hover:text-black/60 lg:text-[10px] lg:tracking-[0.24em]">
                  {`ENTRY ${entry.index}`}
                </span>
                <span className="text-[10px] leading-4 tracking-[0.11em] text-white transition-colors duration-200 group-hover:text-black lg:text-[13px] lg:tracking-[0.16em]">
                  {entry.category}
                </span>
                <span className="text-[9px] leading-4 text-white/70 transition-colors duration-200 group-hover:text-black/70 lg:text-[12px]">
                  {entry.title}
                </span>
              </>
            );

            if (hasChildren) {
              return (
                <button
                  key={entry.index}
                  type="button"
                  aria-expanded={subExpanded}
                  onClick={() => setSubExpanded((value) => !value)}
                  className="group absolute z-20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  style={entryStyle(expanded, { x: STAGE_CENTER_X, y: STAGE_CENTER_Y }, entry.position, index * 70)}
                >
                  <ChamferFrame clip={CHAMFER[ENTRY_CLIPS[index] ?? "diagonal"]}>
                    {content}
                  </ChamferFrame>
                </button>
              );
            }

            return (
              <button
                key={entry.index}
                type="button"
                onClick={enterDesignPrinciples}
                className="group absolute z-20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                style={entryStyle(expanded, { x: STAGE_CENTER_X, y: STAGE_CENTER_Y }, entry.position, index * 70)}
              >
                <ChamferFrame clip={CHAMFER[ENTRY_CLIPS[index] ?? "diagonal"]}>
                  {content}
                </ChamferFrame>
              </button>
            );
          })}

          {entries.flatMap((entry) =>
            entry.children.map((child, childIndex) => (
              <button
                key={`${entry.index}-${child.index}`}
                type="button"
                inert={!subExpanded}
                onClick={enterDesignPrinciples}
                className="group absolute z-20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                style={entryStyle(subExpanded, entry.position, child.position, childIndex * 70)}
              >
                <ChamferFrame clip={CHAMFER.sub} paddingClass="px-1.5 py-0.5 lg:px-3 lg:py-1.5">
                  <span className="text-[7px] leading-3 tracking-[0.16em] text-white/40 transition-colors duration-200 group-hover:text-black/60 lg:text-[9px] lg:tracking-[0.24em]">
                    {`SUB ${child.index}`}
                  </span>
                  <span className="text-[9px] leading-4 text-white/70 transition-colors duration-200 group-hover:text-black/70 lg:text-[11px]">
                    {child.title}
                  </span>
                </ChamferFrame>
              </button>
            )),
          )}
        </div>
      </nav>

      <div className="absolute inset-x-0 bottom-16 z-10 flex flex-col items-center gap-2 text-center">
        <p className="text-[15px] leading-5 tracking-[0.22em] text-white/40 md:text-[16px]">
          {landOn.bottomCta}
        </p>
        <p className="text-[10px] leading-4 tracking-[0.2em] text-white/25 md:text-[11px]">
          {landOn.bottomSubtitle}
        </p>
      </div>
    </section>
  );
}
