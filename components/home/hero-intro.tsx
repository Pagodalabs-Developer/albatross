import Link from "next/link";
import { Play } from "lucide-react";
import { PlayReleaseButton } from "@/components/player/play-release-button";
import { SocialIcon } from "@/components/social-icon";
import { bandLinks, extractYoutubeId, socialLabels, type Release } from "@/lib/types";

const socials = [
  { platform: "youtube", url: bandLinks.youtube },
  { platform: "instagram", url: "https://www.instagram.com/albatrossnepal/" },
  { platform: "spotify", url: bandLinks.spotify },
  { platform: "facebook", url: "https://www.facebook.com/albatrossnepal" },
] as const;

export function HeroIntro({
  mission,
  featured,
}: {
  mission: string;

  featured?: Release;
}) {
  const videoId = featured?.links?.find((l) => l.store === "youtube")?.url;
  const watchHref = videoId ? extractYoutubeId(videoId) : undefined;

  return (
    <div className="flex flex-col items-start gap-4 md:gap-5">
      <h1 id="hero-heading" className="font-display text-display text-foreground">
        <span className="block animate-hero-rise [animation-delay:120ms]">RAW SOUND.</span>
        <span className="block animate-hero-rise [animation-delay:210ms]">REAL STORIES.</span>
      </h1>

      <p className="animate-hero-fade font-editorial text-headline italic text-brand [animation-delay:300ms]">
        Stay Albatross.
      </p>
      <p className="max-w-[30rem] animate-hero-fade text-body text-muted-foreground [animation-delay:370ms]">
        {mission}
      </p>

      <div className="flex animate-hero-fade flex-wrap items-center gap-3 [animation-delay:420ms]">

        {featured && <PlayReleaseButton release={featured} />}
        {watchHref ? (
          <a
            href={`https://www.youtube.com/watch?v=${watchHref}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-button border border-border bg-surface px-5 py-3 text-meta font-semibold text-foreground transition-[border-color,transform] duration-[160ms] ease-entrance hover:border-brand active:scale-[0.97]"
          >
            WATCH VIDEO
            <Play aria-hidden className="size-3.5" />
          </a>
        ) : (
          <Link
            href="/#events"
            className="rounded-button border border-border bg-surface px-5 py-3 text-meta font-semibold text-foreground transition-[border-color,transform] duration-[160ms] ease-entrance hover:border-brand active:scale-[0.97]"
          >
            VIEW EVENTS
          </Link>
        )}
      </div>

      <ul className="flex animate-hero-fade items-center gap-1 [animation-delay:470ms]">
        {socials.map(({ platform, url }) => (
          <li key={platform}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              aria-label={`Albatross on ${socialLabels[platform]}`}
              className="flex size-11 items-center justify-center rounded-button text-muted-foreground transition-[color,transform] duration-[160ms] ease-entrance hover:text-brand active:scale-[0.92]"
            >
              <SocialIcon platform={platform} className="size-4" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
