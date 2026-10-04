"use client";

import Image from "next/image";
import { PixelFlowCanvas } from "@/components/careers/PixelFlowCanvas";

import type { SceneProps } from "@/types/careers";

export function ValuesScene({ active, copy }: SceneProps) {
  const { values } = copy;

  return (
    <section
      aria-hidden={!active}
      aria-label="About Xuanjin"
      className={`relative min-h-svh w-full overflow-hidden bg-black text-white transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        aria-hidden="true"
        className="pixelated absolute inset-0 bg-cover bg-center bg-[url('/images/about/bg-about-us.png')]"
      />

      <PixelFlowCanvas active={active} />

      <div className="relative z-[1] mx-auto flex h-full min-h-svh w-full max-w-[1120px] flex-col items-center justify-center px-6 pt-32 pb-28 sm:px-12 lg:px-20">
        <h2 className="text-center text-[24px] leading-[32px] font-normal tracking-[0.96px]">
          {values.title}
        </h2>

        <div className="mt-10 w-full max-w-[620px]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-5">
            <div className="flex flex-col text-right text-[14px] leading-[22px] tracking-[0.56px] text-[#7A7A7A]">
              {values.leftColumn.map((value, index) => (
                <div key={value} className="mb-3 last:mb-0">
                  <div>{value}</div>
                  <div className="mt-1 text-[11px] leading-4 text-[#4A4A4A]">
                    {values.leftColumnCn[index] ?? ""}
                  </div>
                </div>
              ))}
            </div>

            <div
              aria-hidden="true"
              className="pixelated flex shrink-0 items-center justify-center self-center select-none"
            >
              <Image
                src="/icons/right.svg"
                alt=""
                width={27}
                height={24}
                priority
                className="pixelated h-6 w-[27px] object-contain"
              />
            </div>

            <div className="flex flex-col text-left text-[14px] leading-[22px] tracking-[0.56px] text-white">
              {values.rightColumn.map((value, index) => (
                <div key={value} className="mb-3 last:mb-0">
                  <div>{value}</div>
                  <div className="mt-1 text-[11px] leading-4 text-[#7A7A7A]">
                    {values.rightColumnCn[index] ?? ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
