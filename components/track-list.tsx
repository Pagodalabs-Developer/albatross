"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { useMemo, useState } from "react";
import { usePlayer } from "@/components/player/player-provider";
import { queueIndexOf, releaseQueue } from "@/components/player/queue";
import { StoreIcon } from "@/components/store-icon";
import { EASE_ENTRANCE } from "@/lib/motion";
import {
  displayTracks,
  formatDuration,
  spotifyEmbedUrl,
  storeLabels,
  type Release,
} from "@/lib/types";

const SPLIT_AT = 6;

export function TrackList({ release }: { release: Release }) {
  const [embedded, setEmbedded] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const player = usePlayer();
  const queue = useMemo(() => releaseQueue(release), [release]);
  const tracks = displayTracks(release);
  const split = tracks.length >= SPLIT_AT;
  const rows = Math.ceil(tracks.length / 2);

  return (
    <ol
      className={split ? "sm:grid sm:grid-flow-col sm:gap-x-10" : undefined}
      style={split ? { gridTemplateRows: `repeat(${rows}, min-content)` } : undefined}
    >
      {tracks.map((track, i) => {
        const links = track.links ?? [];
        const spotify = links.find((l) => l.store === "spotify")?.url;
        const embed = spotify ? spotifyEmbedUrl(spotify) : undefined;
        const isEmbedded = embedded === i;
        const isCurrent = player.current?.id === `${release.slug}-${i}`;
        const isPlaying = isCurrent && player.playing;

        const playable = Boolean(track.audio) || Boolean(embed);

        const onActivate = () => {
          if (track.audio) {
            if (isCurrent) player.toggle();
            else player.play(queue, queueIndexOf(queue, release.slug, i));
            return;
          }
          if (embed) setEmbedded(isEmbedded ? null : i);
        };

        return (
          <li key={track.title + i} className="border-b border-border-subtle last:border-0">
            <div className="group flex items-center gap-3 py-2.5">
              <span className="w-6 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>

              <span
                className={`min-w-0 flex-1 truncate text-meta transition-colors duration-150 ${
                  isCurrent ? "font-semibold text-brand" : "text-foreground"
                }`}
              >
                {track.title}
              </span>

              {links.length > 0 && (
                <span className="flex shrink-0 gap-1 transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  {links.map(({ store, url }) => (
                    <a
                      key={store + url}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${track.title} on ${storeLabels[store]}`}
                      className="flex size-9 items-center justify-center rounded-button text-muted-foreground transition-colors hover:text-brand"
                    >
                      <StoreIcon store={store} className="size-3.5" />
                    </a>
                  ))}
                </span>
              )}

              {track.duration !== undefined && (
                <span className="shrink-0 text-caption tabular-nums text-muted-foreground">
                  {formatDuration(track.duration)}
                </span>
              )}

              {playable ? (
                <button
                  type="button"
                  onClick={onActivate}
                  aria-label={`${isPlaying || isEmbedded ? "Pause" : "Play"} ${track.title}`}
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full border transition-[color,border-color,background-color,transform] duration-[160ms] ease-entrance active:scale-[0.92] ${
                    isPlaying
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-brand hover:text-brand"
                  }`}
                >

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isPlaying || isEmbedded ? "pause" : "play"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="flex items-center justify-center"
                    >
                      {isPlaying || isEmbedded ? (
                        <Pause className="size-3.5" />
                      ) : (
                        <Play className="size-3.5 translate-x-px" />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </button>
              ) : (

                <span aria-hidden className="size-9 shrink-0" />
              )}
            </div>

            <AnimatePresence initial={false}>
              {isEmbedded && embed && (
                <motion.div
                  key="player"
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  animate={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }
                  }
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: EASE_ENTRANCE }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pl-9">
                    <iframe
                      src={embed}
                      title={`${track.title} — preview`}
                      width="100%"
                      height="152"
                      allow="encrypted-media"
                      loading="lazy"
                      className="max-w-[40.625rem] rounded-[0.625rem]"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ol>
  );
}
