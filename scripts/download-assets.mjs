#!/usr/bin/env node

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://careers.kimi.com";

const assets = [
  ["/assets/cursors/retrosmart/default.png", "public/cursors/default.png"],
  ["/assets/cursors/retrosmart/pointer.png", "public/cursors/pointer.png"],
  ["/assets/fonts/fusion-pixel-12px-mono-zh-hans.otf", "public/fonts/fusion-pixel-12px-mono-zh-hans.otf"],
  ["/assets/icons/btn-swipe-up.svg", "public/icons/btn-swipe-up.svg"],
  ["/assets/icons/close.svg", "public/icons/close.svg"],
  ["/assets/icons/hamburg.svg", "public/icons/hamburg.svg"],
  ["/assets/icons/hover-close.png", "public/icons/hover-close.png"],
  ["/assets/icons/left.svg", "public/icons/left.svg"],
  ["/assets/icons/localized/en-US/join-us-logo.svg", "public/icons/join-us-logo.svg"],
  ["/assets/icons/localized/en-US/to-land.svg", "public/icons/to-land.svg"],
  ["/assets/icons/logo-pixel.svg", "public/icons/logo-pixel.svg"],
  ["/assets/icons/logo.svg", "public/icons/logo.svg"],
  ["/assets/icons/right-big.svg", "public/icons/right-big.svg"],
  ["/assets/icons/right.svg", "public/icons/right.svg"],
  ["/assets/icons/ring.svg", "public/icons/ring.svg"],
  ["/assets/scenes/hero/bg-hero.png", "public/images/hero/bg-hero.png"],
  ["/assets/scenes/land-on/buttons/en-US/campus.svg", "public/images/land-on/campus.svg"],
  ["/assets/scenes/land-on/buttons/en-US/campus_hover.svg", "public/images/land-on/campus-hover.svg"],
  ["/assets/scenes/land-on/buttons/en-US/know.svg", "public/images/land-on/know.svg"],
  ["/assets/scenes/land-on/buttons/en-US/know_hover.svg", "public/images/land-on/know-hover.svg"],
  ["/assets/scenes/land-on/buttons/en-US/social.svg", "public/images/land-on/social.svg"],
  ["/assets/scenes/land-on/buttons/en-US/social_hover.svg", "public/images/land-on/social-hover.svg"],
  ["/assets/scenes/about-us/backgrounds/bg-about-us.png", "public/images/about/bg-about-us.png"],
  ["/assets/scenes/about-us/backgrounds/bg-about-us-2.png", "public/images/about/bg-about-us-2.png"],
  ["/assets/scenes/about-us/backgrounds/bg-exploration.png", "public/images/about/bg-exploration.png"],
  ["/assets/scenes/about-us/pixel-flow.webm", "public/videos/pixel-flow.webm"],
  ...Array.from({ length: 5 }, (_, index) => {
    const name = index + 1;
    return [
      `/assets/scenes/about-us/process/explore-${name}.png`,
      `public/images/about/process/explore-${name}.png`,
    ];
  }),
  ...Array.from({ length: 11 }, (_, index) => {
    const name = String(index + 1).padStart(2, "0");
    return [
      `/assets/scenes/about-us/process/phone/${name}.png`,
      `public/images/about/process/phone-${name}.png`,
    ];
  }),
  ["/assets/scenes/about-us/process/step1.png", "public/images/about/process/step1.png"],
  ["/assets/scenes/about-us/process/step2.png", "public/images/about/process/step2.png"],
  ["/assets/scenes/about-us/process/step3.png", "public/images/about/process/step3.png"],
  ["/assets/scenes/about-us/process/step4.png", "public/images/about/process/step4.png"],
  ...Array.from({ length: 11 }, (_, index) => {
    const name = String(index + 1).padStart(2, "0");
    return [
      `/assets/scenes/about-us/process/small/${name}.png`,
      `public/images/about/process/${name}.png`,
    ];
  }),
  ["/favicon.ico", "public/seo/favicon.ico"],
  ["/favicon.ico", "src/app/favicon.ico"],
];

const concurrency = 4;
let nextIndex = 0;
let downloaded = 0;

async function worker() {
  while (nextIndex < assets.length) {
    const index = nextIndex;
    nextIndex += 1;
    const [sourcePath, targetPath] = assets[index];
    const response = await fetch(`${origin}${sourcePath}`);
    if (!response.ok) {
      throw new Error(`Failed ${response.status}: ${sourcePath}`);
    }

    const destination = join(root, targetPath);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, Buffer.from(await response.arrayBuffer()));
    downloaded += 1;
    console.log(`Downloaded ${targetPath}`);
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
console.log(`Downloaded ${downloaded} assets.`);
