// 作品集数据。每个作品对应 OdysseyScene 左侧胶片轨的一格，
// 按下标与 i18n.ts 里的 `odyssey.timeline` / `odyssey.filmTitles` 一一对应。

export interface Work {
  id: string;
  /** 作品图片，自上而下排列展示。 */
  images: readonly string[];
}

function imageSequence(dir: string, from: number, to: number): string[] {
  const images: string[] = [];
  for (let n = from; n <= to; n += 1) {
    images.push(`/works/${dir}/${n}.webp`);
  }
  return images;
}

export const WORKS: readonly Work[] = [
  { id: "mango", images: imageSequence("mango", 1, 19) },
  { id: "intern", images: imageSequence("intern", 20, 30) },
  { id: "gugong", images: imageSequence("gugong", 31, 39) },
  { id: "nianhua", images: imageSequence("nianhua", 39, 45) },
];
