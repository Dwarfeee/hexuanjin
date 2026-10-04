import type { SceneProps } from "@/types/careers";

export function AboutScene({ active, copy }: SceneProps) {
  const { about } = copy;

  return (
    <section
      aria-hidden={!active}
      aria-label={about.title}
      className={`relative min-h-svh w-full overflow-hidden bg-black text-white transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        aria-hidden="true"
        className="pixelated absolute inset-0 bg-cover bg-center bg-[url('/images/about/bg-about-us.png')]"
      />

      <div className="relative z-[1] mx-auto flex h-full min-h-svh w-full max-w-[720px] flex-col items-center justify-center px-6 pt-32 pb-28 text-center">
        <h2 className="text-[24px] leading-[32px] font-normal tracking-[0.96px]">
          {about.title}
        </h2>

        <p className="mt-10 text-[40px] leading-none font-normal tracking-[0.02em]">
          {about.name}
        </p>
        <p className="mt-4 text-[18px] leading-6 text-white/70">{about.role}</p>
        <p className="mt-2 text-[16px] leading-6 text-white/45">
          {about.position}
        </p>

        <p className="mt-10 max-w-[560px] text-[16px] leading-[26px] tracking-[0.04em] whitespace-pre-line text-[#B8B8B8]">
          {about.intro}
        </p>
      </div>
    </section>
  );
}
