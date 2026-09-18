"use client";

import { Pause, Play } from "lucide-react";
import { usePlayer } from "@/components/player/player-provider";
import { releaseQueue } from "@/components/player/queue";
import type { Release } from "@/lib/types";

export function PlayReleaseButton({
  release,
  label = "LISTEN NOW",
  className = "",
}: {
  release: Release;
  label?: string;
  className?: string;
}) {
  const player = usePlayer();
  const queue = releaseQueue(release);
  if (queue.length === 0) return null;

  const isCurrent = queue.some((entry) => entry.id === player.current?.id);
  const isPlaying = isCurrent && player.playing;

  return (
    <button
      type="button"
      onClick={() => (isCurrent ? player.toggle() : player.play(queue))}
      className={`inline-flex items-center gap-2 rounded-button border border-primary bg-primary px-5 py-3 text-meta font-semibold text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.97] ${className}`}
    >
      {isPlaying ? (
        <Pause aria-hidden className="size-3.5" />
      ) : (
        <Play aria-hidden className="size-3.5" />
      )}
      {isPlaying ? "PAUSE" : label}
    </button>
  );
}
