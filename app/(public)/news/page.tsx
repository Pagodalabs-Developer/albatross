import type { Metadata } from "next";
import { Breadcrumb } from "@/components/breadcrumb";
import { Reveal } from "@/components/reveal";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { getNewsItems } from "@/lib/db";

export const metadata: Metadata = {
  title: "News — Albatross",
  description: "All the latest news from Albatross.",
  alternates: { canonical: "/news" },
};

export default async function NewsPage() {
  const news = await getNewsItems();

  return (
    <>
      <Breadcrumb trail={[{ label: "Home", href: "/#home" }, { label: "News" }]} />

      <div className="mx-auto max-w-[110rem] px-5 pb-16 pt-6 md:px-8">
        <Reveal distance={0}>
          <h1 className="pb-6 font-display text-page-title text-foreground">
            LATEST NEWS
          </h1>
        </Reveal>

        <Reveal distance={0} delay={0.08}>
          <HoverEffect
            id="news-list"
            items={news.map((item) => ({
              href: `/news/${item.slug}`,
              title: item.title,
              description: item.teaser,
              image: item.image,
              videoUrl: item.videoUrl,
            }))}
          />
        </Reveal>
      </div>
    </>
  );
}
