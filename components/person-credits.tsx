"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import { usePlayer } from "@/components/player/player-provider";
import { queueIndexOf, releaseQueue } from "@/components/player/queue";
import type { Release } from "@/lib/types";

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "");

export function PersonCredits({
  credits,
  catalogs,
}: {
  credits: string[];
  catalogs: Release[];
}) {
  const player = usePlayer();

  const resolve = (credit: string) => {
    const key = normalize(credit);
    for (const release of catalogs) {
      const index = (release.tracks ?? []).findIndex((t) => normalize(t.title) === key);
      if (index !== -1) return { release, index };
    }
    return undefined;
  };

  return (
    <ul className="flex flex-col divide-y divide-border-subtle">
      {credits.map((credit) => {
        const match = resolve(credit);
        const track = match?.release.tracks?.[match.index];
        const playable = Boolean(track?.audio);

        return (
          <li key={credit} className="flex items-center justify-between gap-3 py-2.5">
            {match ? (
              <Link
                href={`/releases/${match.release.slug}`}
                className="min-w-0 flex-1 truncate text-meta text-foreground transition-colors hover:text-brand"
              >
                {credit}
              </Link>
            ) : (
              <span className="min-w-0 flex-1 text-meta text-muted-foreground">{credit}</span>
            )}

            {playable && match && (
              <button
                type="button"
                onClick={() => {
                  const queue = releaseQueue(match.release);
                  player.play(queue, queueIndexOf(queue, match.release.slug, match.index));
                }}
                aria-label={`Play ${credit}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-[color,border-color,transform] duration-[160ms] ease-entrance hover:border-brand hover:text-brand active:scale-[0.92]"
              >
                <Play aria-hidden className="size-3.5 translate-x-px" />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
