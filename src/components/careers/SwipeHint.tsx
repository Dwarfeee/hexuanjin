import Image from "next/image";

interface SwipeHintProps {
  label?: string;
  visible: boolean;
}

export function SwipeHint({ label = "Swipe up", visible }: SwipeHintProps) {
  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none absolute inset-x-0 bottom-[clamp(22px,4svh,32px)] z-20 flex h-[58px] flex-col items-center justify-center gap-1.5 transition-[opacity,transform] duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      <Image
        src="/icons/btn-swipe-up.svg"
        alt=""
        width={18}
        height={18}
        className="animate-[chevron-rise_1.6s_ease-in-out_infinite] opacity-70"
      />
      <span className="text-sm leading-5 text-white/42">{label}</span>
    </div>
  );
}
