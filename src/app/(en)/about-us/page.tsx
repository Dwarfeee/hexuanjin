import type { Metadata } from "next";

import { SceneDeck } from "@/components/careers/SceneDeck";

export const metadata: Metadata = {
  title: "About Xuanjin | UI/UX Designer",
  description:
    "About Xuanjin.He (贺宣锦) — UI/UX Designer, AI × UX Explorer. Design principles, journey, and selected works.",
};

export default function AboutUsPage() {
  return <SceneDeck initialScene={3} locale="en" />;
}
