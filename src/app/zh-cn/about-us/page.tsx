import type { Metadata } from "next";

import { SceneDeck } from "@/components/careers/SceneDeck";

export const metadata: Metadata = {
  title: "About Xuanjin | UI/UX Designer",
  description:
    "关于贺宣锦（Xuanjin.He）— UI/UX Designer，AI × UX 探索者。",
};

export default function ChineseAboutUsPage() {
  return <SceneDeck initialScene={3} locale="zh-cn" />;
}
