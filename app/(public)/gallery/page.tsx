import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Artwork } from "@/components/artwork";
import { Breadcrumb } from "@/components/breadcrumb";
import { GalleryLightbox, GalleryTile } from "@/components/gallery/gallery-lightbox";
import { Reveal } from "@/components/reveal";
import { BentoGridItem } from "@/components/ui/bento-grid";
import { FocusGrid, FocusGridItem } from "@/components/ui/focus-grid";
import { TiltCard } from "@/components/ui/tilt-card";
import { getGalleryImages, getCatalogs } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gallery — Albatross",
  description: "Artwork and stills from Albatross releases and shows.",
  alternates: { canonical: "/gallery" },
};

const spans = [
  "md:col-span-2 md:row-span-2",
  "",
  "",
  "md:row-span-2",
  "",
  "md:col-span-2",
  "",
  "",
];

const span = (i: number) => spans[i] ?? "";

const tileClass = (i: number) =>
  `${span(i)} ${i === 0 ? "col-span-2 row-span-2" : ""}`;

const isWide = (i: number) => span(i).includes("col-span-2");

const tileSizes = (i: number) =>
  `(min-width: 768px) ${isWide(i) ? "50vw" : "25vw"}, ${i === 0 ? "100vw" : "50vw"}`;

export default async function GalleryPage() {
  const [gallery, releases] = await Promise.all([getGalleryImages(), getCatalogs()]);

  return (
    <>
      <Breadcrumb trail={[{ label: "Home", href: "/#home" }, { label: "Gallery" }]} />

      <div className="mx-auto max-w-[110rem] px-5 pb-16 pt-6 md:px-8">
        <Reveal distance={0}>
          <h1 className="pb-6 font-display text-page-title text-foreground">
            GALLERY
          </h1>
        </Reveal>

        <GalleryLightbox photos={gallery}>
        <FocusGrid>
        {gallery.length > 0
          ? gallery.map((photo, i) => (
              <FocusGridItem key={photo.slug} index={i} className={`${tileClass(i)} size-full`}>
                <Reveal delay={(i % 4) * 0.08} className="size-full">
                  <TiltCard className="size-full">
                    <GalleryTile index={i} title={photo.title}>
                      <BentoGridItem title={photo.title} description={photo.description}>
                        <Image
                          src={photo.image}
                          alt={photo.title}
                          fill
                          sizes={tileSizes(i)}

                          priority={i === 0}
                          className="animate-fade-in object-cover"
                        />
                      </BentoGridItem>
                    </GalleryTile>
                  </TiltCard>
                </Reveal>
              </FocusGridItem>
            ))
          : releases.map((release, i) => (
              <FocusGridItem key={release.slug} index={i} className={`${tileClass(i)} size-full`}>
                <Reveal delay={(i % 4) * 0.08} className="size-full">
                  <TiltCard className="size-full">
                    <Link href={`/releases/${release.slug}`} className="block size-full">
                      <BentoGridItem title={release.title} description={release.description}>
                        <Artwork release={release} sizes={tileSizes(i)} className="size-full" />
                      </BentoGridItem>
                    </Link>
                  </TiltCard>
                </Reveal>
              </FocusGridItem>
              ))}
        </FocusGrid>
        </GalleryLightbox>
      </div>
    </>
  );
}
