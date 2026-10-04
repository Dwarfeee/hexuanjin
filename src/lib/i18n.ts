export type Locale = "en" | "zh-cn";

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_PREFIX: Record<Locale, string> = {
  en: "",
  "zh-cn": "/zh-cn",
};

export const HTML_LANG: Record<Locale, string> = {
  en: "en-US",
  "zh-cn": "zh-CN",
};

export function localizedHref(locale: Locale, path: "/" | string): string {
  const prefix = LOCALE_PREFIX[locale];
  if (path === "/") {
    return prefix === "" ? "/" : prefix;
  }
  return `${prefix}${path}`;
}

export function getLocaleFromPathname(pathname: string): Locale {
  return pathname === "/zh-cn" || pathname.startsWith("/zh-cn/")
    ? "zh-cn"
    : "en";
}

export interface HeaderCopy {
  works: string;
  about: string;
  awards: string;
  contact: string;
  logoSrc: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  homeAria: string;
  menuOpenAria: string;
  menuCloseAria: string;
  navAria: string;
  mobileNavAria: string;
}

export interface HeroCopy {
  subtitle: string;
  subtitleCn: string;
}

export interface MissionCopy {
  arc: string;
  arcCn: string;
  name: string;
  intro: readonly string[];
}

export interface WorksEntryCopy {
  index: string;
  category: string;
  title: string;
  href: string;
  children?: readonly WorksEntryCopy[];
}

export interface LandOnCopy {
  hubLabel: string;
  hubAria: string;
  entries: readonly WorksEntryCopy[];
  bottomCta: string;
  bottomSubtitle: string;
  navAria: string;
  closeAria: string;
}

export interface ValuesCopy {
  title: string;
  leftColumn: readonly string[];
  rightColumn: readonly string[];
  leftColumnCn: readonly string[];
  rightColumnCn: readonly string[];
}

export interface TimelineCopyItem {
  time: string;
  title: string;
  description: string;
}

export interface OdysseyCopy {
  ariaLabel: string;
  worksHeading: string;
  poemLines: readonly string[];
  poemFinalLine: string;
  poemLinesCn: readonly string[];
  poemFinalLineCn: string;
  timeline: readonly TimelineCopyItem[];
  filmTitles: readonly string[];
  closeAria: string;
}

export interface ExplorationMetricCopy {
  title: string;
  description: string;
}

export interface ExplorationCopy {
  title: string;
  subtitle: string;
  metrics: readonly ExplorationMetricCopy[];
}

export interface ProcessStepCopy {
  label: string;
  labelCn: string;
  alt: string;
}

export interface ProcessCopy {
  title: string;
  idleLabel: string;
  steps: readonly ProcessStepCopy[];
}

export interface AboutCopy {
  title: string;
  name: string;
  role: string;
  position: string;
  intro: string;
}

export interface FinaleCopy {
  leadLine1: string;
  leadLine1Cn: string;
  leadLine2: string;
  leadLine2Cn: string;
  cta: string;
  awardsHeading: string;
  awardsSubtitle: string;
  awardsSubtitleCn: string;
  awards: readonly string[];
  contactHeading: string;
  contactSubtitle: string;
  contactSubtitleCn: string;
  contactCta: string;
  contactHref: string;
  logoAlt: string;
  copyright: string;
  colophon: string;
}

export interface SiteCopy {
  locale: Locale;
  mainAria: string;
  hints: readonly string[];
  header: HeaderCopy;
  hero: HeroCopy;
  mission: MissionCopy;
  landOn: LandOnCopy;
  values: ValuesCopy;
  odyssey: OdysseyCopy;
  exploration: ExplorationCopy;
  process: ProcessCopy;
  about: AboutCopy;
  finale: FinaleCopy;
}

const enCopy: SiteCopy = {
  locale: "en",
  mainAria: "Xuanjin.He portfolio scenes",
  hints: [
    "Swipe to explore",
    "Continue",
    "",
    "Continue",
    "Continue",
    "Continue",
    "",
  ],
  header: {
    works: "WORKS",
    about: "ABOUT ME",
    awards: "AWARDS",
    contact: "CONTACT",
    logoSrc: "/icons/join-us-logo.svg",
    logoAlt: "Xuanjin.He",
    logoWidth: 232,
    logoHeight: 24,
    homeAria: "Return to the opening scene",
    menuOpenAria: "Open navigation menu",
    menuCloseAria: "Close navigation menu",
    navAria: "Primary navigation",
    mobileNavAria: "Mobile navigation",
  },
  hero: {
    subtitle: "UI/UX Designer exploring AI, products & experiences.",
    subtitleCn: "从用户、产品与 AI 出发，\n探索更清晰的使用体验。",
  },
  mission: {
    arc: "Finding the Optimal Path from Complexity to Experience",
    arcCn: "寻找从复杂到体验的最优路径",
    name: "贺宣锦",
    intro: [
      "湖南科技大学视觉传达设计专业在读，专注 UI/UX 设计与用户体验方向，GPA 3.6/4.0，专业排名 1/40，获一等奖学金、二等奖学金等多项荣誉。",
      "曾参与芒果 UI/UX 实习，负责「芒果数问·数据分析 Agent」B 端 AI 产品设计，参与用户研究、AI 交互、信息架构、界面设计、设计系统及 PC 端适配，具备从调研到落地的完整产品设计实践经验。",
      "关注用户需求、产品逻辑与 AI × UX，擅长将复杂信息转化为清晰、易用的数字产品体验，并获得多项国家级、省级奖项。",
    ],
  },
  landOn: {
    hubLabel: "[ WORKS ]",
    hubAria: "Open selected works",
    entries: [
      {
        index: "01",
        category: "AI PRODUCT",
        title: "芒果数问 · 数据分析 Agent",
        href: "",
      },
      {
        index: "02",
        category: "AI EXPERIENCE",
        title: "AI 实习猎手",
        href: "",
      },
      {
        index: "03",
        category: "CULTURAL EXPERIENCE",
        title: "儿童文化与数字体验",
        href: "",
        children: [
          {
            index: "01",
            category: "",
            title: "故宫脊兽 · ADHD 儿童文创小游戏",
            href: "",
          },
          {
            index: "02",
            category: "",
            title: "绵竹木版年画工坊体验小游戏",
            href: "",
          },
        ],
      },
    ],
    bottomCta: "[ VIEW MY WORK >> ]",
    bottomSubtitle: "Selected projects · UI / UX / AI",
    navAria: "Selected works",
    closeAria: "Close works",
  },
  values: {
    title: "Design Principles",
    leftColumn: ["Visual", "Function", "Information", "Answer", "Following"],
    rightColumn: ["Experience", "Meaning", "Decision", "Reasoning", "Creating"],
    leftColumnCn: ["视觉", "功能", "信息", "答案", "跟随"],
    rightColumnCn: ["体验", "意义", "决策", "依据", "创造"],
  },
  odyssey: {
    ariaLabel: "About Xuanjin: design journey",
    worksHeading: "Selected Works",
    poemLines: [
      "Maybe one day I will find",
      "A clearer way to design",
      "This journey has no end",
    ],
    poemFinalLine: "I hope it never does",
    poemLinesCn: [
      "也许有一天我会找到",
      "一条更清晰的设计路径",
      "这趟旅途没有尽头",
    ],
    poemFinalLineCn: "我希望它一直没有尽头",
    timeline: [
      {
        time: "2023",
        title: "Mango AI Data Product",
        description: "参与芒果 AI 数据分析产品设计",
      },
      {
        time: "2025",
        title: "AI-driven Decision Experience",
        description: "探索 AI 驱动的求职决策体验",
      },
      {
        time: "2025",
        title: "Children · Focus · Digital Experience",
        description: "探索儿童专注训练与数字体验",
      },
      {
        time: "2026",
        title: "Children · Culture · Digital Experience",
        description: "探索儿童文化与数字体验",
      },
    ],
    filmTitles: [
      "芒果数问 · 数据分析 Agent",
      "AI 实习助手",
      "故宫脊兽 · ADHD 儿童文创小游戏设计",
      "绵竹木版年画工坊体验小游戏",
    ],
    closeAria: "Close",
  },
  exploration: {
    title: "AWARDS",
    subtitle: "部分奖项证书还未发放，此处展示公示",
    metrics: [
      { title: "National-level Awards", description: "国家级奖项（4项）" },
      { title: "Provincial-level Awards", description: "省级奖项（14项）" },
      { title: "Municipal-level Awards", description: "市级奖项（2项）" },
      { title: "School-level Awards", description: "校级奖项（25项）" },
    ],
  },
  process: {
    title: "Design process",
    idleLabel: "Design process",
    steps: [
      { label: "Observe", labelCn: "用户洞察", alt: "Observe · 用户洞察" },
      { label: "Define", labelCn: "问题定义", alt: "Define · 问题定义" },
      { label: "Design", labelCn: "方案设计", alt: "Design · 方案设计" },
      { label: "Validate", labelCn: "验证迭代", alt: "Validate · 验证迭代" },
    ],
  },
  about: {
    title: "About Xuanjin",
    name: "贺宣锦",
    role: "UI/UX Designer",
    position: "AI × UX Explorer",
    intro:
      "湖南科技大学视觉传达设计专业在读，专注 UI/UX 设计与用户体验方向。\n\n关注用户需求、产品逻辑与 AI × UX，擅长将复杂信息转化为清晰、易用的数字产品体验。\n\n曾参与芒果 UI/UX 实习，负责/参与「芒果数问 · 数据分析 Agent」B 端 AI 产品设计，涉及用户研究、AI 交互、信息架构、界面设计、设计系统及 PC 端适配。",
  },
  finale: {
    leadLine1: "I look forward to exploring the future of design with you.",
    leadLine1Cn: "期待与你一起探索设计的下一种可能。",
    leadLine2: "Design with curiosity.\nBuild with intention.",
    leadLine2Cn: "以好奇探索设计，以思考创造体验。",
    cta: "Explore my work",
    awardsHeading: "Awards & Honors",
    awardsSubtitle: "Recognition along the way.",
    awardsSubtitleCn: "一路走来的认可与积累。",
    awards: ["National-level Awards", "Provincial-level Awards", "Academic Scholarships"],
    contactHeading: "Let's Connect",
    contactSubtitle: "Interested in creating meaningful digital experiences together?",
    contactSubtitleCn: "期待一起探索更有意义的数字体验。",
    contactCta: "Get in touch",
    contactHref: "mailto:1960074210@qq.com",
    logoAlt: "Xuanjin.He",
    copyright: "Copyright © 2026 Xuanjin.He. All Rights Reserved",
    colophon: "Designed by Xuanjin.He",
  },
};

const zhCnCopy: SiteCopy = {
  ...enCopy,
  locale: "zh-cn",
};

export const SITE_COPY: Record<Locale, SiteCopy> = {
  en: enCopy,
  "zh-cn": zhCnCopy,
};

export function getCopy(locale: Locale): SiteCopy {
  return SITE_COPY[locale];
}
