import type { PlayerTrack } from "@/components/player/player-provider";
import { mediaImageSrc, trackImageSrc, type Release } from "@/lib/types";

export function releaseQueue(release: Release): PlayerTrack[] {
  const fallbackArtwork = mediaImageSrc(release);
  return (release.tracks ?? [])
    .map((track, i) => ({ track, i }))
    .filter(({ track }) => Boolean(track.audio))
    .map(({ track, i }) => ({
      id: `${release.slug}-${i}`,
      title: track.title,
      subtitle: `Albatross · ${release.title}`,
      audio: track.audio!,
      artwork: trackImageSrc(track) ?? fallbackArtwork,
      href: `/releases/${release.slug}`,

      links: track.links ?? release.links,
    }));
}

export const queueIndexOf = (queue: PlayerTrack[], slug: string, trackIndex: number) =>
  Math.max(
    queue.findIndex((entry) => entry.id === `${slug}-${trackIndex}`),
    0,
  );
