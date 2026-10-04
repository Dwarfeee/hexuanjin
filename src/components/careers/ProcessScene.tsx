"use client";

import Image from "next/image";
import { useState } from "react";

import type { SceneProps } from "@/types/careers";

const stepData = [
  {
    src: "/images/about/process/step1.png",
    orbitClass: "process-orbit-step-1",
  },
  {
    src: "/images/about/process/step2.png",
    orbitClass: "process-orbit-step-2",
  },
  {
    src: "/images/about/process/step3.png",
    orbitClass: "process-orbit-step-3",
  },
  {
    src: "/images/about/process/step4.png",
    orbitClass: "process-orbit-step-4",
  },
] as const;

export function ProcessScene({ active, copy }: SceneProps) {
  const [highlightedStep, setHighlightedStep] = useState<number | null>(null);
  const { process } = copy;
  const steps = stepData.map((step, index) => ({
    ...step,
    label: process.steps[index]?.label ?? "",
    labelCn: process.steps[index]?.labelCn ?? "",
    alt: process.steps[index]?.alt ?? "",
  }));

  return (
    <section
      aria-hidden={!active}
      aria-labelledby="process-scene-title"
      className={`relative h-svh min-h-svh w-full overflow-hidden bg-[url('/images/about/bg-exploration.png')] bg-cover bg-bottom bg-no-repeat transition-[opacity,transform] duration-700 ease-out ${
        active ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      <div className="mx-auto flex h-full min-h-svh w-full max-w-[1440px] flex-col items-center px-5 pt-32 md:px-10">
        <h2
          id="process-scene-title"
          className="flex items-center justify-center gap-3 text-center text-2xl leading-8 text-white"
        >
          <span aria-hidden="true" className="text-white/42">
            &lt;
          </span>
          {process.title}
          <span aria-hidden="true" className="text-white/42">
            &gt;
          </span>
        </h2>

        <div className="process-orbit mt-[155px] md:mt-[105px]">
          <div className="process-orbit-plane">
            <Image
              src="/icons/ring.svg"
              alt=""
              width={765}
              height={251}
              aria-hidden="true"
              className="pixelated pointer-events-none absolute inset-0 size-full"
            />

            {steps.map((step, index) => (
              <div
                key={step.src}
                className={`process-orbit-node ${step.orbitClass}`}
              >
                <button
                  type="button"
                  tabIndex={active ? 0 : -1}
                  aria-label={step.alt}
                  onMouseEnter={() => setHighlightedStep(index)}
                  onMouseLeave={() => setHighlightedStep(null)}
                  onFocus={() => setHighlightedStep(index)}
                  onBlur={() => setHighlightedStep(null)}
                  className="process-orbit-control"
                >
                  <span className="process-orbit-upright">
                    <Image
                      src={step.src}
                      alt=""
                      fill
                      sizes="(max-width: 767px) 92px, 120px"
                      aria-hidden="true"
                      className="pixelated object-contain"
                    />
                  </span>
                </button>
              </div>
            ))}
          </div>

          <p
            aria-live="polite"
            className={`mt-8 h-6 text-center text-sm tracking-[0.04em] text-white/70 transition-opacity duration-200 md:mt-11 ${
              highlightedStep === null ? "opacity-0" : "opacity-100"
            }`}
          >
            {highlightedStep === null
              ? process.idleLabel
              : `0${highlightedStep + 1} · ${steps[highlightedStep]?.label ?? ""} · ${steps[highlightedStep]?.labelCn ?? ""}`}
          </p>
        </div>
      </div>

      <style jsx>{`
        .process-orbit {
          position: relative;
          width: 300px;
        }

        .process-orbit-plane {
          position: relative;
          width: 300px;
          height: 178px;
          transform: rotate(-8deg);
        }

        .process-orbit-node {
          position: absolute;
          top: 0;
          left: 0;
          width: 92px;
          height: 92px;
          offset-path: ellipse(104px 52px at 150px 89px);
          offset-anchor: 50% 50%;
          offset-rotate: 0deg;
          animation: process-orbit-lap 20s linear infinite;
          will-change: offset-distance;
        }

        .process-orbit-step-1 {
          animation-delay: -15s;
        }

        .process-orbit-step-2 {
          animation-delay: 0s;
        }

        .process-orbit-step-3 {
          animation-delay: -5s;
        }

        .process-orbit-step-4 {
          animation-delay: -10s;
        }

        .process-orbit:has(.process-orbit-control:hover) .process-orbit-node,
        .process-orbit:focus-within .process-orbit-node {
          animation-play-state: paused;
        }

        .process-orbit-control {
          display: block;
          width: 100%;
          height: 100%;
          cursor: pointer;
          border: 0;
          border-radius: 999px;
          background: transparent;
          outline: none;
          transition: transform 440ms cubic-bezier(0.16, 1.55, 0.35, 1);
        }

        .process-orbit-control:hover,
        .process-orbit-control:focus {
          transform: scale(1.3);
        }

        .process-orbit-control:focus-visible {
          box-shadow: 0 0 0 1px rgb(255 255 255 / 82%);
        }

        .process-orbit-upright {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          transform: rotate(8deg);
        }

        @keyframes process-orbit-lap {
          from {
            offset-distance: 0%;
          }
          to {
            offset-distance: 100%;
          }
        }

        @media (min-width: 768px) {
          .process-orbit {
            width: 765px;
          }

          .process-orbit-plane {
            width: 765px;
            height: 251px;
          }

          .process-orbit-node {
            width: 120px;
            height: 120px;
            offset-path: ellipse(350px 120px at 382.5px 125.5px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .process-orbit-node {
            animation: none;
            will-change: auto;
          }

          .process-orbit-step-1 {
            offset-distance: 75%;
          }

          .process-orbit-step-2 {
            offset-distance: 0%;
          }

          .process-orbit-step-3 {
            offset-distance: 25%;
          }

          .process-orbit-step-4 {
            offset-distance: 50%;
          }

          .process-orbit-control {
            transition: none;
          }
        }
      `}</style>
    </section>
  );
}
