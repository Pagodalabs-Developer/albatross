import { CatalogSection } from "@/components/home/catalog-section";
import { EventsSection } from "@/components/home/events-section";
import { GalleryStrip } from "@/components/home/gallery-strip";
import { HeroSection } from "@/components/home/hero-section";
import {
  LatestReleaseSection,
  UpcomingReleaseSection,
} from "@/components/home/latest-release-section";
import { NewsSection } from "@/components/home/news-section";
import { NextShowStrip } from "@/components/home/next-show-strip";
import { PeopleSection } from "@/components/home/people-section";
import { StorySection } from "@/components/home/story-section";
import { JsonLd } from "@/components/json-ld";
import { getCrew, getEvents, getCatalogs, getMembers } from "@/lib/db";
import { BAND_ID, SITE_URL } from "@/lib/seo";
import { DEFAULT_MISSION, bandLinks, slugify } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function Home() {
  const [events, releases, members, crew] = await Promise.all([
    getEvents(),
    getCatalogs(),
    getMembers(),
    getCrew(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": BAND_ID,
    name: "Albatross",
    url: SITE_URL,
    genre: "Alternative Rock",
    description: DEFAULT_MISSION,
    foundingDate: "1998",
    foundingLocation: {
      "@type": "Place",
      name: "Kathmandu, Nepal",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kathmandu",
        addressCountry: "NP",
      },
    },
    sameAs: [
      bandLinks.spotify,
      bandLinks.appleMusic,
      bandLinks.youtube,
      bandLinks.bandcamp,
      "https://www.instagram.com/albatrossnepal/",
      "https://www.facebook.com/albatrossnepal",
      "https://x.com/albatrossnepal",
      "https://en.wikipedia.org/wiki/Albatross_(Nepali_band)",
    ],
    member: members.map((person) => ({
      "@type": "Person",
      "@id": `${SITE_URL}/band/${slugify(person.name)}#person`,
      name: person.name,
      url: `${SITE_URL}/band/${slugify(person.name)}`,
      ...(person.role ? { jobTitle: person.role } : {}),
    })),
    album: releases
      .filter((release) => release.type === "Album")
      .map((release) => ({
        "@type": "MusicAlbum",
        "@id": `${SITE_URL}/releases/${release.slug}#album`,
        name: release.title,
        url: `${SITE_URL}/releases/${release.slug}`,
        datePublished: release.releaseDate,
      })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />

      <div className="flex flex-col gap-2 pb-4 md:gap-4">
        <HeroSection />
        <NextShowStrip events={events} />
        <UpcomingReleaseSection />
        <CatalogSection releases={releases} />
        <PeopleSection id="band" heading="The band" people={members} />
        <PeopleSection id="crew" heading="The crew" people={crew} />

        <div className="mx-auto grid w-full max-w-[110rem] grid-cols-1 gap-4 px-5 md:px-8 lg:grid-cols-2">
          <div className="rounded-card border border-border bg-surface transition-colors duration-theme">
            <LatestReleaseSection />
          </div>
          <div className="rounded-card border border-border bg-surface transition-colors duration-theme">

            <StorySection delay={0.1} />
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-[110rem] grid-cols-1 gap-4 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="rounded-card border border-border bg-surface transition-colors duration-theme">
            <NewsSection />
          </div>
          <div className="rounded-card border border-border bg-surface transition-colors duration-theme">
            <GalleryStrip delay={0.1} />
          </div>
        </div>

        <EventsSection events={events} />
      </div>
    </>
  );
}
