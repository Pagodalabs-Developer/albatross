"use client";

import { AnimatePresence } from "framer-motion";
import { AudioLines } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

export const navLinks = [
  { label: "HOME", href: "/#home", id: "home" },
  { label: "MUSIC", href: "/#catalog", id: "catalog" },
  { label: "EVENTS", href: "/#events", id: "events" },
  { label: "BAND", href: "/#band", id: "band" },
  { label: "NEWS", href: "/news", id: "news" },
  { label: "GALLERY", href: "/gallery", id: "gallery" },
  { label: "CONTACT", href: "/#contact", id: "contact" },
];

export function Header() {
  const [inView, setInView] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const routeMatch = navLinks.find(
    ({ href }) => !href.startsWith("/#") && pathname.startsWith(href),
  );
  const active = pathname === "/" ? inView : (routeMatch?.id ?? inView);

  useEffect(() => {
    const sections = navLinks
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setInView(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border-subtle bg-surface transition-colors duration-theme md:h-[4.5rem]">
      <div className="flex h-full items-center justify-between px-4 md:px-8">
        <Link href="/#home" className="flex items-center gap-2.5">
          <span aria-hidden className="font-display text-headline leading-none text-brand">
            A
          </span>
          <span className="text-label font-semibold tracking-[0.18em] text-foreground">
            ALBATROSS
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-5 lg:flex">
          {navLinks.map(({ label, href, id }) => (
            <Link
              key={id}
              href={href}
              aria-current={active === id ? "true" : undefined}
              className={`relative text-label font-semibold tracking-[0.18em] transition-colors hover:text-brand ${
                active === id ? "text-brand" : "text-muted-foreground"
              }`}
            >
              {label}

              {active === id && (
                <span
                  aria-hidden
                  className="absolute -bottom-1.5 left-0 h-0.5 w-full bg-primary"
                />
              )}
            </Link>
          ))}

          <Link
            href="/#catalog"
            className="inline-flex items-center gap-2 rounded-button border border-primary px-4 py-2.5 text-label font-semibold tracking-[0.18em] text-brand transition-[background-color,color,transform] duration-[160ms] ease-entrance hover:bg-primary hover:text-primary-foreground active:scale-[0.97]"
          >
            LISTEN
            <AudioLines aria-hidden className="size-3.5" />
          </Link>
          <ThemeSwitcher />
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeSwitcher />
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex min-h-11 min-w-11 items-center justify-center text-xl text-foreground transition-[color,transform] duration-150 ease-entrance hover:text-brand active:scale-[0.9]"
          >
            ☰
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && <MobileNavigation onClose={() => setMenuOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
