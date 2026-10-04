import Image from "next/image";

import type { SceneProps } from "@/types/careers";

export function HeroScene({ active, copy }: SceneProps) {
  return (
    <section
      aria-hidden={!active}
      className={`relative h-svh w-full overflow-hidden bg-black text-white transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div className="absolute top-[50svh] left-1/2 h-[72svh] w-[128svh] -translate-x-1/2 -translate-y-1/2 md:inset-0 md:h-auto md:w-auto md:translate-x-0 md:translate-y-0">
        <Image
          alt=""
          className="pixelated object-cover grayscale"
          fill
          priority
          unoptimized
          sizes="100vw"
          src="/images/hero/bg-hero.png"
        />
      </div>

      <h1 className="absolute top-[154px] left-5 flex w-[calc(100%_-_40px)] flex-col text-shadow-[-4px_6px_#000] md:top-[150px] md:left-20 md:w-[380px]">
        <span className="text-[24px] leading-6 md:text-[64px] md:leading-16">
          Xuanjin.He
        </span>
        <span className="mt-3.5 whitespace-pre-line text-[14px] leading-6 text-white/70 md:mt-5 md:text-[18px] md:leading-8">
          {copy.hero.subtitleCn}
        </span>
      </h1>

      <div className="absolute right-5 bottom-[132px] left-5 flex flex-col items-end text-right text-shadow-[-4px_6px_#000] md:right-20 md:bottom-[139px] md:left-auto md:w-[534px]">
        <p className="text-[24px] leading-6 md:text-[64px] md:leading-16">Explore my work</p>
        <p className="mt-2.5 whitespace-nowrap text-[24px] leading-6 md:text-[64px] md:leading-16">
          Design with purpose.
        </p>
      </div>

      <div className="absolute bottom-[97px] left-20 hidden w-[405px] flex-col md:flex">
        <p className="text-[28px] leading-8 text-white">UI/UX Designer</p>
        <p className="mt-5 whitespace-pre-line text-[18px] leading-6 text-white/45">
          Designing with curiosity, building with intention.
        </p>
        <p className="mt-2.5 text-[14px] leading-5 text-white/40">
          以好奇探索设计，以思考创造体验。
        </p>
      </div>
    </section>
  );
}
