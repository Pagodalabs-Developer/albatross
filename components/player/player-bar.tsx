"use client";

import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePlayer } from "@/components/player/player-provider";
import { StoreIcon } from "@/components/store-icon";
import { storeLabels } from "@/lib/types";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

const iconButton =
  "flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-[160ms] ease-entrance hover:bg-muted hover:text-foreground active:scale-[0.92]";

export function PlayerBar() {
  const {
    current,
    playing,
    time,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    hasQueue,
    toggle,
    next,
    previous,
    seek,
    setVolume,
    toggleMuted,
    toggleShuffle,
    toggleRepeat,
    close,
  } = usePlayer();

  if (!current) return null;

  return (
    <>

      <div aria-hidden className="h-[4.75rem] md:h-[5.25rem]" />
      <div

        className="fixed inset-x-0 bottom-0 z-[var(--z-sticky)] border-t border-border bg-surface/95 backdrop-blur transition-colors duration-theme"
        role="region"
        aria-label="Player"
      >
      <div className="mx-auto flex max-w-[110rem] items-center gap-3 px-3 py-2.5 md:gap-6 md:px-6 md:py-3">

        <div className="flex min-w-0 flex-1 items-center gap-3 md:w-64 md:flex-none">
          {current.artwork && (
            <Image
              src={current.artwork}
              alt=""
              width={48}
              height={48}
              className="size-10 shrink-0 rounded-button object-cover md:size-12"
            />
          )}
          <div className="flex min-w-0 flex-col">
            {current.href ? (
              <Link
                href={current.href}
                className="truncate text-meta font-semibold text-foreground transition-colors hover:text-brand"
              >
                {current.title}
              </Link>
            ) : (
              <p className="truncate text-meta font-semibold text-foreground">{current.title}</p>
            )}
            <p className="truncate text-caption text-muted-foreground">{current.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-0.5 md:gap-1.5">
            {hasQueue && (
              <button
                type="button"
                onClick={toggleShuffle}
                aria-pressed={shuffle}
                aria-label="Shuffle"
                className={`${iconButton} hidden md:flex ${shuffle ? "text-brand" : ""}`}
              >
                <Shuffle aria-hidden className="size-4" />
              </button>
            )}
            <button
              type="button"
              onClick={previous}
              aria-label="Previous track"
              className={iconButton}
            >
              <SkipBack aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-[background-color,transform] duration-[160ms] ease-entrance hover:bg-primary-hover active:scale-[0.92]"
            >
              {playing ? (
                <Pause aria-hidden className="size-4" />
              ) : (
                <Play aria-hidden className="size-4 translate-x-px" />
              )}
            </button>
            <button type="button" onClick={next} aria-label="Next track" className={iconButton}>
              <SkipForward aria-hidden className="size-4" />
            </button>
            <button
              type="button"
              onClick={toggleRepeat}
              aria-pressed={repeat}
              aria-label="Repeat track"
              className={`${iconButton} hidden md:flex ${repeat ? "text-brand" : ""}`}
            >
              <Repeat aria-hidden className="size-4" />
            </button>
          </div>

          <div className="hidden w-full items-center gap-2.5 md:flex">
            <span className="w-9 shrink-0 text-right text-caption tabular-nums text-muted-foreground">
              {formatTime(time)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={1}
              value={Math.min(time, duration || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              disabled={!duration}
              aria-label="Seek"
              className="h-1 min-w-0 flex-1 accent-primary"
            />
            <span className="w-9 shrink-0 text-caption tabular-nums text-muted-foreground">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex lg:w-72 lg:justify-end">
          {current.links && current.links.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-caption text-muted-foreground">Listen on</span>
              {current.links.map(({ store, url }) => (
                <a
                  key={store + url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${current.title} on ${storeLabels[store]}`}
                  className="flex size-9 items-center justify-center rounded-button border border-border text-muted-foreground transition-[color,border-color,transform] duration-[160ms] ease-entrance hover:border-brand hover:text-brand active:scale-[0.95]"
                >
                  <StoreIcon store={store} className="size-3.5" />
                </a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMuted}
              aria-label={muted ? "Unmute" : "Mute"}
              className={iconButton}
            >
              {muted ? (
                <VolumeX aria-hidden className="size-4" />
              ) : (
                <Volume2 aria-hidden className="size-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="h-1 w-20 accent-primary"
            />
          </div>
        </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close player"
            className={iconButton}
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}
