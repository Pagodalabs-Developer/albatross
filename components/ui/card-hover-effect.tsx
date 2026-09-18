"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Artwork } from "@/components/artwork";
import { useCanHover } from "@/hooks/use-can-hover";
import { cn } from "@/lib/utils";

export type HoverEffectItem = {
  href: string;
  title: string;
  description?: string;
  image?: string;
  videoUrl?: string;
};

export function HoverEffect({
  items,
  className,
  id = "hover-effect",
}: {
  items: HoverEffectItem[];
  className?: string;
  id?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const canHover = useCanHover();

  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {items.map((item, i) => (
        <Link
          key={item.href}
          href={item.href}
          onMouseEnter={canHover ? () => setHovered(i) : undefined}
          onMouseLeave={canHover ? () => setHovered(null) : undefined}
          className="group relative block h-full rounded-card p-1.5 transition-transform duration-150 ease-entrance active:scale-[0.99]"
        >
          <AnimatePresence>
            {hovered === i && (
              <motion.span
                aria-hidden
                layoutId={`${id}-highlight`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
                className="absolute inset-0 block rounded-card bg-muted"
              />
            )}
          </AnimatePresence>

          <div className="relative z-10 flex h-full flex-col gap-3 overflow-hidden rounded-card border border-border bg-surface pb-4 shadow-card transition-[border-color,box-shadow] duration-300 group-hover:border-brand group-hover:shadow-elevated group-focus-visible:border-brand">
            <Artwork
              release={{ title: item.title, image: item.image, videoUrl: item.videoUrl }}
              sizes="(min-width: 1024px) 33vw, 100vw"
              className="h-[9.375rem] w-full transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-105"
            />
            <div className="flex flex-col gap-1.5 px-4">
              <p className="text-meta font-semibold text-foreground">{item.title}</p>
              {item.description && (
                <p className="text-caption text-muted-foreground">{item.description}</p>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
