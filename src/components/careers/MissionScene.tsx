"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import type { SceneProps } from "@/types/careers";

const STAGE_CENTER_X = 720;
const STAGE_CENTER_Y = 405;
const ARC_RADIUS = 250;
const ARC_START_ANGLE = -102;
const ARC_SWEEP = 134;
const TYPE_INTERVAL_MS = 42;

interface ArcCharacter {
  character: string;
  rotation: number;
  x: number;
  y: number;
}

function createArcCharacters(arcCopy: string) {
  return Array.from(arcCopy, (character, index): ArcCharacter => {
    const denominator = Math.max(1, arcCopy.length - 1);
    const angle = ARC_START_ANGLE + (ARC_SWEEP * index) / denominator;
    const radians = (angle * Math.PI) / 180;

    return {
      character,
      rotation: angle + 90,
      x: STAGE_CENTER_X + Math.cos(radians) * ARC_RADIUS,
      y: STAGE_CENTER_Y + Math.sin(radians) * ARC_RADIUS,
    };
  });
}

const INTRO_HIGHLIGHTS: readonly (readonly string[])[] = [
  ["GPA 3.6/4.0，专业排名 1/40，获一等奖学金、二等奖学金"],
  ["芒果 UI/UX 实习", "具备从调研到落地的完整产品设计实践经验。"],
  ["AI × UX", "多项国家级、省级奖项"],
];

const MOBILE_INTRO: readonly string[] = [
  "湖南科技大学视觉传达设计专业在读，GPA 3.6/4.0，专业排名1/40，获一等奖学金、二等奖学金。",
  "曾参与芒果UI/UX实习，负责B端AI产品设计，具备用户研究、交互设计、信息架构及设计系统实践经验。",
  "专注UI/UX与AI×UX，擅长将复杂信息转化为清晰、易用的产品体验，获多项国家级、省级奖项。",
];

const MOBILE_INTRO_HIGHLIGHTS: readonly (readonly string[])[] = [
  ["GPA 3.6/4.0，专业排名1/40，获一等奖学金、二等奖学金。"],
  ["曾参与芒果UI/UX实习"],
  ["项国家级、省级奖项"],
];

function renderHighlightedParagraph(
  text: string,
  highlights: readonly string[],
) {
  const pattern = highlights
    .map((fragment) => fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const segments = text.split(new RegExp(`(${pattern})`, "g"));

  return segments.map((segment, index) =>
    highlights.includes(segment) ? (
      <span key={index} className="font-bold text-white/80">
        {segment}
      </span>
    ) : (
      segment
    ),
  );
}

export function MissionScene({ active, copy }: SceneProps) {
  const arcCopy = copy.mission.arc;
  const arcCharacters = useMemo(
    () => createArcCharacters(arcCopy),
    [arcCopy],
  );
  const [entered, setEntered] = useState(false);
  const [visibleCharacterCount, setVisibleCharacterCount] = useState(0);
  const [revealedParagraphs, setRevealedParagraphs] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let typingTimer: number | null = null;
    const paragraphTimers: number[] = [];
    const enterFrame = window.requestAnimationFrame(() => {
      if (!active) {
        setEntered(false);
        setVisibleCharacterCount(0);
        setRevealedParagraphs(0);
        return;
      }

      setEntered(true);

      if (reducedMotion) {
        setVisibleCharacterCount(arcCopy.length);
        setRevealedParagraphs(3);
        return;
      }

      setVisibleCharacterCount(0);
      setRevealedParagraphs(0);
      typingTimer = window.setInterval(() => {
        setVisibleCharacterCount((currentCount) => {
          if (currentCount >= arcCopy.length) {
            if (typingTimer !== null) {
              window.clearInterval(typingTimer);
            }
            return currentCount;
          }

          return currentCount + 1;
        });
      }, TYPE_INTERVAL_MS);

      [800, 1600, 2400].forEach((delay, index) => {
        paragraphTimers.push(
          window.setTimeout(() => {
            setRevealedParagraphs(index + 1);
          }, delay),
        );
      });
    });

    return () => {
      window.cancelAnimationFrame(enterFrame);
      if (typingTimer !== null) {
        window.clearInterval(typingTimer);
      }
      paragraphTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [active, arcCopy]);

  return (
    <section
      aria-hidden={!active}
      className={`relative h-svh w-full overflow-hidden bg-black text-white transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative aspect-[1440/810] w-[max(100vw,1440px)] transition-[opacity,transform] duration-700 ease-out ${
            entered
              ? "scale-100 opacity-100"
              : "translate-y-2 scale-[0.96] opacity-0"
          }`}
        >
          <Image
            alt="Xuanjin.He"
            className="pixelated absolute top-1/2 left-1/2 h-auto w-[30%] -translate-x-1/2 -translate-y-1/2 lg:w-[18%]"
            height={24}
            priority
            src="/icons/logo-pixel.svg"
            width={216}
          />

          <svg
            aria-hidden="true"
            className="absolute inset-0 size-full overflow-visible hidden lg:block"
            viewBox="0 0 1440 810"
          >
            {arcCharacters.slice(0, visibleCharacterCount).map((item, index) => (
              <text
                key={`${index}-${item.character}`}
                fill="rgba(255,255,255,.86)"
                fontFamily="var(--font-fusion-pixel), monospace"
                fontSize="30"
                textAnchor="middle"
                transform={`rotate(${item.rotation} ${item.x} ${item.y})`}
                x={item.x}
                y={item.y}
              >
                {item.character === " " ? "\u00a0" : item.character}
              </text>
            ))}
          </svg>
          <span className="sr-only">{arcCopy}</span>
        </div>
      </div>

      <p className="absolute inset-x-0 top-[74%] text-center text-[14px] leading-5 tracking-[0.08em] text-white/45">
        {copy.mission.arcCn}
      </p>

      <div className="absolute left-0 top-1/2 hidden max-w-[460px] -translate-y-1/2 flex-col pb-16 pl-6 pr-6 text-left sm:pl-12 lg:flex lg:pl-20">
        <p className="text-[24px] leading-none font-medium tracking-[0.14em] text-white/80">
          {copy.mission.name}
        </p>
        <div className="mt-8 flex flex-col gap-8">
          <p
            className={`text-[13px] leading-[1.9] tracking-[0.02em] text-pretty text-white/55 transition-opacity duration-700 ${
              revealedParagraphs >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            {renderHighlightedParagraph(copy.mission.intro[0], INTRO_HIGHLIGHTS[0])}
          </p>
          <p
            className={`text-[13px] leading-[1.9] tracking-[0.02em] text-pretty text-white/55 transition-opacity duration-700 ${
              revealedParagraphs >= 3 ? "opacity-100" : "opacity-0"
            }`}
          >
            {renderHighlightedParagraph(copy.mission.intro[2], INTRO_HIGHLIGHTS[2])}
          </p>
        </div>
      </div>

      <div className="absolute right-0 top-1/2 hidden max-w-[460px] -translate-y-1/2 flex-col pb-16 pl-6 pr-6 text-right sm:pr-12 lg:flex lg:pr-20">
        <p
          className={`text-[13px] leading-[1.9] tracking-[0.02em] text-pretty text-white/55 transition-opacity duration-700 ${
            revealedParagraphs >= 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          {renderHighlightedParagraph(copy.mission.intro[1], INTRO_HIGHLIGHTS[1])}
        </p>
      </div>

      <div className="absolute inset-x-4 top-[78%] z-10 flex flex-col items-center gap-2 text-center lg:hidden">
        <p className="text-[13px] leading-none font-medium tracking-[0.14em] text-white/80">
          {copy.mission.name}
        </p>
        <p
          className={`text-[10px] leading-[1.7] tracking-[0.02em] text-white/55 transition-opacity duration-700 ${
            revealedParagraphs >= 1 ? "opacity-100" : "opacity-0"
          }`}
        >
          {renderHighlightedParagraph(MOBILE_INTRO[0], MOBILE_INTRO_HIGHLIGHTS[0])}
        </p>
        <p
          className={`text-[10px] leading-[1.7] tracking-[0.02em] text-white/55 transition-opacity duration-700 ${
            revealedParagraphs >= 2 ? "opacity-100" : "opacity-0"
          }`}
        >
          {renderHighlightedParagraph(MOBILE_INTRO[1], MOBILE_INTRO_HIGHLIGHTS[1])}
        </p>
        <p
          className={`text-[10px] leading-[1.7] tracking-[0.02em] text-white/55 transition-opacity duration-700 ${
            revealedParagraphs >= 3 ? "opacity-100" : "opacity-0"
          }`}
        >
          {renderHighlightedParagraph(MOBILE_INTRO[2], MOBILE_INTRO_HIGHLIGHTS[2])}
        </p>
      </div>
    </section>
  );
}
