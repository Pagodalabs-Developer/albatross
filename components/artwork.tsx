import Image from "next/image";
import { DEFAULT_GRADIENT, mediaImageSrc } from "@/lib/types";

type ArtworkProps = {
  release: { title: string; videoUrl?: string; image?: string };
  className?: string;
  sizes?: string;

  priority?: boolean;
};

export function Artwork({ release, className = "", sizes, priority = false }: ArtworkProps) {
  const src = mediaImageSrc(release);
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundImage: DEFAULT_GRADIENT }}
    >
      {src && (
        <Image
          src={src}
          alt={`${release.title} artwork`}
          fill
          sizes={sizes ?? "20rem"}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          className="animate-fade-in object-cover"
        />
      )}
    </div>
  );
}
