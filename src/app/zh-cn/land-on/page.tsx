import type { Metadata } from "next";

import { SceneDeck } from "@/components/careers/SceneDeck";

export const metadata: Metadata = {
  title: "Works | Xuanjin.He",
  description:
    "贺宣锦（Xuanjin.He）精选作品 — AI 产品、决策体验、文化数字体验。",
};

export default function ChineseLandOnPage() {
  return <SceneDeck initialScene={2} locale="zh-cn" />;
}
