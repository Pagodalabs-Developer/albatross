"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { EASE_ENTRANCE } from "@/lib/motion";
import { DEFAULT_GRADIENT, mediaImageSrc } from "@/lib/types";

export type HeroCarouselSlide = {
  slug: string; 
  title: string;
  image?: string;
  videoUrl?: string;
};

const ENTER = EASE_ENTRANCE;

export function HeroCarousel({
  slides,

  fill = false,
}: {
  slides: HeroCarouselSlide[];
  fill?: boolean;
}) {
  const [index, setIndex] = useState(0);

  const [playOverride, setPlayOverride] = useState<boolean | null>(null);
  const [interacting, setInteracting] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const onScreen = useInView(ref, { amount: 0.2 });
  const active = slides[index];
  const shouldReduceMotion = usePrefersReducedMotion();
  const playing = playOverride ?? true;

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const autoplay = slides.length > 1 && playing && !interacting && tabVisible && onScreen;

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [autoplay, slides.length]);

  if (!active) {
    return (
      <div
        aria-hidden
        className={
          fill
            ? "absolute inset-0 size-full"
            : "relative h-[17.5rem] w-full overflow-hidden rounded-card md:h-[26.25rem]"
        }
        style={{ backgroundImage: DEFAULT_GRADIENT }}
      />
    );
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Featured artwork"
      aria-roledescription="carousel"
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={() => setInteracting(false)}
      className={`animate-hero-media overflow-hidden ${
        fill
          ? "absolute inset-0 size-full"
          : "relative h-[17.5rem] w-full rounded-card md:h-[26.25rem]"
      }`}
    >

      <AnimatePresence initial={false}>
        <motion.div
          key={active.slug}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
          transition={{ duration: shouldReduceMotion ? 0.2 : 0.6, ease: ENTER }}
          className="absolute inset-0"
          style={{ backgroundImage: DEFAULT_GRADIENT }}
        >
          {mediaImageSrc(active) && (
            <Image
              src={mediaImageSrc(active)!}
              alt={`${active.title} artwork`}
              fill
              priority={index === 0}

              fetchPriority={index === 0 ? "high" : undefined}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={active.slug}
          hidden={fill}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{
            duration: shouldReduceMotion ? 0.15 : 0.25,
            ease: ENTER,
            delay: shouldReduceMotion ? 0 : 0.15,
          }}
          className="absolute bottom-4 left-5 font-display text-accent-display text-white/90 drop-shadow"
        >
          {active.title}
        </motion.p>
      </AnimatePresence>

      <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col items-center gap-0.5">
        {slides.map((slide, i) => (
          <button
            key={slide.slug}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show ${slide.title}`}
            aria-current={i === index}
            className={`flex size-8 items-center justify-center text-caption font-semibold tabular-nums transition-[color,transform] duration-200 ease-entrance active:scale-90 ${
              i === index ? "text-white" : "text-white/45 hover:text-white/80"
            }`}
          >
            {String(i + 1).padStart(2, "0")}
          </button>
        ))}

        {slides.length > 1 && (
          <button
            type="button"
            onClick={() => setPlayOverride(!playing)}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            className="flex size-8 items-center justify-center text-white/70 transition-[color,transform] duration-150 ease-out hover:text-white active:scale-90"
          >
            {playing ? (
              <Pause aria-hidden className="size-3.5" />
            ) : (
              <Play aria-hidden className="size-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
