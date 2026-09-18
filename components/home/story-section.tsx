import Image from "next/image";
import { Block } from "@/components/block";
import { Reveal } from "@/components/reveal";
import { RichText } from "@/components/rich-text";
import { isEmptyRichText } from "@/lib/rich-text";
import { getSiteSettings } from "@/lib/db";

export async function StorySection({ className = "", delay = 0 }: { className?: string; delay?: number }) {
  const { storyHeading, story, storyImage } = await getSiteSettings();
  if (isEmptyRichText(story)) return null;

  return (
    <Block id="about" label="Our story" className={className}
      delay={delay}>
      <Reveal delay={0.08}>
        <div className="flex flex-col gap-5">
          {storyImage && (
            <Image
              src={storyImage}

              alt={`Albatross — ${storyHeading}`}
              width={720}
              height={420}
              className="aspect-[16/10] w-full rounded-card object-cover"
            />
          )}
          <div className="flex flex-col gap-3">
            <p className="font-display text-headline text-foreground">{storyHeading}</p>
            <RichText
              value={story}
              className="max-w-[38rem] text-pretty text-body leading-relaxed text-muted-foreground"
            />
          </div>
        </div>
      </Reveal>
    </Block>
  );
}
