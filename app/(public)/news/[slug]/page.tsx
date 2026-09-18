import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Artwork } from "@/components/artwork";
import { Block, BlockAction } from "@/components/block";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { PhotoGallery } from "@/components/photo-gallery";
import { Reveal } from "@/components/reveal";
import { ShareRow } from "@/components/share-row";
import { formatDateLabel, mediaImageSrc, type NewsItem } from "@/lib/types";
import { getNewsItem, getNewsItems } from "@/lib/db";
import { BAND_ID, SITE_URL, absolute, compact } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getNewsItems()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const item = await getNewsItem(slug);
  if (!item) return { title: "News — Albatross" };

  const title = `${item.title} — News — Albatross`;
  const image = mediaImageSrc(item);
  return {
    title,
    description: item.teaser,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      title,
      description: item.teaser,
      type: "article",
      publishedTime: item.date,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: item.teaser,
      images: image ? [image] : undefined,
    },
  };
}

function RelatedNews({ items }: { items: NewsItem[] }) {
  return (
    <Block
      id="related-news"
      label="Related news"
      action={<BlockAction href="/news">View all news</BlockAction>}
    >
      <ul className="flex flex-col divide-y divide-border-subtle">
        {items.map((item, i) => (
          <li key={item.slug}>
            <Reveal distance={0} delay={i * 0.06}>
              <Link href={`/news/${item.slug}`} className="group flex items-start gap-3.5 py-3">
                <Artwork
                  release={item}
                  sizes="5rem"
                  className="aspect-[4/3] w-20 shrink-0 rounded-button transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-[1.04]"
                />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-meta font-semibold text-foreground transition-colors group-hover:text-brand">
                    {item.title}
                  </p>
                  {item.date && (
                    <p className="text-caption text-muted-foreground">
                      {formatDateLabel(item.date)}
                    </p>
                  )}
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </Block>
  );
}

export default async function NewsDetailPage({ params }: Props) {
  const slug = (await params).slug;
  const [item, all] = await Promise.all([getNewsItem(slug), getNewsItems()]);
  if (!item) notFound();

  const related = all.filter((other) => other.slug !== item.slug).slice(0, 3);

  const newsJsonLd = compact({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${SITE_URL}/news/${item.slug}#article`,
    headline: item.title,
    description: item.teaser,
    url: `${SITE_URL}/news/${item.slug}`,
    datePublished: item.date,
    image: absolute(mediaImageSrc(item)),

    author: { "@type": "MusicGroup", "@id": BAND_ID, name: "Albatross" },
    publisher: { "@type": "Organization", name: "Albatross", url: SITE_URL },
    mainEntityOfPage: `${SITE_URL}/news/${item.slug}`,
  });

  return (
    <>
      <JsonLd data={newsJsonLd} />
      <Breadcrumb
        trail={[
          { label: "Home", href: "/#home" },
          { label: "News", href: "/news" },
          { label: item.title },
        ]}
      />

      <div className="mx-auto grid max-w-[110rem] grid-cols-1 items-start xl:grid-cols-[minmax(0,1fr)_26rem]">
        <article className="flex min-w-0 flex-col divide-y divide-border xl:border-r xl:border-border">
          <div className="flex flex-col gap-5 px-5 py-8 md:px-8 md:py-10">
            <Reveal distance={0}>
              <div className="flex flex-col gap-3">
                <p className="flex items-center gap-2 text-label font-semibold uppercase tracking-[0.18em] text-brand">
                  News
                  {item.date && (
                    <>
                      <span aria-hidden className="text-border">
                        ·
                      </span>
                      <span className="text-muted-foreground">
                        {formatDateLabel(item.date)}
                      </span>
                    </>
                  )}
                </p>
                <h1 className="max-w-[42rem] font-display text-page-title text-balance text-foreground">
                  {item.title}
                </h1>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <Artwork
                release={item}
                sizes="(min-width: 1280px) 60vw, 100vw"
                className="aspect-[16/9] w-full rounded-card"
              />
            </Reveal>

            <Reveal distance={0} delay={0.16}>

              <div className="flex max-w-[38rem] flex-col gap-4">
                <p className="text-pretty text-lede font-medium leading-relaxed text-foreground">
                  {item.teaser}
                </p>

                <p className="whitespace-pre-line text-pretty text-body leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </Reveal>

            {item.quote && (
              <Reveal distance={0} delay={0.24}>
                <blockquote className="max-w-[34rem] border-l-2 border-primary pl-5">
                  <p className="text-pretty font-editorial text-lede italic text-brand">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  {item.quoteBy && (
                    <footer className="pt-2 text-caption text-muted-foreground">
                      — {item.quoteBy}
                    </footer>
                  )}
                </blockquote>
              </Reveal>
            )}
          </div>

          <PhotoGallery photos={item.photos} id="article-photos" />

          <Block id="share-article" label="Share this article">
            <ShareRow title={item.title} />
          </Block>
        </article>

        {related.length > 0 && (
          <aside aria-label="Related news" className="min-w-0 border-t border-border xl:border-t-0">
            <RelatedNews items={related} />
          </aside>
        )}
      </div>
    </>
  );
}
