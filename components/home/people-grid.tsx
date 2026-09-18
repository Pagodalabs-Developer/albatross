"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/reveal";
import { TiltCard } from "@/components/ui/tilt-card";
import { useCanHover } from "@/hooks/use-can-hover";

export type PersonCard = {
  name: string;
  role: string;
  href: string;

  image?: string;
};

export function PeopleGrid({ people }: { people: PersonCard[] }) {
  const [focused, setFocused] = useState<number | null>(null);
  const canHover = useCanHover();

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {people.map((person, i) => {
        const dimmed = canHover && focused !== null && focused !== i;
        return (

          <li key={person.name}>
            <Reveal delay={i * 0.08}>
              <TiltCard>
                <Link
                  href={person.href}
                  onMouseEnter={canHover ? () => setFocused(i) : undefined}
                  onMouseLeave={canHover ? () => setFocused(null) : undefined}
                  onFocus={canHover ? () => setFocused(i) : undefined}
                  onBlur={canHover ? () => setFocused(null) : undefined}
                  className={`group relative block aspect-[4/3] overflow-hidden rounded-card bg-muted transition-[opacity,filter,transform] duration-300 ease-entrance active:scale-[0.98] ${
                    dimmed ? "opacity-60 blur-[2px] motion-safe:scale-[0.98]" : "opacity-100"
                  }`}
                >
                  <Portrait image={person.image} name={person.name} />

                  <span
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/90"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-0.5 p-4">
                    <p className="font-display text-accent-display uppercase text-white">
                      {person.name}
                    </p>
                    <p className="text-caption text-white/75">{person.role}</p>
                  </div>
                </Link>
              </TiltCard>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}

// Falls back to the initial when there is no portrait or the URL fails to load.
function Portrait({ image, name }: { image?: string; name: string }) {
  const [broken, setBroken] = useState(false);
  if (image && !broken) {
    return (
      <Image
        src={image}
        alt={name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="animate-fade-in object-cover transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-105"
        onError={() => setBroken(true)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="flex size-full items-center justify-center font-display text-[4rem] text-brand"
    >
      {name[0]}
    </span>
  );
}
