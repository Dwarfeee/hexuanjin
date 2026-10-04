import type { Metadata } from "next";
import localFont from "next/font/local";
import "../globals.css";

const fusionPixel = localFont({
  src: "../../../public/fonts/fusion-pixel-12px-mono-zh-hans.otf",
  variable: "--font-fusion-pixel",
  weight: "400",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Xuanjin.He · UI/UX Designer",
  description:
    "贺宣锦（Xuanjin.He）个人作品集 — UI/UX Designer，为复杂信息带来清晰体验。",
  icons: {
    icon: "/seo/favicon.ico",
  },
};

export default function ChineseRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${fusionPixel.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
