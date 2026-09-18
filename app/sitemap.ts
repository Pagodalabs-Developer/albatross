import type { MetadataRoute } from "next";
import { slugify } from "@/lib/types";
import { getCatalogs, getCrew, getEvents, getMembers, getNewsItems } from "@/lib/db";

function lastModified(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  const [events, catalogs, news, members, crew] = await Promise.all([
    getEvents(),
    getCatalogs(),
    getNewsItems(),
    getMembers(),
    getCrew(),
  ]);

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },

    { url: `${base}/news`, changeFrequency: "weekly" as const },
    { url: `${base}/gallery`, changeFrequency: "monthly" as const },
    ...events.map((e) => ({
      url: `${base}/events/${e.slug}`,
      lastModified: lastModified(e.date),
      changeFrequency: "monthly" as const,
    })),
    ...catalogs.map((c) => ({
      url: `${base}/releases/${c.slug}`,
      lastModified: lastModified(c.releaseDate),
      changeFrequency: "monthly" as const,
    })),
    ...news.map((n) => ({
      url: `${base}/news/${n.slug}`,
      lastModified: lastModified(n.date),
      changeFrequency: "monthly" as const,
    })),

    ...[...members, ...crew].map((p) => ({
      url: `${base}/band/${slugify(p.name)}`,
      changeFrequency: "monthly" as const,
    })),
  ];
}
