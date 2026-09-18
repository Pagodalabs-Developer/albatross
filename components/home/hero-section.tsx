import Link from "next/link";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { HeroIntro } from "@/components/home/hero-intro";
import { Artwork } from "@/components/artwork";
import { getCatalogs, getSiteSettings } from "@/lib/db";
import { releaseYear, splitReleases } from "@/lib/types";

export async function HeroSection() {
  const [releases, { mission, heroImages }] = await Promise.all([
    getCatalogs(),
    getSiteSettings(),
  ]);

  const slides =
    heroImages.length > 0
      ? heroImages.map((slide, i) => ({
          slug: `hero-${i}`,
          title: slide.title,
          image: slide.image,
        }))
      : releases.slice(0, 5);

  const featured = splitReleases(releases).latest[0];

  return (
    <section
      id="home"
      className="relative isolate overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <HeroCarousel slides={slides} fill />

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20 dark:from-background dark:via-background/80 dark:to-background/10"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
      />

      <div className="relative mx-auto grid max-w-[110rem] items-center gap-8 px-5 pb-10 pt-10 md:px-8 md:pb-14 md:pt-14 lg:grid-cols-[minmax(0,36rem)_minmax(0,1fr)] lg:gap-12">
        <HeroIntro mission={mission} featured={featured} />

        {featured && (
          <div className="hidden justify-self-end lg:block">
            <Link
              href={`/releases/${featured.slug}`}
              aria-label={`${featured.title} — ${featured.type}, ${releaseYear(featured)}`}
              className="group block w-[22rem] animate-hero-media"
            >
              <Artwork
                release={featured}
                sizes="22rem"
                className="aspect-square w-full rotate-3 rounded-card border border-border shadow-elevated transition-transform duration-500 ease-entrance motion-safe:group-hover:rotate-0 motion-safe:group-hover:scale-[1.02]"
              />
            </Link>
          </div>
        )}
      </div>

      {featured && (
        <div className="relative mx-auto max-w-[110rem] px-5 pb-8 md:px-8 lg:pb-10">
          <div className="flex flex-col items-start gap-1 lg:items-end">
            <p className="text-label font-semibold uppercase tracking-[0.18em] text-brand">
              Latest release
            </p>
            <Link
              href={`/releases/${featured.slug}`}
              className="font-display text-accent-display text-foreground transition-colors hover:text-brand"
            >
              {featured.title}
            </Link>
            <p className="text-caption text-muted-foreground">
              {releaseYear(featured)} · {featured.type}
            </p>
            <Link
              href="/#catalog"
              className="group inline-flex items-center gap-2 text-label font-semibold uppercase tracking-[0.18em] text-brand transition-transform duration-[160ms] ease-entrance active:scale-[0.97]"
            >
              View all releases
              <span
                aria-hidden
                className="transition-transform duration-[160ms] ease-entrance motion-safe:group-hover:translate-x-1.5"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
