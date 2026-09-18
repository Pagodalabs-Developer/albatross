"use client";

import Image from "next/image";
import { useState } from "react";
import { artworkUrl } from "@/lib/types";

type YouTubeEmbedProps = {
  youtubeId: string;
  title: string;
};

export function YouTubeEmbed({ youtubeId, title }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  if (playing) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-[0.625rem] bg-inverse">
        <Image
          src={artworkUrl(youtubeId)}
          alt=""
          fill
          sizes="40.625rem"
          aria-hidden
          className={`object-cover opacity-40 transition-opacity duration-300 ${
            ready ? "opacity-0" : "opacity-40"
          }`}
        />
        {!ready && (
          <span className="absolute inset-0 flex items-center justify-center text-caption font-semibold text-white/80">
            LOADING…
          </span>
        )}
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setReady(true)}
          className={`absolute inset-0 size-full transition-opacity duration-300 ease-entrance ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play ${title}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-[0.625rem] bg-inverse transition-transform duration-150 ease-entrance active:scale-[0.99]"
    >
      <Image
        src={artworkUrl(youtubeId)}
        alt=""
        fill
        sizes="40.625rem"
        className="object-cover opacity-80 transition-[transform,opacity] duration-300 ease-entrance group-hover:opacity-100 motion-safe:group-hover:scale-105"
      />
      <span
        aria-hidden
        className="absolute inset-0 flex items-center justify-center text-[3.25rem] text-white drop-shadow-lg transition-transform duration-200 ease-entrance motion-safe:group-hover:scale-110"
      >
        ▶
      </span>
    </button>
  );
}
