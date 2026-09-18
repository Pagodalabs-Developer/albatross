import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb";
import { JsonLd } from "@/components/json-ld";
import { PersonCredits } from "@/components/person-credits";
import { PhotoGallery } from "@/components/photo-gallery";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { SocialIcon } from "@/components/social-icon";
import { isEmptyRichText } from "@/lib/rich-text";
import {
  DEFAULT_GRADIENT,
  memberPortrait,
  peopleListLabels,
  slugify,
  socialLabels,
} from "@/lib/types";
import { getCatalogs, getCrew, getMembers, getPerson } from "@/lib/db";
import { BAND_ID, SITE_URL, absolute, compact } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const [members, crew] = await Promise.all([getMembers(), getCrew()]);
  return [...members, ...crew].map(({ name }) => ({ slug: slugify(name) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const found = await getPerson(slug);
  if (!found) return { title: "Band — Albatross" };

  const { person } = found;
  const portrait = memberPortrait(person);
  const title = `${person.name} — Albatross`;
  const description = `${person.name} — ${person.role}`;
  return {
    title,
    description,
    alternates: { canonical: `/band/${slug}` },
    openGraph: {
      title,
      description,
      type: "profile",
      images: portrait ? [{ url: portrait }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: portrait ? [portrait] : undefined,
    },
  };
}

export default async function PersonDetailPage({ params }: Props) {
  const found = await getPerson((await params).slug);
  if (!found) notFound();

  const { person, group } = found;

  const labels = peopleListLabels(group);
  const isCrew = group === "crew";
  const photos = person.photos ?? [];
  const portrait = memberPortrait(person);

  const catalogs = person.credits?.length ? await getCatalogs() : [];

  const personJsonLd = compact({
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/band/${slugify(person.name)}#person`,
    name: person.name,
    url: `${SITE_URL}/band/${slugify(person.name)}`,
    jobTitle: person.role,
    image: absolute(portrait),
    memberOf: { "@type": "MusicGroup", "@id": BAND_ID, name: "Albatross" },
  });

  return (
    <>
      <JsonLd data={personJsonLd} />
      <Breadcrumb
        trail={[
          { label: "Home", href: "/#home" },
          { label: isCrew ? "Crew" : "Band", href: isCrew ? "/#crew" : "/#band" },
          { label: person.name },
        ]}
      />

      <div className="mx-auto flex max-w-[110rem] flex-col divide-y divide-border">
        <div className="flex flex-col gap-7 px-5 py-8 md:px-8 md:py-10 lg:flex-row lg:gap-10">
          <Reveal className="w-full max-w-[24rem] shrink-0">
            <div
              className="relative aspect-[3/4] w-full overflow-hidden rounded-card"
              style={{ backgroundImage: DEFAULT_GRADIENT }}
            >
              {portrait && (
                <Image
                  src={portrait}
                  alt={person.name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 24rem, 100vw"
                  className="object-cover"
                />
              )}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="min-w-0 flex-1">
            <div className="flex flex-col items-start gap-3">
              <h1 className="font-display text-page-title text-balance text-foreground">
                {person.name}
              </h1>
              <p className="text-label font-semibold uppercase tracking-[0.18em] text-brand">
                {person.role}
              </p>
              {person.joined && (
                <p className="text-caption text-muted-foreground">Joined {person.joined}</p>
              )}
              {isEmptyRichText(person.about) ? (
                <p className="max-w-[38rem] text-body leading-relaxed text-muted-foreground">
                  More about {person.name} coming soon.
                </p>
              ) : (
                <RichText
                  value={person.about ?? ""}
                  className="max-w-[38rem] text-pretty text-body leading-relaxed text-muted-foreground"
                />
              )}

              {person.skills && person.skills.length > 0 && (
                <div className="mt-2 flex w-full flex-col gap-2">
                  <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-brand">
                    {labels.skills}
                  </h2>
                  <ul className="flex flex-col gap-1.5">
                    {person.skills.map((item) => (
                      <li key={item} className="flex items-baseline gap-2.5">
                        <span
                          aria-hidden
                          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                        />
                        <span className="text-meta text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {person.credits && person.credits.length > 0 && (
                <div className="mt-2 flex w-full max-w-[32rem] flex-col gap-2">
                  <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-brand">
                    {labels.credits}
                  </h2>
                  <PersonCredits credits={person.credits} catalogs={catalogs} />
                </div>
              )}

              {person.socials && person.socials.length > 0 && (
                <div className="mt-2 flex flex-col gap-2">
                  <h2 className="text-label font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Follow {person.name.split(" ")[0]}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1">
                    {person.socials.map(({ platform, url }) => (
                      <a
                        key={platform + url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${person.name} on ${socialLabels[platform]}`}
                        className="flex size-11 items-center justify-center rounded-button text-muted-foreground transition-[color,transform] duration-[160ms] ease-entrance hover:text-brand active:scale-[0.92]"
                      >
                        <SocialIcon platform={platform} className="size-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <PhotoGallery photos={photos} />

      </div>
    </>
  );
}
