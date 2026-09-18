"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { navLinks } from "@/components/layout/header";
import { ThemeSwitcherRow } from "@/components/theme/theme-switcher";
import { EASE_ENTRANCE } from "@/lib/motion";

export function MobileNavigation({ onClose }: { onClose: () => void }) {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const panel = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.2, ease: EASE_ENTRANCE },
      }
    : {
        initial: { opacity: 0, x: "100%" },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: "100%", transition: { duration: 0.2, ease: EASE_ENTRANCE } },
        transition: { duration: 0.24, ease: EASE_ENTRANCE },
      };

  return (
    <>

      <motion.div
        aria-hidden
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: EASE_ENTRANCE }}
        className="fixed inset-0 z-40 bg-black/50 md:hidden"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        {...panel}
        className="fixed inset-0 z-50 flex flex-col bg-background px-6 pb-8 pt-6"
      >
        <div className="flex items-center justify-between border-b border-border-subtle pb-6">
          <span className="text-label font-semibold tracking-[0.18em] text-foreground">
            ALBATROSS
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center text-xl text-foreground transition-transform duration-150 ease-entrance active:scale-[0.97]"
          >
            ✕
          </button>
        </div>

        <nav aria-label="Main" className="flex flex-col gap-2 pt-8">
          {navLinks.map(({ label, href, id }) => (
            <Link
              key={id}
              href={href}
              onClick={onClose}
              className="flex min-h-11 items-center justify-between font-display text-headline text-foreground transition-transform duration-150 ease-entrance active:scale-[0.97]"
            >
              {label}
              <span aria-hidden className="text-xl text-brand">
                →
              </span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto">
          <ThemeSwitcherRow />
        </div>
      </motion.div>
    </>
  );
}
