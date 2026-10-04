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
    "Portfolio of Xuanjin.He (贺宣锦) — UI/UX Designer bringing clarity to complexity across AI products and cultural digital experiences.",
  icons: {
    icon: "/seo/favicon.ico",
  },
};

export default function EnglishRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" className={`${fusionPixel.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
