import Link from "next/link";
import { Artwork } from "@/components/artwork";
import { Block, BlockAction } from "@/components/block";
import { Reveal } from "@/components/reveal";
import { getNewsItems } from "@/lib/db";
import { formatDateLabel, type NewsItem } from "@/lib/types";

function StoryRow({ item }: { item: NewsItem }) {
  return (
    <Link href={`/news/${item.slug}`} className="group flex items-center gap-4 py-3">
      <Artwork
        release={item}
        sizes="4.5rem"
        className="aspect-[4/3] w-[4.5rem] shrink-0 rounded-button transition-transform duration-300 ease-entrance motion-safe:group-hover:scale-[1.04]"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-meta font-semibold uppercase text-foreground">
          <span className="relative inline">
            {item.title}
            <span
              aria-hidden
              className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-brand transition-transform duration-[220ms] ease-entrance group-hover:scale-x-100"
            />
          </span>
        </p>
        <p className="truncate text-caption text-muted-foreground">{item.teaser}</p>
      </div>

      {item.date && (
        <p className="shrink-0 text-caption tabular-nums text-muted-foreground">
          {formatDateLabel(item.date)}
        </p>
      )}
    </Link>
  );
}

export async function NewsSection({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const news = await getNewsItems();
  if (news.length === 0) return null;

  return (
    <Block
      id="news"
      label="Latest news"
      action={<BlockAction href="/news">View all news</BlockAction>}
      className={className}
      delay={delay}
    >
      <ul className="flex flex-col divide-y divide-border-subtle">
        {news.slice(0, 4).map((item, i) => (

          <li key={item.slug}>

            <Reveal distance={0} delay={i * 0.06}>
              <StoryRow item={item} />
            </Reveal>
          </li>
        ))}
      </ul>
    </Block>
  );
}
