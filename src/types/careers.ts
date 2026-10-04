import type { ComponentType } from "react";

import type { SiteCopy } from "@/lib/i18n";

export type SceneId =
  | "hero"
  | "mission"
  | "land-on"
  | "values"
  | "odyssey"
  | "exploration"
  | "process"
  | "about"
  | "finale";

export interface SceneProps {
  active: boolean;
  copy: SiteCopy;
  onNavigate?: (index: number) => void;
}

export interface SceneDefinition {
  id: SceneId;
  path: "/" | "/land-on" | "/about-us";
  component: ComponentType<SceneProps>;
}

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
  image: string;
  phoneImage: string;
}

export interface ExplorationMetric {
  value: number;
  suffix?: string;
  title: string;
  description: string;
  image: string;
}
