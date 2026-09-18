"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Artwork } from "@/components/artwork";
import { Block } from "@/components/block";
import { Reveal } from "@/components/reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { EASE_ENTRANCE } from "@/lib/motion";
import { releaseYear, type Release } from "@/lib/types";

const filters = ["ALL", "ALBUMS", "SINGLES"] as const;
type Filter = (typeof filters)[number];

export function CatalogSection({
  releases,
  className = "",
  delay = 0,
}: {
  releases: Release[];
  className?: string;
  delay?: number;
}) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const shelf = useRef<HTMLDivElement>(null);

  const visible = releases.filter(
    (r) =>
      filter === "ALL" || (filter === "ALBUMS" ? r.type === "Album" : r.type === "Single"),
  );

  const nudge = (direction: 1 | -1) => {
    const el = shelf.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  return (

    <Block id="catalog" label="Music catalog" className={className}
      delay={delay}>
      <div className="flex items-center justify-between gap-4">
        <div role="tablist" aria-label="Filter catalog" className="flex gap-4">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`flex min-h-11 flex-col justify-center gap-1.5 text-label font-semibold uppercase tracking-[0.18em] transition-[color,transform] duration-200 ease-entrance active:scale-[0.97] ${
                filter === f ? "text-brand" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}

              <span
                aria-hidden
                className={`h-0.5 w-full origin-left bg-primary transition-transform duration-200 ease-move ${
                  filter === f ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>

        {visible.length > 2 && (
          <div className="hidden shrink-0 gap-1 md:flex">
            {([-1, 1] as const).map((direction) => (
              <button
                key={direction}
                type="button"
                onClick={() => nudge(direction)}
                aria-label={direction === 1 ? "Scroll catalog right" : "Scroll catalog left"}
                className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-[color,border-color,transform] duration-[160ms] ease-entrance hover:border-brand hover:text-brand active:scale-[0.92]"
              >
                {direction === 1 ? (
                  <ChevronRight aria-hidden className="size-4" />
                ) : (
                  <ChevronLeft aria-hidden className="size-4" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-body text-muted-foreground">Nothing here yet.</p>
      ) : (

        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={filter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE_ENTRANCE }}
          >
            <div
              ref={shelf}

              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {visible.map((release, i) => (
                <Reveal
                  key={release.slug}
                  delay={(i % 6) * 0.08}
                  className="w-[calc((100%-1rem)/2)] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-5rem)/6)]"
                >
                  <TiltCard>
                    <Link
                      href={`/releases/${release.slug}`}
                      className="group flex flex-col gap-2"
                    >
                      <div className="overflow-hidden rounded-card">
                        <Artwork
                          release={release}
                          sizes="(min-width: 1280px) 17vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                          className="aspect-square w-full transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-105"
                        />
                      </div>
                      <p className="truncate text-meta font-semibold text-foreground transition-colors group-hover:text-brand">
                        {release.title}
                      </p>
                      <p className="text-caption text-muted-foreground">
                        {releaseYear(release)}
                      </p>
                    </Link>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </Block>
  );
}
