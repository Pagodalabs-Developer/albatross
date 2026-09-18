import Link from "next/link";
import { Artwork } from "@/components/artwork";
import { Block, BlockAction } from "@/components/block";
import { PlayReleaseButton } from "@/components/player/play-release-button";
import { Reveal } from "@/components/reveal";
import { StoreIcon } from "@/components/store-icon";
import { TiltCard } from "@/components/ui/tilt-card";
import {
  bandLinks,
  formatDateLabel,
  releaseYear,
  splitReleases,
  storeLabels,
  type Release,
  type StoreLink,
  type StoreName,
} from "@/lib/types";
import { getCatalogs } from "@/lib/db";

const storeLinksFor = (release: Release): StoreLink[] =>
  release.links ??
  (Object.entries(bandLinks) as [StoreName, string][]).map(([store, url]) => ({ store, url }));

function ReleaseCard({ release, badge }: { release: Release; badge?: string }) {
  return (
    <TiltCard>
      <Link href={`/releases/${release.slug}`} className="group flex flex-col gap-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-card">
          <Artwork
            release={release}
            sizes="(min-width: 768px) 12vw, 40vw"
            className="size-full transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-105"
          />
          {badge && (
            <span className="absolute left-1.5 top-1.5 rounded-full bg-inverse px-2 py-0.5 text-caption font-semibold text-inverse-foreground">
              {badge}
            </span>
          )}
        </div>
        <p className="truncate text-meta font-semibold text-foreground">{release.title}</p>
        <p className="text-caption text-muted-foreground">
          {release.type} · {releaseYear(release)}
        </p>
      </Link>
    </TiltCard>
  );
}

export async function LatestReleaseSection({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const { latest } = splitReleases(await getCatalogs());
  const featured = latest[0];
  if (!featured) return null;

  const stores = storeLinksFor(featured).slice(0, 4);

  return (
    <Block
      id="latest-release"
      label="Latest release"
      action={<BlockAction href={`/releases/${featured.slug}`}>View tracklist</BlockAction>}
      className={className}
      delay={delay}
    >
      <Reveal delay={0.08}>
        <div className="group grid gap-5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-6">
          <Link
            href={`/releases/${featured.slug}`}
            aria-label={`${featured.title} — ${featured.type}, ${releaseYear(featured)}`}
            className="relative block w-full max-w-[16rem]"
          >

            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-[8%] right-0 hidden aspect-square rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,#ffffff20_28deg,transparent_72deg,transparent_170deg,#ffffff12_205deg,transparent_250deg),radial-gradient(circle,#0e0e0e_0_4%,#141414_4%_13%,hsl(var(--primary))_13%_21%,transparent_21%),repeating-radial-gradient(circle,#191919_0_2px,#0b0b0b_2px_4px)] shadow-elevated transition-transform duration-500 ease-entrance motion-safe:group-hover:translate-x-[30%] motion-safe:group-hover:animate-[spin_4s_linear_infinite] lg:block"
            />
            <Artwork
              release={featured}
              sizes="16rem"
              className="relative aspect-square w-full rounded-card border border-border shadow-card transition-[transform,box-shadow] duration-300 ease-entrance group-hover:shadow-elevated motion-safe:group-hover:-translate-y-1"
            />
          </Link>

          <div className="flex min-w-0 flex-col items-start gap-2.5">
            <Link
              href={`/releases/${featured.slug}`}
              className="font-display text-headline text-balance text-foreground transition-colors hover:text-brand"
            >
              {featured.title}
            </Link>
            <p className="text-caption font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {featured.type} · {releaseYear(featured)}
              {featured.tracks && featured.tracks.length > 0 && (
                <> · {featured.tracks.length} tracks</>
              )}
            </p>
            {featured.description && (
              <p className="text-pretty font-editorial text-body italic text-muted-foreground">
                {featured.description}
              </p>
            )}

            {featured.tracks && featured.tracks.length > 0 && (
              <ol className="w-full">
                {featured.tracks.slice(0, 5).map((track, i) => (
                  <li
                    key={track.title}
                    className="flex items-baseline gap-3 border-b border-border-subtle py-1.5 last:border-0"
                  >
                    <span className="w-5 shrink-0 text-caption tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-meta text-foreground">
                      {track.title}
                    </span>
                  </li>
                ))}
                {featured.tracks.length > 5 && (
                  <li className="pt-1.5 text-caption text-muted-foreground">
                    +{featured.tracks.length - 5} more on the release page
                  </li>
                )}
              </ol>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-2">

              <PlayReleaseButton release={featured} />
              {stores.map(({ store, url }) => (
                <a
                  key={store + url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${featured.title} on ${storeLabels[store]}`}
                  className="flex size-11 items-center justify-center rounded-full border border-border text-muted-foreground transition-[color,border-color,transform] duration-[160ms] ease-entrance hover:border-brand hover:text-brand active:scale-[0.95]"
                >
                  <StoreIcon store={store} className="size-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </Block>
  );
}

export async function UpcomingReleaseSection({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const { upcoming } = splitReleases(await getCatalogs());
  if (upcoming.length === 0) return null;

  return (
    <Block
      id="upcoming"
      label={upcoming.length === 1 ? "Upcoming release" : "Upcoming releases"}
      className={className}
      delay={delay}
    >
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:gap-4">
        {upcoming.map((release, i) => (
          <Reveal key={release.slug} delay={(i % 3) * 0.08}>
            <ReleaseCard
              release={release}
              badge={`OUT ${formatDateLabel(release.releaseDate).toUpperCase()}`}
            />
          </Reveal>
        ))}
      </div>
    </Block>
  );
}
