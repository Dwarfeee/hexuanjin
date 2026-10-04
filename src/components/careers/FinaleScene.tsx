import type { SceneProps } from "@/types/careers";

export function FinaleScene({ active, copy, onNavigate }: SceneProps) {
  const { finale } = copy;

  return (
    <section
      aria-hidden={!active}
      inert={!active}
      className={`relative flex h-svh min-h-0 flex-col overflow-x-hidden bg-black text-white transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
        <div className="pointer-events-none absolute inset-0 z-10 opacity-50">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 size-full object-cover grayscale"
          >
            <source src="/videos/pixel-flow.webm" type="video/webm" />
          </video>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[200px] z-20 h-[400px]"
          style={{ background: "linear-gradient(to bottom, transparent 0%, black 100%)" }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[200px] bg-black" />
      </div>

      <div className="pointer-events-none relative z-10 flex min-h-0 flex-1 flex-col px-6 pt-[88px] pb-4 md:px-10 md:pt-24">
        <div
          className={`pointer-events-auto flex flex-1 flex-col items-center justify-center text-center transition-[opacity,transform] delay-150 duration-700 ease-out ${
            active ? "translate-y-16 opacity-100" : "translate-y-[84px] opacity-0"
          }`}
        >
          <p className="w-full text-center whitespace-nowrap text-[11px] leading-[18px] font-normal tracking-normal text-white md:text-[22px] md:leading-[36px] md:tracking-[0.36px]">
            {finale.leadLine1}
          </p>
          <p className="mt-2 w-full max-w-[520px] text-center text-[12px] leading-5 tracking-[0.04em] text-white/45 md:text-[16px] md:leading-7">
            {finale.leadLine1Cn}
          </p>
          <p className="mt-8 w-full max-w-[520px] text-center text-[15px] leading-[24px] font-normal tracking-[0.36px] whitespace-pre-line text-white md:text-[22px] md:leading-[36px]">
            {finale.leadLine2}
          </p>
          <p className="mt-2 w-full max-w-[520px] text-center text-[12px] leading-5 tracking-[0.04em] text-white/45 md:text-[16px] md:leading-7">
            {finale.leadLine2Cn}
          </p>
          <button
            type="button"
            onClick={() => onNavigate?.(2)}
            aria-label={finale.cta}
            className="mt-10 -translate-x-2 rounded-md border border-white/25 px-5 py-2.5 text-[15px] leading-6 tracking-[0.04em] text-white transition-all duration-200 hover:scale-110 hover:bg-white hover:text-black focus-visible:scale-110 focus-visible:bg-white focus-visible:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white md:px-6 md:py-3 md:text-[18px] md:leading-7"
          >
            {finale.cta}
          </button>
        </div>
      </div>

      <div className="pointer-events-auto relative z-20 shrink-0">
        <footer className="relative flex w-full shrink-0 flex-col justify-end px-6 py-8 text-white md:px-10 md:py-12">
          <div className="relative mx-auto flex w-full flex-row items-end justify-between gap-4 md:gap-16">
            <div className="flex max-w-sm flex-col items-start gap-6">
              <div className="text-[14px] leading-5 text-white/55">
                <p>贺宣锦</p>
                <p>Tel: 13007486700</p>
                <p>Email: 1960074210@qq.com</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-20 gap-y-8">
              <div className="ml-auto max-w-[280px] text-right">
                <h3 className="text-[14px] leading-5 text-white md:text-sm">
                  {finale.awardsHeading}
                </h3>
                <p className="mt-4 text-[12px] leading-5 text-white/45">
                  {finale.awardsSubtitle}
                </p>
                <p className="text-[12px] leading-5 text-white/30">
                  {finale.awardsSubtitleCn}
                </p>
                <ul className="mt-4 flex flex-col gap-1.5">
                  {finale.awards.map((award) => (
                    <li key={award} className="text-[14px] leading-6 text-white/55">
                      {award}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </section>
  );
}
