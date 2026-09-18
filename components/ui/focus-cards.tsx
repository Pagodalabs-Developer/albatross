"use client";

import Image from "next/image";
import { useState } from "react";
import { useCanHover } from "@/hooks/use-can-hover";
import { DEFAULT_GRADIENT } from "@/lib/types";
import { cn } from "@/lib/utils";

export type FocusCard = {
  image: string;
  title?: string;
};

export function FocusCards({
  items,
  className,
  sizes = "(min-width: 768px) 33vw, 50vw",
  aspect = "aspect-[4/3]",
}: {
  items: FocusCard[];
  className?: string;
  sizes?: string;
  aspect?: string;
}) {
  const [focused, setFocused] = useState<number | null>(null);
  const canHover = useCanHover();

  return (
    <ul className={cn("grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-6", className)}>
      {items.map((item, i) => {
        const dimmed = canHover && focused !== null && focused !== i;
        return (
          <li key={`${item.image}-${i}`}>
            <figure
              onMouseEnter={canHover ? () => setFocused(i) : undefined}
              onMouseLeave={canHover ? () => setFocused(null) : undefined}
              className="flex flex-col gap-2"
            >
              <div
                className={cn(
                  "relative w-full overflow-hidden rounded-card transition-[filter,transform,opacity] duration-300 ease-entrance",
                  aspect,

                  dimmed && "opacity-70 blur-[2px] motion-safe:scale-[0.98]",
                )}
                style={{ backgroundImage: DEFAULT_GRADIENT }}
              >
                <Image
                  src={item.image}
                  alt={item.title ?? ""}
                  fill
                  sizes={sizes}
                  className="animate-fade-in object-cover"
                />
              </div>
              {item.title && (
                <figcaption className="text-caption text-muted-foreground">
                  {item.title}
                </figcaption>
              )}
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
