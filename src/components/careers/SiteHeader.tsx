"use client";

import Image from "next/image";
import { useState } from "react";

import type { SiteCopy } from "@/lib/i18n";

interface SiteHeaderProps {
  copy: SiteCopy;
  currentScene: number;
  onNavigate: (index: number) => void;
}

interface NavigationItem {
  label: string;
  scene?: number;
  href?: string;
}

export function SiteHeader({ copy, currentScene, onNavigate }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { header } = copy;

  const navigationItems: NavigationItem[] = [
    { label: header.about, scene: 1 },
    { label: header.works, scene: 2 },
    { label: header.awards, scene: 5 },
    { label: header.contact, scene: 6 },
  ];

  const navigateToScene = (scene: number) => {
    setMenuOpen(false);
    onNavigate(scene);
  };

  return (
    <header className="absolute inset-x-0 top-0 z-40 h-[60px] text-white">
      <div className="relative z-10 flex h-full items-center justify-between px-5 py-4 md:px-10">
        <button
          type="button"
          aria-label={header.homeAria}
          onClick={() => navigateToScene(0)}
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Image
            src={header.logoSrc}
            alt={header.logoAlt}
            width={header.logoWidth}
            height={header.logoHeight}
            priority
            className="h-7 w-auto"
          />
        </button>

        <nav aria-label={header.navAria} className="hidden items-center gap-16 text-base leading-6 tracking-wider md:flex">
          {navigationItems.map((item) => {
            const interactiveClasses =
              "rounded-sm px-1 py-0.5 text-white transition-colors duration-200 hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none";

            if (item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={interactiveClasses}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                aria-current={currentScene === item.scene ? "page" : undefined}
                onClick={() => navigateToScene(item.scene ?? 0)}
                className={interactiveClasses}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? header.menuCloseAria : header.menuOpenAria}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          className="flex size-8 items-center justify-center rounded-sm transition-colors duration-200 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:hidden"
        >
          <Image src="/icons/hamburg.svg" alt="" width={24} height={24} />
        </button>
      </div>

      <nav
        id="mobile-navigation"
        aria-label={header.mobileNavAria}
        aria-hidden={!menuOpen}
        className={`absolute inset-x-0 top-[60px] origin-top border-t border-white/15 bg-black transition-[opacity,transform] duration-[250ms] md:hidden ${
          menuOpen ? "scale-y-100 opacity-100" : "pointer-events-none scale-y-0 opacity-0"
        }`}
      >
        {navigationItems.map((item) => {
          const rowClasses =
            "flex w-full items-center border-b border-white/15 px-5 py-5 text-left text-base leading-5 text-white transition-colors duration-200 hover:bg-white hover:text-black focus-visible:bg-white focus-visible:text-black focus-visible:outline-none";

          if (item.href) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                tabIndex={menuOpen ? 0 : -1}
                className={rowClasses}
              >
                {item.label}
              </a>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              tabIndex={menuOpen ? 0 : -1}
              aria-current={currentScene === item.scene ? "page" : undefined}
              onClick={() => navigateToScene(item.scene ?? 0)}
              className={rowClasses}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
