export interface AwardImage {
  src: string;
  caption: string;
  /**
   * True when the source image is landscape (wider than tall). The marquee sizes
   * landscape certificates wider so they render at a comparable size to the
   * portrait ones instead of letterboxing into a thin strip.
   */
  landscape?: boolean;
  /**
   * Renders the landscape certificate slightly larger than the default landscape
   * size. Used when a landscape scan's certificate content sits visually smaller
   * in its frame (e.g. a photograph) and needs a bump to read as the same size.
   */
  large?: boolean;
}

/**
 * Award certificate images, indexed to match the Exploration metric-card order:
 *   0 = 国家级 (National), 1 = 省级 (Provincial), 2 = 市级 (Municipal), 3 = 校级 (School)
 *
 * `caption` is the original filename the user gave each image on their desktop,
 * minus the `.png` extension. Images live in `public/images/awards/<category>/`.
 */
export const awardsByCategory: readonly (readonly AwardImage[])[] = [
  [
    { src: "/images/awards/national/1.webp", caption: "2024-中国大学生广告艺术节学院奖-国家级-优秀奖" },
    { src: "/images/awards/national/2.webp", caption: "2024-中国大学生广告艺术节学院奖-国家级-入围奖-1" },
    { src: "/images/awards/national/3.webp", caption: "2024-中国大学生广告艺术节学院奖-国家级-入围奖-2" },
    { src: "/images/awards/national/4-v2.webp", caption: "2026-中国好创意(第二十届) 暨全国数字艺术设计大赛-国家级-三等奖" },
  ],
  [
    { src: "/images/awards/provincial/1.webp", caption: "2025-湖南省大学生数字媒体创意设计大赛-省级-一等奖" },
    { src: "/images/awards/provincial/2.webp", caption: "2025-第六届东方创意之星创新设计大赛-省级-银奖", landscape: true },
    { src: "/images/awards/provincial/3.webp", caption: "2026-中国好创意(第二十届) 暨全国数字艺术设计大赛-省级-一等奖" },
    { src: "/images/awards/provincial/4.webp", caption: "2026-中国好创意(第二十届) 暨全国数字艺术设计大赛-省级-二等奖" },
    { src: "/images/awards/provincial/5.webp", caption: "2026-湖南省大学生广告艺术大赛-省级-二等奖" },
    { src: "/images/awards/provincial/6.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-省级-三等奖-1" },
    { src: "/images/awards/provincial/7.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-省级-三等奖-2" },
    { src: "/images/awards/provincial/8.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-省级-三等奖-3" },
    { src: "/images/awards/provincial/9.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-省级-三等奖-4" },
    { src: "/images/awards/provincial/10.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-省级-三等奖-5" },
    { src: "/images/awards/provincial/11.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-省级-二等奖" },
    { src: "/images/awards/provincial/12.webp", caption: "2026-湖南省大学生服装设计大赛-省级-一等奖" },
    { src: "/images/awards/provincial/13.webp", caption: "2026-第十一届大学生公益广告大赛-省级-三等奖-1" },
    { src: "/images/awards/provincial/14.webp", caption: "2026-第十一届大学生公益广告大赛-省级-三等奖" },
  ],
  [
    { src: "/images/awards/municipal/1.webp", caption: "2024-湘潭大学城创新创业园英华路城市家具竞赛-市级-优胜奖-1", landscape: true, large: true },
    { src: "/images/awards/municipal/2.webp", caption: "2024-湘潭大学城创新创业园英华路城市家具竞赛-市级-优胜奖-2", landscape: true, large: true },
  ],
  [
    { src: "/images/awards/school/1.webp", caption: "2024-湖南省大学生工业设计竞赛-校级-三等奖" },
    { src: "/images/awards/school/2.webp", caption: "2024-湖南省大学生数字媒体创意设计大赛-校级-优秀奖" },
    { src: "/images/awards/school/3.webp", caption: "2024-湖南省大学生数字媒体创意设计大赛-校级-入围奖" },
    { src: "/images/awards/school/4.webp", caption: "2025-湖南省大学生工业设计竞赛-校级-三等奖" },
    { src: "/images/awards/school/5.webp", caption: "2026-湖南省大学生广告艺术大赛-校级-三等奖" },
    { src: "/images/awards/school/6.webp", caption: "2026-湖南省大学生广告艺术大赛-校级-优秀奖-1" },
    { src: "/images/awards/school/7.webp", caption: "2026-湖南省大学生广告艺术大赛-校级-优秀奖-2" },
    { src: "/images/awards/school/8-v2.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-一等奖" },
    { src: "/images/awards/school/9.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-1" },
    { src: "/images/awards/school/10.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-2" },
    { src: "/images/awards/school/11.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-3" },
    { src: "/images/awards/school/12.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-4" },
    { src: "/images/awards/school/13.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-5" },
    { src: "/images/awards/school/14.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-6" },
    { src: "/images/awards/school/15.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-7" },
    { src: "/images/awards/school/16.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-8" },
    { src: "/images/awards/school/17.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-三等奖-9" },
    { src: "/images/awards/school/18.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-二等奖-1" },
    { src: "/images/awards/school/19.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-二等奖-2" },
    { src: "/images/awards/school/20.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-二等奖-3" },
    { src: "/images/awards/school/21.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-优秀奖-1" },
    { src: "/images/awards/school/22.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-优秀奖-2" },
    { src: "/images/awards/school/23.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-优秀奖-3" },
    { src: "/images/awards/school/24.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-优秀奖-4" },
    { src: "/images/awards/school/25.webp", caption: "2026-湖南省大学生数字媒体创意设计大赛-校级-优秀奖-5" },
  ],
];
