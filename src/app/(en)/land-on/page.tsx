import type { Metadata } from "next";

import { SceneDeck } from "@/components/careers/SceneDeck";

export const metadata: Metadata = {
  title: "Works | Xuanjin.He",
  description:
    "Selected works by Xuanjin.He across AI products, decision experiences, and cultural digital experiences.",
};

export default function LandOnPage() {
  return <SceneDeck initialScene={2} locale="en" />;
}
