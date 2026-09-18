import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Artwork } from "@/components/artwork";
import { Block, BlockAction } from "@/components/block";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { PlayReleaseButton } from "@/components/player/play-release-button";
import { Reveal } from "@/components/reveal";
import { ShareRow } from "@/components/share-row";
import { StoreIcon, type Store } from "@/components/store-icon";
import { TrackList } from "@/components/track-list";
import { YouTubeEmbed } from "@/components/youtube-embed";
import {
  bandLinks,
  displayTracks,
  extractYoutubeId,
  formatDateLabel,
  formatRuntime,
  mediaImageSrc,
  releaseDuration,
  releaseYear,
  youtubeWatchUrl,
  type Release,
} from "@/lib/types";
import { getCatalog, getCatalogs } from "@/lib/db";
import { BAND_ID, SITE_URL, absolute, compact, isoDuration } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getCatalogs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const release = await getCatalog(slug);
  if (!release) return { title: "Release — Albatross" };

  const title = `${release.title} — Albatross`;
  const image = mediaImageSrc(release);
  return {
    title,
    description: release.description,
    alternates: { canonical: `/releases/${slug}` },
    openGraph: {
      title,
      description: release.description,
      type: "music.album",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: release.description,
      images: image ? [image] : undefined,
    },
  };
}

function MoreFrom({ releases }: { releases: Release[] }) {
  return (
    <Block
      id="more-releases"
      label="More from Albatross"
      action={<BlockAction href="/#catalog">View all releases</BlockAction>}
    >
      <ul className="flex flex-col divide-y divide-border-subtle">
        {releases.map((release, i) => (
          <li key={release.slug}>
            <Reveal distance={0} delay={i * 0.06}>
              <Link
                href={`/releases/${release.slug}`}
                className="group flex items-center gap-3.5 py-3"
              >
                <Artwork
                  release={release}
                  sizes="4rem"
                  className="aspect-square w-14 shrink-0 rounded-button transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-[1.04]"
                />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-meta font-semibold text-foreground transition-colors group-hover:text-brand">
                    {release.title}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {releaseYear(release)} · {release.type}
                  </p>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Block>
  );
}

export default async function ReleaseDetailPage({ params }: Props) {
  const slug = (await params).slug;
  const [release, catalogs] = await Promise.all([getCatalog(slug), getCatalogs()]);
  if (!release) notFound();

  const storeUrl = (store: Store) =>
    release.links?.find((link) => link.store === store)?.url;

  const videoId = storeUrl("youtube") ? extractYoutubeId(storeUrl("youtube")!) : undefined;

  const streamingLinks: { store: Store; href: string; label: string; className: string }[] = [
    {
      store: "spotify",
      href: storeUrl("spotify") ?? bandLinks.spotify,
      label: "Spotify",
      className: "bg-[#1db954] text-black hover:bg-[#1ed760]",
    },
    {
      store: "youtube",
      href: storeUrl("youtube") ?? bandLinks.youtube,
      label: "YouTube Music",
      className: "bg-[#c4302b] text-white hover:bg-[#d13a35]",
    },
    {
      store: "appleMusic",
      href: storeUrl("appleMusic") ?? bandLinks.appleMusic,
      label: "Apple Music",
      className: "bg-[#111111] text-white hover:bg-[#242424]",
    },
  ];

  const morePlatformsHref = storeUrl("bandcamp") ?? bandLinks.bandcamp;

  const listed = displayTracks(release);
  const trackCount = listed.length;
  const runtime = formatRuntime(releaseDuration(release));
  const others = catalogs.filter((item) => item.slug !== release.slug).slice(0, 4);

  const releaseJsonLd = compact({
    "@context": "https://schema.org",
    "@type": release.type === "Single" ? "MusicSingle" : "MusicAlbum",
    "@id": `${SITE_URL}/releases/${release.slug}#album`,
    name: release.title,
    url: `${SITE_URL}/releases/${release.slug}`,
    description: release.description,
    datePublished: release.releaseDate,
    image: absolute(mediaImageSrc(release)),
    genre: "Alternative Rock",
    byArtist: { "@type": "MusicGroup", "@id": BAND_ID, name: "Albatross" },
    numTracks: trackCount || undefined,
    track: listed.map((item, i) =>
      compact({
        "@type": "MusicRecording",
        position: i + 1,
        name: item.title,
        duration: isoDuration(item.duration),
        byArtist: { "@type": "MusicGroup", "@id": BAND_ID, name: "Albatross" },
      }),
    ),
  });

  return (
    <>
      <JsonLd data={releaseJsonLd} />
      <Breadcrumb
        trail={[
          { label: "Home", href: "/#home" },
          { label: "Music", href: "/#catalog" },
          { label: release.type === "Album" ? "Albums" : "Singles", href: "/#catalog" },
          { label: release.title },
        ]}
      />

      <div className="mx-auto grid max-w-[110rem] grid-cols-1 items-start xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="flex min-w-0 flex-col divide-y divide-border xl:border-r xl:border-border">
          <div className="flex flex-col gap-7 px-5 py-8 md:px-8 md:py-10 lg:flex-row lg:gap-10">
            <Reveal className="w-full max-w-[24rem] shrink-0">
              <Artwork
                release={release}
                sizes="24rem"
                priority
                className="aspect-square w-full rounded-card border border-border shadow-card"
              />
            </Reveal>

            <Reveal delay={0.12} className="min-w-0 flex-1">
              <div className="flex flex-col items-start gap-3">
                <p className="text-label font-semibold uppercase tracking-[0.18em] text-brand">
                  {release.type}
                </p>
                <h1 className="font-display text-page-title text-balance text-foreground">
                  {release.title}
                </h1>
                <p className="text-meta text-muted-foreground">
                  Albatross · {releaseYear(release)}
                  {trackCount > 0 && (
                    <>
                      {" "}
                      · {trackCount} song{trackCount === 1 ? "" : "s"}
                    </>
                  )}
                  {runtime && <> · {runtime}</>}
                </p>
                <p className="text-caption text-muted-foreground">
                  Released {formatDateLabel(release.releaseDate)}
                </p>
                {release.description && (
                  <p className="max-w-[38rem] text-pretty font-editorial text-body italic text-muted-foreground">
                    {release.description}
                  </p>
                )}

                <div className="mt-1 flex flex-col gap-2.5">
                  <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Listen on
                  </p>
                  <div className="flex flex-wrap items-center gap-2.5">

                    <PlayReleaseButton release={release} label="PLAY" />
                    {streamingLinks.map(({ store, href, label, className }) => (
                      <a
                        key={store}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center gap-2 rounded-button px-4 py-3 text-meta font-semibold transition-[background-color,transform] duration-[160ms] ease-entrance active:scale-[0.97] ${className}`}
                      >
                        <StoreIcon store={store} className="size-4" />
                        {label}
                      </a>
                    ))}
                    <a
                      href={morePlatformsHref}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-button border border-primary px-4 py-3 text-meta font-semibold text-brand transition-[background-color,color,transform] duration-[160ms] ease-entrance hover:bg-primary hover:text-primary-foreground active:scale-[0.97]"
                    >
                      MORE PLATFORMS
                    </a>
                  </div>
                </div>

                <div className="mt-2 flex flex-col gap-2">
                  <p className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Share
                  </p>
                  <ShareRow title={release.title} />
                </div>
              </div>
            </Reveal>
          </div>

          {listed.length > 0 && (
            <Block id="tracklist" label="Tracklist">
              <Reveal distance={0} delay={0.08}>
                <TrackList release={release} />
              </Reveal>
            </Block>
          )}

          {videoId && (
            <Block id="watch" label="Watch on YouTube">
              <Reveal distance={0} delay={0.08} className="w-full max-w-[40.625rem]">
                <div className="flex flex-col items-start gap-3.5">
                  <YouTubeEmbed youtubeId={videoId} title={`${release.title} — Albatross`} />
                  <a
                    href={youtubeWatchUrl(videoId)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-button border border-border px-4 py-3 text-meta font-semibold text-foreground transition-[border-color,transform] duration-[160ms] ease-entrance hover:border-brand active:scale-[0.97]"
                  >
                    OPEN IN YOUTUBE ↗
                  </a>
                </div>
              </Reveal>
            </Block>
          )}
        </div>

        {others.length > 0 && (
          <aside
            aria-label="More releases"
            className="min-w-0 border-t border-border xl:border-t-0"
          >
            <MoreFrom releases={others} />
          </aside>
        )}
      </div>
    </>
  );
}
